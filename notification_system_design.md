# Notification System Design

## Overview
This design defines a notification system for a full-stack application. It includes a backend notification service, a frontend notification UI, and reusable logging middleware.

## Components

- `logging_middleware/`
  - Middleware to capture API request metadata and application logs.
  - Useful for tracing notification events and debugging.
- `notification_app_be/`
  - Backend service responsible for sending, storing, and managing notifications.
  - Exposes REST APIs for creating, reading, updating, and deleting notification data.
- `notification_app_fe/`
  - Frontend application for displaying notifications to users.
  - Includes subscription controls, notification list, and status indicators.

## Architecture

1. Client requests notification creation through the frontend.
2. Frontend calls backend API.
3. Backend validates request, stores notification in a database, and optionally sends real-time updates.
4. Logging middleware records request details and result status.
5. Frontend receives notifications via polling, WebSockets, or server-sent events.

## Data Model

- `Notification`
  - `id`: unique identifier
  - `title`: short summary
  - `message`: detailed text
  - `type`: info / warning / success / error
  - `status`: unread / read
  - `createdAt`: timestamp
  - `recipientId`: user identifier

## API Design

- `POST /api/notifications`
  - Create a new notification.
- `GET /api/notifications`
  - Retrieve notifications for the current user.
- `PATCH /api/notifications/:id/read`
  - Mark a notification as read.
- `DELETE /api/notifications/:id`
  - Remove a notification.

## Notification Delivery Patterns

- Polling: Frontend regularly requests new notifications.
- WebSockets / SSE: Backend pushes notification events to connected clients.
- Email / SMS (optional): External delivery channel for important alerts.

## Technology Suggestions

- Backend: Node.js + Express, or Python + FastAPI
- Frontend: React, Vue, or plain HTML/CSS/JavaScript
- Database: PostgreSQL, MongoDB, or SQLite for lightweight storage
- Real-time channel: Socket.IO or EventSource

## Logging Strategy

- Capture request method, URL, body summary, response status, and latency.
- Persist logs to a file, console, or external service.
- Use logs to detect failed notifications and diagnose issues.

## Folder Responsibilities

- `logging_middleware/`
  - Contains reusable middleware for request logging.
  - Should be importable by backend services.
- `notification_app_be/`
  - Backend application logic and API routes.
  - Data storage and notification scheduling.
- `notification_app_fe/`
  - User interface for viewing and interacting with notifications.
  - Notification feed and action controls.

## Stage 1

### REST API Design for Notification Platform

The notification platform supports the following core actions:
- Retrieve notifications for a user
- Create a new notification
- Mark notification as read
- Delete a notification
- Get notification statistics

#### Endpoints

1. **GET /api/notifications**
   - Retrieve notifications for the authenticated user
   - Query Parameters:
     - `page` (integer, default 1): Page number for pagination
     - `limit` (integer, default 20): Number of notifications per page
     - `type` (string, optional): Filter by notification type (Event, Result, Placement)
     - `status` (string, optional): Filter by read status (read, unread)
   - Headers:
     - `Authorization: Bearer <token>`
     - `Content-Type: application/json`
   - Response (200):
     ```json
     {
       "notifications": [
         {
           "id": "string",
           "type": "Event|Result|Placement",
           "title": "string",
           "message": "string",
           "status": "read|unread",
           "createdAt": "ISO8601 timestamp",
           "updatedAt": "ISO8601 timestamp"
         }
       ],
       "pagination": {
         "page": 1,
         "limit": 20,
         "total": 150,
         "pages": 8
       }
     }
     ```

2. **POST /api/notifications**
   - Create a new notification
   - Headers:
     - `Authorization: Bearer <token>`
     - `Content-Type: application/json`
   - Request Body:
     ```json
     {
       "type": "Event|Result|Placement",
       "title": "string (required)",
       "message": "string (required)",
       "recipientIds": ["string"] // array of user IDs
     }
     ```
   - Response (201):
     ```json
     {
       "notification": {
         "id": "string",
         "type": "Event|Result|Placement",
         "title": "string",
         "message": "string",
         "status": "unread",
         "createdAt": "ISO8601 timestamp",
         "updatedAt": "ISO8601 timestamp"
       },
       "recipients": 50 // number of users notified
     }
     ```

3. **PATCH /api/notifications/{id}/read**
   - Mark a specific notification as read
   - Headers:
     - `Authorization: Bearer <token>`
     - `Content-Type: application/json`
   - Response (200):
     ```json
     {
       "notification": {
         "id": "string",
         "status": "read",
         "updatedAt": "ISO8601 timestamp"
       }
     }
     ```

4. **DELETE /api/notifications/{id}**
   - Delete a notification
   - Headers:
     - `Authorization: Bearer <token>`
   - Response (204): No content

5. **GET /api/notifications/stats**
   - Get notification statistics for the user
   - Headers:
     - `Authorization: Bearer <token>`
     - `Content-Type: application/json`
   - Response (200):
     ```json
     {
       "total": 150,
       "unread": 25,
       "byType": {
         "Event": 50,
         "Result": 75,
         "Placement": 25
       }
     }
     ```

### Real-time Notification Mechanism

For real-time notifications, we implement Server-Sent Events (SSE):

- **GET /api/notifications/stream**
  - Establishes SSE connection for real-time updates
  - Headers:
    - `Authorization: Bearer <token>`
    - `Accept: text/event-stream`
  - Response: SSE stream with events like:
    ```
    event: notification
    data: {"type": "new", "notification": {...}}

    event: notification
    data: {"type": "read", "id": "notification-id"}
    ```

This allows instant delivery of new notifications without polling.

## Stage 2

### Database Choice
I recommend using **PostgreSQL** as the persistent storage for the notification platform.

**Reasons for choosing PostgreSQL:**
- **ACID Compliance**: Ensures data integrity, especially important for notifications where delivery confirmation is critical.
- **Advanced Features**: Supports JSONB for flexible data storage, full-text search, and advanced indexing options.
- **Scalability**: Handles large datasets efficiently with partitioning and indexing.
- **Reliability**: Mature, open-source, with strong community support and enterprise features.
- **SQL Standards**: Full SQL compliance makes it easier for developers familiar with relational databases.
- **Performance**: Excellent for read-heavy workloads like notification retrieval, with optimizations for concurrent access.

Compared to alternatives:
- **MySQL**: Similar but less advanced in JSON handling and some PostgreSQL-specific features.
- **MongoDB**: Good for unstructured data, but relational queries and joins are better suited for notifications with user relationships.
- **SQLite**: Not suitable for production multi-user systems.

### Database Schema

```sql
-- Users table (assuming basic user info)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('Event', 'Result', 'Placement')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('read', 'unread')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_recipient_status ON notifications(recipient_id, status);
CREATE INDEX idx_notifications_recipient_type ON notifications(recipient_id, type);
```

### Problems with Data Volume Increase

As the data volume grows (50,000+ students, millions of notifications):
1. **Query Performance Degradation**: Full table scans become slower, especially for unread notifications.
2. **Storage Costs**: Increased disk space and backup times.
3. **Index Maintenance Overhead**: Updates to indexes slow down INSERT/UPDATE operations.
4. **Memory Usage**: Larger datasets require more RAM for caching and query processing.
5. **Backup/Restore Times**: Longer downtime during maintenance.
6. **Concurrency Issues**: Higher contention for popular data.

### Solutions

1. **Indexing Strategy**:
   - Composite indexes on frequently queried columns (recipient_id + status, recipient_id + type).
   - Partial indexes for specific conditions (e.g., unread notifications).

2. **Partitioning**:
   - Partition notifications table by date ranges (monthly/yearly) to improve query performance and maintenance.

3. **Archiving**:
   - Move old read notifications to archive tables after a certain period.

4. **Caching**:
   - Use Redis for frequently accessed data like unread counts.

5. **Read Replicas**:
   - Offload read queries to replica databases.

6. **Connection Pooling**:
   - Use connection pools to manage database connections efficiently.

### SQL Queries for REST APIs

Based on the Stage 1 API design:

1. **GET /api/notifications** (with pagination and filters):
```sql
SELECT id, type, title, message, status, created_at, updated_at
FROM notifications
WHERE recipient_id = $1
  AND ($2::text IS NULL OR type = $2)
  AND ($3::text IS NULL OR status = $3)
ORDER BY created_at DESC
LIMIT $4 OFFSET (($5 - 1) * $4);
```
Parameters: recipient_id, type_filter, status_filter, limit, page

2. **POST /api/notifications** (insert):
```sql
INSERT INTO notifications (type, title, message, recipient_id)
SELECT $1, $2, $3, unnest($4::uuid[])
RETURNING id, type, title, message, status, created_at, updated_at;
```
Parameters: type, title, message, recipient_ids_array

3. **PATCH /api/notifications/{id}/read**:
```sql
UPDATE notifications
SET status = 'read', updated_at = NOW()
WHERE id = $1 AND recipient_id = $2
RETURNING id, status, updated_at;
```
Parameters: notification_id, recipient_id

4. **DELETE /api/notifications/{id}**:
```sql
DELETE FROM notifications
WHERE id = $1 AND recipient_id = $2;
```
Parameters: notification_id, recipient_id

5. **GET /api/notifications/stats**:
```sql
SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'unread') as unread,
    jsonb_object_agg(type, type_count) as by_type
FROM (
    SELECT type, COUNT(*) as type_count
    FROM notifications
    WHERE recipient_id = $1
    GROUP BY type
) sub;
```
Parameters: recipient_id