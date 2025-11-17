# Calendar Feature

Simple calendar app using FullCalendar and SQLite.

## Features

- Create events by clicking and dragging on dates
- Delete events by clicking on them
- Drag and drop events to reschedule
- Month and week views
- SQLite database storage

## Usage

- **Create event**: Click on a date and enter a title
- **Delete event**: Click on an event and confirm deletion
- **Move event**: Drag and drop an event to a new date

## Database

Events are stored in SQLite at `app-data/gatsun-website.db` (both in dev and production).

## API Routes

- `GET /api/events` - Fetch all events
- `POST /api/events` - Create a new event
- `PATCH /api/events/[id]` - Update an event
- `DELETE /api/events/[id]` - Delete an event
