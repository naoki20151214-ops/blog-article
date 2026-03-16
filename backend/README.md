# KGI/KPI Management Backend API

This is a Node.js/Express backend API for the KGI/KPI goal tracking system. It provides REST API endpoints for managing KGI (Key Goal Indicators), KPI (Key Performance Indicators), and Tasks, with MongoDB for data persistence.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas cloud)
- npm

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure your MongoDB connection string in `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kgi-kpi-db?retryWrites=true&w=majority
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on the port specified in `.env` (default: 5000).

## API Endpoints

### KGI (Key Goal Indicator)
- `GET /api/kgi` - Get all KGIs
- `GET /api/kgi/:id` - Get a specific KGI
- `POST /api/kgi` - Create a new KGI
- `PUT /api/kgi/:id` - Update a KGI
- `DELETE /api/kgi/:id` - Delete a KGI

### KPI (Key Performance Indicator)
- `GET /api/kgi/:kgiId/kpi` - Get KPIs for a specific KGI
- `GET /api/kpi/:id` - Get a specific KPI
- `POST /api/kpi` - Create a new KPI
- `PUT /api/kpi/:id` - Update a KPI
- `PUT /api/kpi/:id/value` - Update KPI value and record history
- `GET /api/kpi/:id/history` - Get change history for a KPI
- `DELETE /api/kpi/:id` - Delete a KPI

### Task
- `GET /api/task/kpi/:kpiId` - Get tasks for a specific KPI
- `GET /api/task/:id` - Get a specific task
- `POST /api/task` - Create a new task
- `PUT /api/task/:id` - Update a task
- `PUT /api/task/:id/toggle` - Toggle task completion status
- `DELETE /api/task/:id` - Delete a task

### Health Check
- `GET /health` - Check server status

## Database Schema

The system uses MongoDB with the following collections:

- **KGI**: Key goal indicators
- **KPI**: Key performance indicators linked to KGIs
- **Task**: Tasks/subtasks linked to KPIs
- **ChangeHistory**: Audit trail of KPI value changes

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS configuration

## Error Handling

The API returns JSON error responses with appropriate HTTP status codes:
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Testing

To test the API, you can use tools like:
- Postman
- curl
- REST Client extensions in VS Code

Example:
```bash
curl http://localhost:5000/api/kgi
```

## Development Notes

- The API uses CORS to allow requests from the frontend
- All timestamps are stored in ISO format
- IDs are generated as strings (format: `type_timestamp_random`)
- Values are clamped between 0 and target for KPIs
