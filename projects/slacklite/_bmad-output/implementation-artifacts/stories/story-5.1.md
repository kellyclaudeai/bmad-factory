# Story 5.1: Display Workspace Members in Sidebar

**Epic:** Epic 5 - Direct Messages (1-on-1)

**Description:**
Fetch all users in current workspace, display in collapsible Members section in sidebar with online/offline indicators and proper sorting (online first).

**Acceptance Criteria:**
- [ ] Create `lib/hooks/useWorkspaceMembers.ts`
- [ ] Query: `query(collection(db, 'users'), where('workspaceId', '==', currentWorkspaceId))`
- [ ] Real-time listener: `onSnapshot` to detect new members, removed members
- [ ] Sort: Online users first, then offline, alphabetically within each group
- [ ] Create `components/features/sidebar/MemberList.tsx`
- [ ] Render: 24px avatar + name + online indicator (10px dot)
- [ ] Collapsible section: "Members (8) ▾" (click to expand/collapse)
- [ ] Current user marked: "{name} (You)"
- [ ] Empty state: "No other members yet. Invite your team!"

**Dependencies:**
dependsOn: ["3.1", "1.4"]

**Technical Notes:**
- useWorkspaceMembers hook:
  ```typescript
  import { collection, query, where, onSnapshot } from 'firebase/firestore';

  export function useWorkspaceMembers() {
    const { user } = useAuth();
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!user?.workspaceId) return;

      const q = query(
        collection(firestore, 'users'),
        where('workspaceId', '==', user.workspaceId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const memberData = snapshot.docs.map(doc => doc.data() as User);
        
        // Sort: Online first, then offline, alphabetically
        const sorted = memberData.sort((a, b) => {
          if (a.isOnline !== b.isOnline) {
            return a.isOnline ? -1 : 1;
          }
          return a.displayName.localeCompare(b.displayName);
        });

        setMembers(sorted);
        setLoading(false);
      });

      return unsubscribe;
    }, [user?.workspaceId]);

    return { members, loading };
  }
  ```
- MemberList component:
  ```tsx
  export default function MemberList() {
    const { members, loading } = useWorkspaceMembers();
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
      <div className="mt-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full text-left px-3 py-2 text-xs uppercase text-gray-700 font-semibold"
        >
          Members ({members.length}) {isCollapsed ? '▸' : '▾'}
        </button>
        
        {!isCollapsed && (
          <ul className="space-y-1">
            {members.map(member => (
              <li key={member.userId} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-200 rounded cursor-pointer">
                <div className="relative">
                  <Avatar user={member} size="small" />
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${member.isOnline ? 'bg-success' : 'bg-gray-600'}`} />
                </div>
                <span className="text-sm text-gray-900">
                  {member.displayName} {member.userId === user.uid && '(You)'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  ```

**Estimated Effort:** 2 hours
