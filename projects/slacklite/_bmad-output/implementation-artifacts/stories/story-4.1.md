# Story 4.1: Create Message Data Models

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Define TypeScript interfaces for Message, create Firestore schema, and set up dual-write pattern (RTDB + Firestore) data structures with proper type safety.

**Acceptance Criteria:**
- [ ] Create `lib/types/models.ts` with Message interface:
  ```typescript
  interface Message {
    messageId: string;
    channelId: string;
    workspaceId: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: Timestamp;
    createdAt: Timestamp;
    status?: 'sending' | 'sent' | 'failed';
  }
  ```
- [ ] Firestore path: `/workspaces/{workspaceId}/channels/{channelId}/messages/{messageId}`
- [ ] RTDB path: `/messages/{workspaceId}/{channelId}/{messageId}`
- [ ] Document structure validated (all required fields present)

**Dependencies:**
dependsOn: ["1.4"]

**Technical Notes:**
- Message data model (lib/types/models.ts):
  ```typescript
  import { Timestamp } from 'firebase/firestore';

  export interface Message {
    messageId: string;           // Auto-generated or temp ID
    channelId: string;           // Parent channel
    workspaceId: string;         // Denormalized for security
    userId: string;              // Author
    userName: string;            // Denormalized for display
    text: string;                // Message content (1-4000 chars)
    timestamp: Timestamp;        // Server timestamp
    createdAt: Timestamp;        // Client timestamp (optimistic UI)
    status?: 'sending' | 'sent' | 'failed'; // Client-side only
  }

  export interface RTDBMessage {
    userId: string;
    userName: string;
    text: string;
    timestamp: number;           // Unix timestamp (ms)
    ttl: number;                 // Expiry timestamp (1 hour)
  }
  ```
- Firestore structure:
  - Path: `/workspaces/{workspaceId}/channels/{channelId}/messages/{messageId}`
  - Subcollection of channels for automatic security scoping
- RTDB structure:
  - Path: `/messages/{workspaceId}/{channelId}/{messageId}`
  - Flat structure for fast real-time delivery
  - TTL: 1 hour expiry (auto-delete)
- Validation:
  - Text length: 1-4000 characters
  - All required fields present
  - workspaceId matches channel's workspace

**Estimated Effort:** 1 hour
