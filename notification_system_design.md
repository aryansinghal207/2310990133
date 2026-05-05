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