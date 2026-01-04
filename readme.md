# Freight Marketplace Platform

A modern, full-stack freight marketplace application for managing loads, customers, and quotes. Built with Next.js frontend and Express.js backend with SQLite in-memory database. Features a professional card-based UI, AI-powered load creation, interactive route mapping, and comprehensive load management capabilities.

## 🚀 Features

### Load Management
- **Card-Based UI**: Modern freight marketplace design with compact, professional load cards
- **Create Loads**: Comprehensive form with customer selection, equipment type, multiple stops, shipment details, and optional notes
- **Edit Loads**: Full editing capability for all load fields with pre-filled forms
- **Delete Loads**: One-click deletion with confirmation
- **View Loads**: Paginated card view with sorting and filtering
- **Load Details**: Side panel with 4 tabs:
  - **Load Details**: Complete load information with all stops and notes
  - **Customer Details**: Full customer information and contact details
  - **Lane History**: Historical loads with same origin/destination
  - **Calculator**: Quote calculation with accessorial charges
- **Map View**: Interactive map showing route from origin to destination with all stops (using OpenStreetMap)
- **Sorting**: Sort by date (Newest/Oldest) or distance (Shortest/Longest)
- **Notes Field**: Optional notes/comments for each load

### AI Load Creator 🤖
- **Natural Language Processing**: Create loads using conversational language
- **Auto-Creation**: Automatically creates loads with smart defaults for missing information
- **Minimal Input Required**: Only needs pickup and delivery locations
- **Smart Defaults**: Automatically fills customer, equipment type, weight, miles, rate, and commodity
- **Chat Interface**: Real-time chat UI with message history
- **Auto-Reset**: Chat resets after each successful load creation
- **Mock AI Integration**: Currently uses mock AI processing (ready for real AI API integration)
- **Future Enhancement**: Can be improved with voice input for hands-free load creation

### Customer Management
- Customer database with company information
- MC Number, DOT Number, Tax ID tracking
- Primary contact details

### Filtering & Search
- Search by customer name, load ID, source/destination
- Filter by pickup city/state
- Filter by delivery city/state
- Filter by equipment type (including "All")
- Filter by number of stops (2, 3, 4, 5+)

### Quote Calculator
- Base cost and miles input
- Multiple accessorial charges (20+ charge types)
- Margin percentage calculation
- Automatic quote price calculation
- Save quotes to database with charge tracking

## 📁 Project Structure

```
Work Trial Project/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   │   ├── loadController.js
│   │   │   ├── customerController.js
│   │   │   └── calculatorController.js
│   │   ├── database/             # Database modules (modularized)
│   │   │   ├── connection.js     # DB connection & promisified methods
│   │   │   ├── schema.js          # Table schema definitions
│   │   │   ├── seedData.js        # Demo data seeding (100 loads, 10 customers)
│   │   │   ├── loadOperations.js  # Load CRUD operations
│   │   │   ├── customerOperations.js  # Customer operations
│   │   │   ├── chargeOperations.js    # Charge/quote operations
│   │   │   ├── laneHistoryOperations.js  # Lane history queries
│   │   │   └── index.js           # Main database module exports
│   │   └── routers/               # API routes
│   │       ├── loadRoutes.js
│   │       └── customerRoutes.js
│   ├── server.js                  # Express server setup
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/                   # Next.js app directory
    │   │   ├── layout.tsx         # Root layout with filters and AI button
    │   │   ├── page.tsx           # Main loads page (split view)
    │   │   └── globals.css
    │   └── components/
    │       ├── ui/                 # Reusable UI components
    │       │   ├── Input.tsx       # Custom styled input component
    │       │   └── Select.tsx      # Custom styled select component
    │       ├── Loads.tsx          # Loads list with card view and sorting
    │       ├── Filters.tsx        # Filtering component
    │       ├── CreateLoad.tsx     # Create load form (compact design)
    │       ├── EditLoad.tsx       # Edit load form
    │       ├── AILoadCreator.tsx  # AI-powered load creation
    │       └── loadDisplay/
    │           ├── LoadDetails.tsx    # Load details side panel
    │           ├── CustomerDetails.tsx
    │           ├── LaneHistory.tsx
    │           ├── Calculator.tsx
    │           └── MapView.tsx        # Route map component
    └── package.json
```

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **SQLite3** (in-memory database)
- **RESTful API** architecture
- **Modular Database Architecture**: Separated into focused modules for maintainability

### Frontend
- **Next.js 14** (React framework with App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Leaflet** with OpenStreetMap for maps (free, no API key required)
- **Custom UI Components**: Reusable Input and Select components with consistent styling

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm start
```

The backend server will start on `http://localhost:5000`

**Available Endpoints:**
- Health Check: `http://localhost:5000/health`
- Loads API: `http://localhost:5000/api/loads`
- Customers API: `http://localhost:5000/api/customers`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

**Note**: Make sure the backend is running before starting the frontend.

## 🗄️ Database Schema

### Customers Table
- `id` (TEXT, PRIMARY KEY)
- `company_name` (TEXT, NOT NULL)
- `legal_name` (TEXT, NOT NULL)
- `mc_number` (TEXT)
- `dot_number` (TEXT)
- `taxid` (TEXT)
- `primary_contact_name` (TEXT, NOT NULL)
- `primary_contact_title` (TEXT)
- `primary_contact_phone` (TEXT, NOT NULL)
- `primary_contact_email` (TEXT, NOT NULL)

### Loads Table
- `id` (TEXT, PRIMARY KEY)
- `orderId` (TEXT, UNIQUE, NOT NULL) - Auto-generated (ORD-0001, ORD-0002, etc.)
- `stops` (TEXT, NOT NULL) - JSON array of stops
- `weight` (REAL, NOT NULL)
- `trailerType` (TEXT, NOT NULL)
- `miles` (REAL, NOT NULL)
- `commodity` (TEXT, NOT NULL)
- `rate` (REAL, NOT NULL)
- `quote_price` (REAL) - Calculated quote price
- `notes` (TEXT) - Optional notes/comments
- `customer_id` (TEXT, NOT NULL, FOREIGN KEY)

### Charges Table
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `load_id` (TEXT, FOREIGN KEY)
- `customer_id` (TEXT, FOREIGN KEY)
- `charge_type` (TEXT, NOT NULL)
- `amount` (REAL, NOT NULL)

### Stop Structure (JSON)
Each stop in the `stops` array contains:
- `type` (string): "pickup", "delivery", or "intermediate"
- `locationName` (string, optional): Name of the location
- `address` (string): Street address
- `city` (string): City name
- `state` (string): State abbreviation
- `zipCode` (string): ZIP code
- `earlyArrival` (string): ISO date string for early arrival window
- `lateArrival` (string): ISO date string for late arrival window

## 🔌 API Endpoints

### Loads

#### Get All Loads (with pagination and filtering)
```
GET /api/loads?page=1&limit=10&search=&pickupCity=&pickupState=&deliveryCity=&deliveryState=&equipmentType=&stops=
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search in customer name, load ID, source/destination
- `pickupCity` (string): Filter by pickup city
- `pickupState` (string): Filter by pickup state
- `deliveryCity` (string): Filter by delivery city
- `deliveryState` (string): Filter by delivery state
- `equipmentType` (string): Filter by equipment type
- `stops` (string): Filter by number of stops ("2 Stops", "3 Stops", "4 Stops", "5+ Stops")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "orderId": "ORD-0001",
      "stops": [...],
      "weight": 15000,
      "trailerType": "Dry Van",
      "miles": 380,
      "commodity": "Electronics",
      "rate": 2850.00,
      "quote_price": null,
      "notes": null,
      "customer_id": "CUST001",
      "company_name": "TechLogistics Inc."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Get Load by ID
```
GET /api/loads/:id
```

#### Get Lane History
```
GET /api/loads/:id/lane-history
```

#### Create Load
```
POST /api/loads
```

**Request Body:**
```json
{
  "customer_id": "CUST001",
  "trailerType": "Dry Van",
  "stops": [
    {
      "type": "pickup",
      "locationName": "Warehouse",
      "address": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001",
      "earlyArrival": "2024-01-15T07:00:00Z",
      "lateArrival": "2024-01-15T09:00:00Z"
    },
    {
      "type": "delivery",
      "locationName": "Distribution Center",
      "address": "456 Oak Ave",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102",
      "earlyArrival": "2024-01-15T13:00:00Z",
      "lateArrival": "2024-01-15T15:00:00Z"
    }
  ],
  "weight": 15000,
  "miles": 380,
  "rate": 2850.00,
  "commodity": "Electronics",
  "notes": "Handle with care - fragile items"
}
```

#### Update Load
```
PUT /api/loads/:id
```

**Request Body:** Same as Create Load (all fields optional except required ones)

#### Delete Load
```
DELETE /api/loads/:id
```

#### Calculate Quote
```
POST /api/loads/:id/calculate
```

**Request Body:**
```json
{
  "baseCost": 2000,
  "miles": 380,
  "accessorialCharges": [
    {
      "chargeType": "Detention",
      "amount": 150
    },
    {
      "chargeType": "Fuel Surcharge",
      "amount": 200
    }
  ],
  "marginPercentage": 15,
  "subtotal": 2350,
  "finalQuote": 2702.5
}
```

#### Get Charges
```
GET /api/loads/:id/charges
```

### Customers

#### Get All Customers
```
GET /api/customers
```

#### Get Customer by ID
```
GET /api/customers/:id
```

### Health Check
```
GET /health
```

## 🎨 Frontend Features

### Loads Page (Card-Based Design)
- **Card View**: Professional freight marketplace card layout
- **Card Information**: Each card displays:
  - Order ID (prominent)
  - Shipper/Company name
  - Route (ORIGIN → DESTINATION in uppercase)
  - Equipment type and commodity
  - Dates (start → end)
  - Stops count (X Pickup → Y Delivery)
  - Distance (miles)
  - Weight (lbs)
  - Rate ($ or TBD)
  - Delete button (trash icon)
- **Selection**: Click any card to open details in side panel
- **Selected State**: Selected card highlighted with yellow border
- **Sorting**: Sort by Date (Newest/Oldest) or Distance (Shortest/Longest)
- **Pagination**: Configurable items per page (5, 10, 20, 50)

### Load Details Panel
- **Split-Screen Layout**: Left panel (loads list) and right panel (load details)
- **Header Actions**:
  - "View on Map" button
  - "Link to Loadboard" button
  - "Edit" button (opens edit form)
  - Close button (×)
- **4 Tabs**:
  1. **Load Details**: 
     - Load ID display
     - SHIPMENT STOPS section with numbered stops and status badges
     - LOAD INFORMATION grid
     - Notes section (if notes exist)
  2. **Customer Details**: Full customer information and contact details
  3. **Lane History**: Historical loads on the same route
  4. **Calculator**: Quote calculation tool
- **Responsive Design**: Adapts to screen size

### Create Load Form
- **Compact Design**: Space-optimized layout
- **Clear All Button**: Resets all form fields with confirmation
- **Customer Selection**: Dropdown with all customers
- **Equipment Type**: Selection from 12 trailer types
- **Dynamic Stops Management**:
  - First stop: Fixed as "Pickup"
  - Last stop: Fixed as "Delivery"
  - Intermediate stops: Can be "Pickup" or "Delivery"
  - Add/remove intermediate stops
  - Each stop includes: Location Name, Address, City, State, ZIP, Early/Late Arrival
- **Shipment Details**: Weight, Miles, Rate, Commodity
- **Notes Field**: Optional textarea for additional comments
- **Auto-generated Order ID**: Automatically generated based on load count
- **Custom Components**: Uses custom Input and Select components with gray placeholder text

### Edit Load Form
- **Pre-filled Form**: All fields populated with existing load data
- **Same Features**: All features from Create Load form
- **Update Capability**: Updates all load fields including notes

### Map View
- **OpenStreetMap Integration**: Free, no API key required
- **Route Visualization**: 
  - Clear route line from origin to destination
  - Thick blue polyline with shadow for visibility
  - Direction arrows along the route
  - Color-coded markers:
    - Green: Pickup
    - Red: Delivery
    - Blue: Intermediate
- **Origin/Destination Info Box**: Displays detailed information with arrival windows
- **Interactive Popups**: Click markers for stop details
- **Full-Screen Modal**: Large, clear map view

### Calculator
- Base cost and miles input
- Multiple accessorial charges (20+ charge types):
  - Detention, Layover, Stop-off, Reconsignment
  - Fuel Surcharge, Tarping, Loading/Unloading
  - Inside Delivery, Residential Delivery, Liftgate
  - Driver Assist, Overweight/Oversized, Hazmat
  - Temperature Control, Lumper Fee, Scale Ticket
  - Toll Charges, Permit Fee, Escort Service, Other
- Margin percentage input
- Real-time quote calculation
- Save to database (updates load's quote_price and creates charge records)

### AI Load Creator
- **Natural Language Input**: Describe loads in plain English
- **Auto-Creation**: Creates loads automatically with minimal input
- **Smart Defaults**: Fills missing information with sensible defaults
- **Chat Interface**: Real-time chat with message history
- **Auto-Reset**: Chat resets after successful creation
- **Example Usage**:
  - "Create a load from Los Angeles, CA to San Francisco, CA"
  - "I need a load from Dallas to Austin"
  - "Ship from Chicago to Detroit using Flatbed"

## 🚦 Usage Examples

### Creating a Load (Manual)

1. Click "Create Load" button in header
2. Select customer from dropdown
3. Select equipment type
4. Fill in pickup stop details (first stop)
5. Fill in delivery stop details (last stop)
6. Add intermediate stops if needed
7. Enter shipment details (weight, miles, rate, commodity)
8. Optionally add notes
9. Click "Create Load" or use "Clear All" to reset

### Creating a Load (AI)

1. Click "🤖 AI Create Load" button in header
2. Type: "Create a load from Los Angeles, CA to San Francisco, CA"
3. AI automatically creates the load with defaults
4. Chat resets for next load

### Editing a Load

1. Click on a load card to open details
2. Click "Edit" button in header
3. Modify any fields
4. Click "Update Load"

### Sorting Loads

1. Use the "Sort by" dropdown above the load list
2. Select:
   - **Date**: Newest First or Oldest First
   - **Distance**: Shortest or Longest
3. Loads automatically re-sort

### Filtering Loads

1. Click "Filters" button in header
2. Enter search term or select filter options:
   - Search (customer name, load ID, origin/destination)
   - Pickup city or state
   - Delivery city or state
   - Equipment type
   - Number of stops
3. Results update automatically

### Calculating a Quote

1. Open load details
2. Navigate to "Calculator" tab
3. Enter base cost and miles
4. Add accessorial charges (click "+ Add Charge")
5. Enter margin percentage
6. Review calculated quote
7. Click "Save Quote" to persist to database

### Viewing Route Map

1. Open load details
2. Click "View on Map" button
3. View interactive map with route visualization
4. See origin and destination details in info box
5. Click markers for stop information

## 🧪 Demo Data

The application comes pre-loaded with:
- **10 Customers**: 
  - TechLogistics Inc.
  - FreshFood Transport
  - BuildRight Materials
  - Global Freight Solutions
  - AutoParts Express
  - ChemTrans Logistics
  - Retail Distribution Co.
  - Agricultural Transport
  - Furniture Movers Pro
  - Energy Solutions Transport
- **100 Loads**: 
  - 10 loads per customer
  - Diverse routes across 30+ US cities
  - Various equipment types
  - Different stop counts (2, 3, 4, 5+)
  - Realistic weights, miles, and rates

## 🏗️ Database Module Structure

The database layer is organized into focused, maintainable modules:

### `database/connection.js`
- Creates SQLite in-memory database connection
- Provides promisified database methods (`dbRun`, `dbGet`, `dbAll`, `dbExec`)

### `database/schema.js`
- Defines all table schemas (customers, loads, charges)
- Handles database initialization
- Manages initialization state to prevent duplicate schema creation

### `database/seedData.js`
- Contains demo customer and load data (10 customers, 100 loads)
- Provides seeding functions (`seedCustomers`, `seedLoads`)
- Exports `initializeDemoData()` for initial data population
- Programmatically generates diverse, realistic load data

### `database/loadOperations.js`
- All load-related database operations
- CRUD operations for loads
- Filtering and pagination logic
- Helper functions for ID generation
- `rowToLoad()` helper for data transformation

### `database/customerOperations.js`
- Customer retrieval operations
- Simple, focused customer queries

### `database/chargeOperations.js`
- Quote calculation and saving
- Accessorial charge management
- Links charges to loads and customers

### `database/laneHistoryOperations.js`
- Lane history queries
- Finds loads with matching origin/destination
- Optimized filtering logic

### `database/index.js`
- Main export file
- Aggregates all database operations
- Initializes demo data on module load
- Provides single import point for controllers

### Benefits of Modularization
- **Separation of Concerns**: Each module has a single responsibility
- **Maintainability**: Easier to find and update specific functionality
- **Testability**: Individual modules can be tested in isolation
- **Scalability**: Easy to add new operations or modules
- **Code Reusability**: Shared utilities and helpers
- **Reduced Complexity**: Average module size ~100 lines vs. original 751-line file

## 🎨 UI Components

### Custom Input Component
- Gray placeholder text for better visibility
- Consistent styling across all forms
- Focus states with blue ring
- Error message support
- Disabled states

### Custom Select Component
- Gray placeholder for empty state
- Dark text for selected values
- Consistent styling
- Error message support

### Card-Based Load Display
- Compact, professional design
- All essential information visible
- Hover effects and transitions
- Selected state with yellow border
- Delete button with confirmation

## 📝 Environment Variables

### Backend
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:5000)

## 🔄 Key Features Summary

### User Experience
- ✅ Card-based freight marketplace UI
- ✅ Split-screen layout (loads list + details panel)
- ✅ Compact, space-optimized forms
- ✅ Custom styled inputs and selects
- ✅ Sorting by date and distance
- ✅ Comprehensive filtering
- ✅ One-click delete with confirmation
- ✅ Edit functionality for all load fields
- ✅ Optional notes field
- ✅ Clear All button in create form

### AI Features
- ✅ Natural language load creation
- ✅ Auto-creation with smart defaults
- ✅ Chat-based interface
- ✅ Auto-reset after creation
- ✅ Ready for real AI integration

### Mapping
- ✅ Interactive route visualization
- ✅ Origin to destination route line
- ✅ Direction arrows
- ✅ Color-coded markers
- ✅ Info box with route details

### Data Management
- ✅ 100 loads, 10 customers (seed data)
- ✅ Pagination (5, 10, 20, 50 per page)
- ✅ Advanced filtering
- ✅ Sorting capabilities
- ✅ Full CRUD operations

## 🚀 Getting Started

1. **Clone the repository** (if applicable)
2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```
3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```
4. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```
5. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```
6. **Open your browser** to `http://localhost:3000`

## 📄 License

ISC

## 👥 Author

Freight Marketplace Development Team

---

**Note**: This is a freight marketplace platform built for managing transportation loads. The application uses an in-memory SQLite database, so data is reset on server restart. For production use, consider migrating to a persistent database solution.
