# DIAGNOSIS: Message Persistence Failure — Root Cause Analysis

**Story:** 12.1 — Diagnose Message Persistence: Instrument & Reproduce  
**Date:** 2026-02-20  
**Analyst:** Amelia (BMAD dev agent)

---

## Summary

Messages in SlackLite send optimistically (they appear in the UI immediately) but are **never actually saved** because the RTDB write is always denied by a security rule that references an RTDB path that the app never writes to. This causes the optimistic message to be rolled back silently — the error was swallowed in `MessageInput.tsx`. Users see the message flash and disappear, or see a retry banner they may not notice.

---

## Root Causes (Ranked by Severity)

### 🔴 ROOT CAUSE 1 (PRIMARY): RTDB write rule reads from RTDB `/users/` — which is never populated

**File:** `database.rules.json`  
**Rule path:** `messages/$workspaceId/$channelId/.write`

```json
".write": "auth != null && root.child('users').child(auth.uid).child('workspaceId').val() == $workspaceId"
```

This rule checks `root.child('users').child(auth.uid).child('workspaceId')` in **Realtime Database**.

**The app never writes user data to the RTDB `/users/` node.** User data (including `workspaceId`) is stored exclusively in **Firestore** at `users/{uid}`. The RTDB `/users/` path is always empty.

As a result:
- `root.child('users').child(auth.uid).child('workspaceId').val()` always returns `null`
- `null == $workspaceId` always evaluates to `false`
- **Every single RTDB message write is denied with a permission error**

This is the single cause of the "messages disappear / never appear to other users" symptom.

**Reproduction:**
1. Sign in as a valid workspace member
2. Navigate to any channel
3. Type a message and press Send
4. The message appears briefly (optimistic UI)
5. The RTDB `set()` throws a permission-denied error
6. The optimistic message is rolled back from the UI
7. Browser DevTools Console shows `[DIAG][RTDB write] FAILED` (after story 12.1 instrumentation is deployed)

**Fix (story 12.2):** Write the user's `workspaceId` to RTDB `users/{uid}/workspaceId` whenever the user joins or creates a workspace — or update the RTDB rule to use a different auth mechanism (e.g., custom claims, or remove the workspaceId check and rely on token-based auth only).

---

### 🟠 ROOT CAUSE 2 (CONTRIBUTING): `MessageInput.tsx` silently swallows all send errors

**File:** `components/features/messages/MessageInput.tsx`  
**Function:** `handleSend`

**Before instrumentation (story 12.1):**
```typescript
void Promise.resolve(onSend(sanitizedText)).catch(() => undefined);
```

The `.catch(() => undefined)` discards ALL errors from the send pipeline. Users receive no feedback when the RTDB write fails (beyond a retry banner that may not be prominent enough). This masked root cause 1 during development.

**After story 12.1 instrumentation:**
```typescript
void Promise.resolve(onSend(sanitizedText))
  .then((result) => {
    console.log('[DIAG][MessageInput] onSend SUCCESS — channelId:', channelId, 'result:', result);
  })
  .catch((sendError: unknown) => {
    console.error('[DIAG][MessageInput] onSend FAILED — channelId:', channelId, 'error:', sendError);
  });
```

**Fix (story 12.2):** Surface the error to the user more prominently — at minimum, keep the `console.error` and consider re-enabling a visible error state.

---

### 🟡 ROOT CAUSE 3 (SECONDARY): `useMessages.ts` silently skips Firestore subscription if `user.workspaceId` is absent

**File:** `lib/hooks/useMessages.ts`

```typescript
const workspaceId =
  typeof user?.workspaceId === "string" ? user.workspaceId.trim() : "";
// ...
if (workspaceId.length === 0 || normalizedTargetId.length === 0) {
  setLoading(false);
  setHasMore(false);
  return;  // ← subscription silently skipped, no error surfaced
}
```

`workspaceId` is derived from `user?.workspaceId`, which comes from the `AuthContext`'s Firestore `getDoc()` call at sign-in. If:
- the user was created before joining a workspace (sign-up flow without workspace creation), OR
- the Firestore `getDoc` fails silently (it swallows errors via fallback to `mergeUser(firebaseUser)` without userData)

...then `user.workspaceId` is undefined, `workspaceId === ""`, and the Firestore message listener is never attached. The channel appears empty.

**Confirmed in `AuthContext.tsx`:**
```typescript
} catch (error) {
  console.error("Failed to fetch user document from Firestore.", error);
  if (isMountedRef.current) {
    setUser(mergeUser(firebaseUser));  // ← userData omitted, no workspaceId
  }
}
```

**Fix:** Ensure `workspaceId` is set on the user doc at sign-up or workspace join, and surface a diagnostic error when the subscription is skipped (rather than silently returning early).

---

### 🟡 ROOT CAUSE 4 (LATENT RISK): Firestore `isWorkspaceMember()` does a `get()` inside the rule

**File:** `firestore.rules`

```javascript
function requesterWorkspaceId() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.workspaceId;
}

function isWorkspaceMember(workspaceId) {
  return requesterUserDocExists() &&
         requesterWorkspaceId() == workspaceId;
}
```

Two Firestore reads are performed on every message write rule evaluation:
1. `exists()` to check if the user doc exists
2. `get()` to read `workspaceId` from the user doc

**Risk:** If the user doc doesn't exist, `get().data.workspaceId` throws a rule evaluation error (not just `false`), which shows up in Firebase logs as a `PERMISSION_DENIED` with an internal error. This is harder to debug. Additionally, double `get()` calls add latency.

**Note:** This is NOT the current primary cause (since RTDB writes fail first), but it will become relevant once RTDB is fixed (story 12.2).

---

## Confirmation: Which Writes Succeed vs. Fail

| Write                    | Outcome         | Reason                                                    |
|--------------------------|-----------------|-----------------------------------------------------------|
| RTDB message write       | ❌ ALWAYS FAILS | `database.rules.json` reads RTDB `/users/` which is empty |
| Firestore message write  | ⚠️ NEVER RUNS  | RTDB write fails first; Firestore write is not attempted   |
| Firestore listener read  | ✅ Subscribes   | If `user.workspaceId` is populated AND rule `isWorkspaceMember` passes |
| RTDB listener (onChildAdded) | ⚠️ Receives nothing | Nothing is ever written to RTDB                     |

---

## Reproduction Steps

1. Start the app: `pnpm dev`
2. Sign in as a workspace member
3. Navigate to a channel
4. Open DevTools → Console
5. Type a message and send
6. Observe: `[DIAG][RTDB write] FAILED — error: FirebaseError: PERMISSION_DENIED`
7. The message disappears from the UI (optimistic rollback)
8. The `[DIAG][MessageInput] onSend FAILED` log also appears

---

## Expected Console Output After Instrumentation

```
[DIAG][MessageInput] onSend called — channelId: abc123 textLength: 12
[DIAG][RTDB write] path: messages/ws-xyz/abc123/msg-id workspaceId: ws-xyz channelId: abc123 userId: uid-111 payload: {...}
[DIAG][RTDB write] FAILED — messageId: msg-id error: FirebaseError: PERMISSION_DENIED: Permission denied
[DIAG][MessageInput] onSend FAILED — channelId: abc123 error: Error: Message failed to send. Retry?
```

---

## Files Changed in This Story

| File | Change |
|------|--------|
| `lib/hooks/useRealtimeMessages.ts` | Added `[DIAG]` logging around RTDB and Firestore writes |
| `lib/hooks/useMessages.ts` | Added `[DIAG]` logging on Firestore subscription path and snapshot errors |
| `components/features/messages/MessageInput.tsx` | Replaced silent `.catch(() => undefined)` with diagnostic `.then()/.catch()` logging |
| `DIAGNOSIS.md` | This file — root cause documentation |

---

## Next Stories

- **12.2:** Fix RTDB rule — write `workspaceId` to RTDB `users/{uid}` at workspace join/create (or update RTDB rules to not require it)
- **12.3:** Fix Firestore write fallback — ensure `persistMessageToFirestore` is always attempted even on RTDB success
- **12.4:** Fix `useMessages.ts` — surface error when `workspaceId` is missing rather than silently skipping
- **12.5:** E2E smoke test — send a message, verify it persists in Firestore and loads after page refresh
