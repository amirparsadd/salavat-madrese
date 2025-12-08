> [!IMPORTANT]  
> This documentation is a bit outdated. It would be highly appreciated if you put the time to rewrite this based on the current project structure!

# Salavat Madreseh - Clicker App

A fun web project that lets users "pray" (send salavats) for schools to be canceled! This is a full-stack application with a modern Vue 3 frontend, a Hono API backend, and a PostgreSQL database layer.

---

## Architecture

The project follows a three-tier architecture:

```
┌─────────────┐
│ client-web  │  Vue 3 + Vite Frontend
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│   server    │  Hono API Backend (TypeScript)
└──────┬──────┘
       │ HTTP (with Auth)
       ▼
┌─────────────┐
│     dal     │  Data Access Layer (Node.js)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │  Database
└─────────────┘
```

### Components

- **client-web**: Vue 3 frontend with TailwindCSS, reactive state management, and optimistic updates
- **server**: Hono API backend with rate limiting, caching, and admin endpoints
- **dal**: Data Access Layer that interfaces with PostgreSQL, handles database operations

---

## Features

* Global and daily counters for prayers (salavats)
* Large circular button to send a salavat
* Optimistic updates on click with periodic server sync (every 2 seconds)
* Rate limiting (40 requests per minute per IP)
* Animated counters using CountUp.js
* Dynamic configuration system
* UI in Persian (Farsi)
* Responsive and mobile-friendly design
* Admin endpoints for managing clicks and configurations
* Docker support for all components

---

## Requirements

* Node.js 18+
* npm
* PostgreSQL database
* Docker (optional, for containerized deployment)

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/amirparsadd/salavat-madrese
cd salavat-madrese
```

### 2. Database Setup (DAL)

Navigate to the `dal` directory:

```bash
cd dal
```

Create a `.env` file:

```env
DATABASE_CONNECTION_STRING=postgresql://user:password@host:port/database
ACCESS_TOKEN=your-secure-access-token-here
PORT=3000
HOSTNAME=0.0.0.0
```

Install dependencies and start the DAL:

```bash
npm install
npm start
```

The DAL will automatically initialize the database schema (creates `clicks` and `configs` tables) on first run.

### 3. Backend Server Setup

Navigate to the `server` directory:

```bash
cd ../server
```

Create a `.env` file:

```env
DAL_ENDPOINT=http://localhost:3000
DAL_ACCESS_TOKEN=your-secure-access-token-here
PORT=3000
```

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Or build and run in production:

```bash
npm run build
npm start
```

The server will run at `http://localhost:3000` by default.

### 4. Frontend Setup (client-web)

Navigate to the `client-web` directory:

```bash
cd ../client-web
```

Create a `.env` file:

```env
VITE_API_ENDPOINT=http://localhost:3000
```

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

The app will run at `http://localhost:5173` by default.

Build for production:

```bash
npm run build
npm run preview
```

---

## Docker Deployment

Each component has its own Dockerfile. You can build and run them individually:

### Build Docker images

```bash
# Build DAL
cd dal
docker build -t salavat-dal .

# Build Server
cd ../server
docker build -t salavat-server .

# Build Client
cd ../client-web
docker build -t salavat-client .
```

### Run with Docker

```bash
# Run DAL (make sure PostgreSQL is accessible)
docker run -p 3000:3000 \
  -e DATABASE_CONNECTION_STRING=postgresql://... \
  -e ACCESS_TOKEN=your-token \
  salavat-dal

# Run Server
docker run -p 3000:3000 \
  -e DAL_ENDPOINT=http://dal-container:3000 \
  -e DAL_ACCESS_TOKEN=your-token \
  salavat-server

# Run Client
docker run -p 80:80 salavat-client
```

---

## API Endpoints

### Public Endpoints

#### `GET /`
Fetch current click data (total and daily counts).

**Response:**
```json
{
  "total": 12345,
  "daily": {
    "amount": 567,
    "lastUpdate": 1234567890
  }
}
```

#### `POST /click`
Increment the click counter. Rate limited to 40 requests per minute per IP.

**Response:**
```
Submitted (201)
```

#### `GET /configs`
Fetch all configuration values.

**Response:**
```json
{
  "support": "https://t.me/amirparsab90",
  "servicestatus": "https://uptimekuma.afrachin.ir/status/salavat-madrese"
}
```

#### `GET /configs/:key`
Fetch a specific configuration value.

**Response:**
```json
{
  "data": "config-value"
}
```

### Admin Endpoints (Requires Authorization Header)

All admin endpoints require the `Authorization` header with the `DAL_ACCESS_TOKEN` value.

#### `POST /configs/:key`
Set or update a configuration value.

**Headers:**
```
Authorization: your-dal-access-token
```

**Body:**
```json
{
  "value": "new-config-value"
}
```

#### `POST /clicks`
Manually add clicks (admin only).

**Headers:**
```
Authorization: your-dal-access-token
```

**Body:**
```json
{
  "amount": 100
}
```

---

## Project Structure

```
salavat-madrese/
├── client-web/              # Vue 3 Frontend
│   ├── src/
│   │   ├── App.vue          # Main UI component
│   │   ├── main.ts          # Entry point
│   │   ├── component/
│   │   │   └── Counter.vue  # Animated counter component
│   │   ├── state/
│   │   │   ├── clicks.ts    # Click state management
│   │   │   ├── configs.ts   # Config state management
│   │   │   └── interval.ts  # Sync interval management
│   │   └── style.css        # Global styles
│   ├── public/              # Static assets
│   ├── Dockerfile           # Multi-stage build with nginx
│   └── package.json
│
├── server/                  # Hono API Backend
│   ├── src/
│   │   ├── index.ts         # Main server file
│   │   ├── clicks.ts        # Click data management
│   │   ├── configs.ts       # Config caching and management
│   │   ├── admin-middleware.ts  # Admin authentication
│   │   └── utils.ts         # Utility functions
│   ├── Dockerfile
│   └── package.json
│
└── dal/                     # Data Access Layer
    ├── src/
    │   ├── index.js         # HTTP server
    │   ├── handler.js       # Request handler
    │   ├── db.js            # Database operations
    │   └── config.js        # Configuration loader
    ├── start-database.sh    # Database initialization script
    ├── Dockerfile
    └── package.json
```

---

## Usage

1. Start the DAL service (connects to PostgreSQL)
2. Start the backend server (connects to DAL)
3. Start the frontend (connects to backend)
4. Open the website in your browser
5. See the total and daily prayer counts
6. Click the 🙏 button to send a salavat
7. Counters update instantly locally and sync with the server every 2 seconds

---

## Configuration

### Environment Variables

#### DAL (`dal/.env`)
- `DATABASE_CONNECTION_STRING`: PostgreSQL connection string
- `ACCESS_TOKEN`: Token for authenticating requests from server
- `PORT`: Port to run on (default: 3000)
- `HOSTNAME`: Hostname to bind to (default: 0.0.0.0)

#### Server (`server/.env`)
- `DAL_ENDPOINT`: URL of the DAL service
- `DAL_ACCESS_TOKEN`: Token to authenticate with DAL
- `PORT`: Port to run on (default: 3000)

#### Client (`client-web/.env`)
- `VITE_API_ENDPOINT`: URL of the backend server

### Dynamic Configuration

The app supports dynamic configuration through the `/configs` endpoints. Default configs include:
- `support`: Support contact link
- `servicestatus`: Service status page URL

These can be updated via the admin API without redeploying.

---

## Technical Details

### Frontend
- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite
- **Styling**: TailwindCSS v4
- **Animations**: CountUp.js for counter animations
- **State Management**: Vue reactive state
- **Sync Interval**: 2 seconds for fetching updated counts

### Backend
- **Framework**: Hono
- **Language**: TypeScript
- **Rate Limiting**: 40 requests/minute per IP using `hono-rate-limiter`
- **Caching**: In-memory cache for configs (cleared every 5 seconds)
- **Sync**: Periodic sync with DAL (every 1 second by default)
- **CORS**: Enabled for cross-origin requests

### Data Layer
- **Database**: PostgreSQL
- **Tables**:
  - `clicks`: Stores total count and daily tracking
  - `configs`: Key-value configuration storage
- **Features**: Automatic schema initialization, daily counter reset logic

---

## Development

### Running in Development Mode

1. Start PostgreSQL database
2. Start DAL: `cd dal && npm start`
3. Start Server: `cd server && npm run dev` (uses `tsx watch` for hot reload)
4. Start Client: `cd client-web && npm run dev` (uses Vite dev server)

### Building for Production

```bash
# Build server
cd server
npm run build

# Build client
cd client-web
npm run build
```

---

## License

MIT License
