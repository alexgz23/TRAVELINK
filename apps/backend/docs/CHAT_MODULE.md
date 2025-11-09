# Chat Module - Real-time Messaging

## Overview

The Chat Module provides real-time messaging capabilities for Viajero Conectado platform using WebSockets (Socket.IO). It enables users to communicate instantly with each other through text messages, images, files, audio, video, and location sharing.

## Architecture

### Technology Stack
- **WebSockets**: Socket.IO for bidirectional real-time communication
- **Database**: MongoDB for chat data (conversations and messages)
- **Authentication**: JWT tokens for WebSocket connections
- **Transport**: REST API + WebSocket events

### Components

1. **ChatGateway** (`chat.gateway.ts`)
   - Handles WebSocket connections and events
   - Manages user presence (online/offline)
   - Implements real-time event broadcasting

2. **ChatService** (`chat.service.ts`)
   - Business logic for chat operations
   - Message and conversation management
   - Read receipts and delivery status

3. **ChatController** (`chat.controller.ts`)
   - REST endpoints for chat history
   - Conversation management
   - Message operations (CRUD)

4. **MongoDB Schemas**
   - **Conversation**: Stores conversation metadata
   - **Message**: Stores individual messages

## Features

### ✅ Real-time Messaging
- Instant message delivery via WebSockets
- Message types: text, image, file, audio, video, location, system
- Reply/threading support
- Message editing and soft delete

### ✅ Conversation Management
- 1-on-1 conversations
- Group conversations
- Automatic conversation creation
- Participant tracking

### ✅ Message Status Tracking
- Sent
- Delivered (with recipient list)
- Read (with recipient list and timestamp)
- Failed

### ✅ Real-time Indicators
- Typing indicators
- User online/offline status
- Message status updates

### ✅ Read Receipts
- Per-message read tracking
- Bulk conversation read marking
- Read timestamps

### ✅ Security
- JWT authentication for WebSocket connections
- User authorization for conversations
- Participant verification

## WebSocket Events

### Client → Server

#### `message:send`
Send a new message
```typescript
{
  conversationId: string;
  type?: MessageType;
  content: string;
  replyTo?: string;
  metadata?: {
    filename?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    thumbnailUrl?: string;
    latitude?: number;
    longitude?: number;
  };
}
```

#### `message:typing`
Send typing indicator
```typescript
{
  conversationId: string;
  isTyping: boolean;
}
```

#### `message:delivered`
Mark message as delivered
```typescript
{
  messageId: string;
}
```

#### `message:read`
Mark message as read
```typescript
{
  messageId: string;
}
```

#### `conversation:read`
Mark entire conversation as read
```typescript
{
  conversationId: string;
}
```

#### `conversation:join`
Join a conversation room
```typescript
{
  conversationId: string;
}
```

#### `conversation:leave`
Leave a conversation room
```typescript
{
  conversationId: string;
}
```

### Server → Client

#### `message:new`
New message received
```typescript
{
  message: Message;
  conversationId: string;
}
```

#### `user:typing`
User is typing
```typescript
{
  userId: string;
  conversationId: string;
  isTyping: boolean;
}
```

#### `message:status`
Message status updated
```typescript
{
  messageId: string;
  status: MessageStatus;
  deliveredTo?: string[];
  readBy?: string[];
}
```

#### `conversation:read`
Conversation marked as read
```typescript
{
  conversationId: string;
  userId: string;
}
```

#### `user:online`
User came online
```typescript
{
  userId: string;
}
```

#### `user:offline`
User went offline
```typescript
{
  userId: string;
}
```

## REST API Endpoints

All endpoints require JWT authentication (`Authorization: Bearer <token>`)

### Conversations

#### `POST /api/v1/chat/conversations`
Create a new conversation
```json
{
  "participants": ["userId1", "userId2"],
  "isGroup": false,
  "groupName": "Optional Group Name",
  "groupAvatar": "https://..."
}
```

#### `GET /api/v1/chat/conversations`
Get all user conversations

#### `GET /api/v1/chat/conversations/:id`
Get conversation details

#### `GET /api/v1/chat/conversations/:id/messages`
Get conversation messages
- Query params: `limit` (default: 50), `offset` (default: 0)

#### `PATCH /api/v1/chat/conversations/:id/read`
Mark conversation as read

### Messages

#### `POST /api/v1/chat/messages`
Send a message (also available via WebSocket)
```json
{
  "conversationId": "...",
  "type": "text",
  "content": "Hello!",
  "replyTo": "messageId" // optional
}
```

#### `PATCH /api/v1/chat/messages/:id`
Edit a message
```json
{
  "content": "Updated content"
}
```

#### `DELETE /api/v1/chat/messages/:id`
Delete a message (soft delete)

#### `PATCH /api/v1/chat/messages/:id/read`
Mark message as read

#### `PATCH /api/v1/chat/messages/:id/delivered`
Mark message as delivered

## Client Integration

### WebSocket Connection

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to chat');
});

socket.on('disconnect', () => {
  console.log('Disconnected from chat');
});

// Message events
socket.on('message:new', (data) => {
  console.log('New message:', data.message);
});

socket.on('user:typing', (data) => {
  console.log(`User ${data.userId} is typing...`);
});

// Send message
socket.emit('message:send', {
  conversationId: '...',
  content: 'Hello!'
}, (response) => {
  if (response.success) {
    console.log('Message sent:', response.message);
  }
});

// Typing indicator
socket.emit('message:typing', {
  conversationId: '...',
  isTyping: true
});
```

### REST API Example

```typescript
// Get conversations
const response = await fetch('/api/v1/chat/conversations', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const conversations = await response.json();

// Get messages
const messages = await fetch(`/api/v1/chat/conversations/${conversationId}/messages?limit=50`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Data Models

### Conversation Schema
```typescript
{
  participants: string[]; // User IDs
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupAdmin?: string; // User ID
  lastMessage?: ObjectId; // Reference to Message
  lastMessageAt?: Date;
  readBy: Map<string, Date>; // userId -> lastReadAt
  mutedBy: Map<string, boolean>; // userId -> isMuted
  blockedBy: string[]; // User IDs
  createdAt: Date;
  updatedAt: Date;
}
```

### Message Schema
```typescript
{
  conversationId: ObjectId; // Reference to Conversation
  senderId: string; // User ID
  type: MessageType; // text, image, file, audio, video, location, system
  content: string; // Text or URL
  status: MessageStatus; // sent, delivered, read, failed
  readBy: string[]; // User IDs
  readAt?: Date;
  deliveredTo: string[]; // User IDs
  deliveredAt?: Date;
  replyTo?: ObjectId; // Reference to Message
  metadata?: {
    filename?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    thumbnailUrl?: string;
    latitude?: number;
    longitude?: number;
  };
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Database Indexes

### Conversation Indexes
```typescript
{ participants: 1 }
{ lastMessageAt: -1 }
{ participants: 1, isGroup: 1 }
```

### Message Indexes
```typescript
{ conversationId: 1, createdAt: -1 }
{ senderId: 1 }
{ status: 1 }
{ conversationId: 1, status: 1 }
```

## Environment Variables

```bash
# MongoDB connection (required for chat)
MONGODB_URI=mongodb://localhost:27017/viajero-conectado

# JWT secret (required for WebSocket auth)
JWT_SECRET=your-secret-key

# Frontend URL for CORS (optional)
FRONTEND_URL=http://localhost:4200
```

## Best Practices

### Client-Side

1. **Connection Management**
   - Reconnect on disconnect
   - Handle connection errors gracefully
   - Clean up listeners on unmount

2. **Message Sending**
   - Implement optimistic updates
   - Handle send failures
   - Queue messages while offline

3. **Read Receipts**
   - Mark messages as read when visible
   - Batch read updates
   - Update UI based on delivery status

4. **Typing Indicators**
   - Debounce typing events (500ms)
   - Clear indicator after timeout
   - Show multi-user typing state

### Server-Side

1. **Room Management**
   - Users auto-join conversation rooms
   - Broadcast to rooms, not individual sockets
   - Clean up empty rooms

2. **Error Handling**
   - All event handlers return `{success, error}`
   - Log errors with context
   - Don't crash on invalid data

3. **Performance**
   - Use indexes for queries
   - Limit message history fetches
   - Paginate conversations

## Testing

### Manual Testing

1. **WebSocket Connection**
   ```bash
   # Use a WebSocket client or browser console
   const socket = io('http://localhost:3000/chat', {
     auth: { token: 'your-jwt-token' }
   });
   ```

2. **Send Test Message**
   ```javascript
   socket.emit('message:send', {
     conversationId: 'conversation-id',
     content: 'Test message'
   }, console.log);
   ```

3. **Monitor Events**
   ```javascript
   socket.onAny((event, ...args) => {
     console.log(event, args);
   });
   ```

### API Testing

```bash
# Create conversation
curl -X POST http://localhost:3000/api/v1/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"participants": ["user1", "user2"]}'

# Get conversations
curl http://localhost:3000/api/v1/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get messages
curl http://localhost:3000/api/v1/chat/conversations/CONVERSATION_ID/messages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Future Enhancements

- [ ] File upload integration (S3/CloudFlare R2)
- [ ] Voice/video calling (WebRTC)
- [ ] Message reactions
- [ ] Message forwarding
- [ ] Search in conversations
- [ ] Push notifications for offline users
- [ ] Message encryption (end-to-end)
- [ ] Conversation archiving
- [ ] User blocking
- [ ] Admin moderation tools
- [ ] Analytics and reporting

## Troubleshooting

### WebSocket Connection Fails

1. Check JWT token is valid
2. Verify CORS configuration
3. Check firewall/proxy settings
4. Ensure MongoDB is running

### Messages Not Delivered

1. Verify both users are in same conversation
2. Check conversation exists in database
3. Verify user is participant
4. Check WebSocket connection status

### Performance Issues

1. Add/verify database indexes
2. Reduce message fetch limit
3. Implement message pagination
4. Use Redis for presence (future)

## Support

For issues with the chat module:
1. Check this documentation
2. Review server logs (Winston)
3. Check Sentry for errors
4. Contact development team
