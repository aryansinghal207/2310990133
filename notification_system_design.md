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

## Stage 3

### Query Analysis

The query `SELECT * FROM notifications WHERE studentID = 1042 AND isRead = false ORDER BY createdAt ASC;` has several issues:

**Accuracy Issues:**
- Column names are inconsistent: `studentID` should be `recipient_id`, `isRead` should be `status`.
- The query assumes `status` is boolean, but in our schema it's VARCHAR ('read'/'unread').
- Corrected query: `SELECT * FROM notifications WHERE recipient_id = '1042' AND status = 'unread' ORDER BY created_at ASC;`

**Performance Issues:**
- Without proper indexing, this query performs a full table scan on 5,000,000 rows.
- For user 1042, it still needs to scan all unread notifications to find those for this user.
- ORDER BY on unindexed column causes filesort.
- With 50,000 students and 5M notifications, average ~100 notifications per student, but scanning millions is inefficient.

**Why it's slow:**
- No index on `recipient_id` + `status` combination.
- Large table size requires scanning most rows.
- Sorting without index on `created_at`.

### Improvements

**Optimized Query:**
```sql
SELECT id, type, title, message, status, created_at, updated_at
FROM notifications
WHERE recipient_id = $1 AND status = 'unread'
ORDER BY created_at ASC;
```

**Required Indexes:**
- `CREATE INDEX idx_notifications_recipient_status_created ON notifications(recipient_id, status, created_at);`

**Computation Cost:**
- Before: O(n) scan of 5M rows + O(k log k) sort (k=unread count for user).
- After: O(log n) index lookup + O(k) retrieval (k~100).
- Cost reduction: ~99.99% faster for large datasets.

### Index Advice

Adding indexes on every column is ineffective because:
- **Overhead**: Each index increases INSERT/UPDATE/DELETE time and storage.
- **Maintenance Cost**: More indexes = slower writes, higher disk usage.
- **Query Optimizer Confusion**: Too many indexes can confuse the planner.
- **Selective Indexing**: Only index columns used in WHERE, JOIN, ORDER BY clauses with high selectivity.

Better approach: Analyze query patterns and add targeted indexes.

### Placement Notifications Query

```sql
SELECT DISTINCT recipient_id
FROM notifications
WHERE type = 'Placement'
  AND created_at >= NOW() - INTERVAL '7 days'
  AND status = 'unread';  -- Assuming we want students who received but haven't read
```

This finds students who got placement notifications in the last 7 days.

## Stage 4

### Performance Issues
Fetching notifications on every page load overwhelms the database because:
- 50,000+ concurrent users hitting the endpoint simultaneously.
- Complex queries with joins, filters, and sorting.
- No caching leads to repeated expensive DB operations.
- Real-time requirements increase load.

### Solutions

#### 1. Caching Strategy
**Implementation:**
- Use Redis/Memcached for notification data.
- Cache unread counts and recent notifications per user.
- Cache TTL: 5-10 minutes for dynamic data.

**Tradeoffs:**
- **Pros**: Dramatically reduces DB load (90%+), faster response times.
- **Cons**: Stale data possible, cache invalidation complexity, additional infrastructure cost.
- **Best for**: Read-heavy workloads with acceptable staleness.

#### 2. Pagination and Lazy Loading
**Implementation:**
- Load only first 10-20 notifications initially.
- Load more on scroll/demand.
- Use cursor-based pagination instead of offset.

**Tradeoffs:**
- **Pros**: Reduces initial load, better UX for large lists.
- **Cons**: More complex frontend, multiple API calls, potential UX fragmentation.
- **Best for**: Large notification lists.

#### 3. Database Optimization
**Implementation:**
- Read replicas for SELECT queries.
- Query optimization and proper indexing.
- Connection pooling and prepared statements.

**Tradeoffs:**
- **Pros**: Improved query performance without code changes.
- **Cons**: Higher infrastructure cost, replication lag, maintenance overhead.
- **Best for**: Immediate performance gains.

#### 4. Background Processing
**Implementation:**
- Pre-compute notification feeds in background.
- Use message queues for async processing.
- Push notifications via WebSockets/SSE instead of polling.

**Tradeoffs:**
- **Pros**: Consistent performance, real-time updates.
- **Cons**: High complexity, potential message loss, debugging difficulty.
- **Best for**: Real-time notification systems.

#### 5. Hybrid Approach (Recommended)
**Implementation:**
- Redis caching for hot data (unread counts, recent notifications).
- Database for cold data with optimized queries.
- WebSocket connections for real-time updates.
- CDN for static assets.

**Tradeoffs:**
- **Pros**: Balances performance and consistency, scalable.
- **Cons**: Complex architecture, higher operational cost.
- **Best for**: Production systems requiring high performance and real-time features.

**Recommended Strategy:**
Implement caching + read replicas + lazy loading for immediate relief, then add WebSockets for real-time features.

## Stage 5

### Shortcomings of Current Implementation

The pseudocode `notify_all(student_ids, message)` has several critical issues:

1. **Sequential Processing**: Processes one student at a time, taking ~50,000 × (email_time + db_time) = hours.
2. **No Error Handling**: If `send_email` fails for one student, the whole process stops.
3. **No Rollback**: Failed emails don't undo DB saves, causing inconsistency.
4. **Resource Exhaustion**: Holds connections open for the entire process.
5. **No Monitoring**: No logging or progress tracking.
6. **Blocking Operations**: Synchronous calls block the entire process.

When `send_email` fails for 200 students midway:
- Process stops abruptly.
- Inconsistent state: some students have DB entries but no emails.
- No way to resume or retry failed operations.
- Users get partial notifications.

### Redesign for Reliability and Speed

**Key Principles:**
- **Asynchronous Processing**: Use queues and workers for parallel processing.
- **Transactional Consistency**: Ensure email and DB operations are atomic.
- **Idempotency**: Allow safe retries without duplicates.
- **Monitoring**: Track progress and failures.
- **Circuit Breakers**: Handle external service failures gracefully.

**Architecture:**
- Message queue (e.g., RabbitMQ, Redis Queue) for job distribution.
- Worker processes for parallel email sending.
- Transactional DB operations.
- Dead letter queues for failed messages.
- Monitoring dashboard.

### Should DB Save and Email Happen Together?

**No, they should NOT happen together in a single transaction.**

**Reasons:**
1. **Different Failure Modes**: Email service failures shouldn't block DB writes.
2. **Performance**: Email APIs are slow (seconds), DB operations are fast (milliseconds).
3. **Scalability**: Separating allows independent scaling of email and DB services.
4. **Reliability**: Email failures can be retried without affecting committed data.
5. **Consistency**: Use eventual consistency with compensation actions.

**Better Approach:**
- Save to DB first (fast, reliable).
- Queue email job separately.
- Use sagas or compensation transactions for complex scenarios.

### Revised Pseudocode

```python
async function notify_all(student_ids, message):
    # Step 1: Bulk insert notifications (fast, reliable)
    try:
        await db.transaction(async (tx) => {
            const notifications = student_ids.map(id => ({
                student_id: id,
                message: message,
                status: 'pending',
                created_at: now()
            }));
            await tx.bulk_insert('notifications', notifications);
        });
        Log('backend', 'info', 'service', `Bulk inserted ${student_ids.length} notifications`);
    except error:
        Log('backend', 'fatal', 'db', `Bulk insert failed: ${error.message}`);
        throw error;

    # Step 2: Queue email jobs (asynchronous, parallel)
    const email_jobs = student_ids.map(id => ({
        student_id: id,
        message: message,
        retry_count: 0,
        max_retries: 3
    }));
    
    await queue.publish_batch('email_notifications', email_jobs);
    Log('backend', 'info', 'service', `Queued ${email_jobs.length} email jobs`);

# Email Worker (separate process)
async function process_email_job(job):
    const { student_id, message, retry_count } = job;
    
    try:
        await send_email(student_id, message);
        await db.update('notifications', 
            { status: 'sent' }, 
            { student_id, message }
        );
        Log('backend', 'info', 'service', `Email sent to ${student_id}`);
    except error:
        if (retry_count < job.max_retries) {
            await queue.requeue(job, { retry_count: retry_count + 1 });
            Log('backend', 'warn', 'service', `Email retry ${retry_count + 1} for ${student_id}`);
        } else {
            await db.update('notifications', 
                { status: 'failed' }, 
                { student_id, message }
            );
            Log('backend', 'error', 'service', `Email failed permanently for ${student_id}`);
        }
    }

# Push notification (real-time, separate from email)
async function push_to_app(student_id, message):
    try:
        await websocket.broadcast(student_id, {
            type: 'notification',
            message: message
        });
        Log('backend', 'info', 'service', `Push notification sent to ${student_id}`);
    except error:
        Log('backend', 'warn', 'service', `Push notification failed for ${student_id}: ${error.message}`);
```

**Benefits:**
- **Speed**: Bulk DB insert + parallel email processing.
- **Reliability**: Failed emails don't stop the process, retries handle temporary failures.
- **Consistency**: DB state is always consistent, email status tracked separately.
- **Monitoring**: Full logging of each step.
- **Scalability**: Workers can be scaled independently.