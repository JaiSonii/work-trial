# TMS Backend API

REST API for Transportation Management System (TMS) - Load Management

## Database

This API uses **SQLite in-memory database** for data storage. The database is initialized with demo data on server startup. All data is stored in memory and will be reset when the server restarts.

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/health` - Check if the API is running

### Loads

#### Get All Loads
- **GET** `/api/loads`
- Returns all loads in the system

#### Get Load by ID
- **GET** `/api/loads/:id`
- Returns a specific load by its ID

#### Create Load
- **POST** `/api/loads`
- Creates a new load
- **Request Body:**
```json
{
  "stops": [
    {
      "type": "pickup",
      "address": "123 Main St, Los Angeles, CA 90001",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001",
      "scheduledDate": "2024-01-15T08:00:00Z"
    },
    {
      "type": "dropoff",
      "address": "456 Oak Ave, San Francisco, CA 94102",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102",
      "scheduledDate": "2024-01-15T14:00:00Z"
    }
  ],
  "weight": 15000,
  "trailerType": "Dry Van",
  "miles": 380,
  "commodity": "Electronics",
  "customer_id": "CUST001"
}
```

#### Update Load
- **PUT** `/api/loads/:id`
- Updates an existing load
- **Request Body:** Same as create, but all fields are optional

#### Delete Load
- **DELETE** `/api/loads/:id`
- Deletes a load by ID

## Load Data Structure

A load contains:
- `id` - Unique identifier (auto-generated if not provided)
- `stops` - Array of stops (minimum 2: pickup and dropoff)
  - `stops[0]` - Must be type "pickup"
  - `stops[n-1]` - Must be type "dropoff"
  - Intermediate stops can be type "intermediate"
- `weight` - Weight of the load (number)
- `trailerType` - Type of trailer (string, e.g., "Dry Van", "Refrigerated", "Flatbed")
- `miles` - Total miles for the route (number)
- `commodity` - Type of commodity being transported (string)
- `customer_id` - Customer identifier (string)

## Demo Data

The API comes pre-loaded with 4 demo loads that demonstrate:
- Simple 2-stop loads (pickup → dropoff)
- Multi-stop loads with intermediate stops
- Different trailer types and commodities

## Example Usage

### Get all loads
```bash
curl http://localhost:3000/api/loads
```

### Get a specific load
```bash
curl http://localhost:3000/api/loads/1
```

### Create a new load
```bash
curl -X POST http://localhost:3000/api/loads \
  -H "Content-Type: application/json" \
  -d '{
    "stops": [
      {
        "type": "pickup",
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "scheduledDate": "2024-01-20T08:00:00Z"
      },
      {
        "type": "dropoff",
        "address": "456 Oak Ave",
        "city": "Boston",
        "state": "MA",
        "zipCode": "02101",
        "scheduledDate": "2024-01-20T14:00:00Z"
      }
    ],
    "weight": 20000,
    "trailerType": "Dry Van",
    "miles": 215,
    "commodity": "General Freight",
    "customer_id": "CUST004"
  }'
```

### Update a load
```bash
curl -X PUT http://localhost:3000/api/loads/1 \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 16000,
    "miles": 400
  }'
```

### Delete a load
```bash
curl -X DELETE http://localhost:3000/api/loads/1
```

