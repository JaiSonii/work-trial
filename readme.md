# Transportation Management System (TMS)

A full-stack web application for managing transportation loads, customers, and quotes. Built with Next.js frontend and Express.js backend with SQLite in-memory database.

## 🚀 Features

### Load Management
- **Create Loads**: Full form with customer selection, equipment type, multiple stops, and shipment details
- **AI Load Creator**: Natural language interface for creating loads automatically (see [AI Load Creator](#-ai-load-creator) section)
- **View Loads**: Paginated table view with filtering capabilities
- **Load Details**: Side panel with 4 tabs:
  - Load Details: Complete load information
  - Customer Details: Customer information and contact details
  - Lane History: Historical loads with same origin/destination
  - Calculator: Quote calculation with accessorial charges
- **Map View**: Interactive map showing route with all stops (using OpenStreetMap)

### Customer Management
- Customer database with company information
- MC Number, DOT Number, Tax ID tracking
- Primary contact details

### Filtering & Search
- Search by customer name, load ID, source/destination
- Filter by pickup city/state
- Filter by delivery city/state
- Filter by equipment type
- Filter by number of stops

### Quote Calculator
- Base cost and miles input
- Multiple accessorial charges (20+ charge types)
- Margin percentage calculation
- Automatic quote price calculation
- Save quotes to database with charge tracking

### AI Load Creator 🤖
- **Natural Language Processing**: Create loads using conversational language
- **Intelligent Extraction**: Automatically extracts load information from natural language input
- **Interactive Chat**: Chat-based interface that asks clarifying questions for missing information
- **Auto-verification**: Shows extracted data for user confirmation before creating the load
- **Mock AI Integration**: Currently uses mock AI processing (can be enhanced with real AI API integration)
- **Future Enhancement**: Can be improved with voice input for hands-free load creation

## 📁 Project Structure

```
Work Trial Project/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   │   ├── loadController.js
│   │   │   ├── customerController.js
│   │   │   └── calculatorController.js
│   │   ├── database/             # Database modules
│   │   │   ├── connection.js     # DB connection & promisified methods
│   │   │   ├── schema.js          # Table schema definitions
│   │   │   ├── seedData.js        # Demo data seeding
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
    │   │   ├── layout.tsx         # Root layout with filters
    │   │   ├── page.tsx           # Main loads page
    │   │   └── globals.css
    │   └── components/
│       ├── Loads.tsx          # Loads list with pagination
│       ├── Filters.tsx        # Filtering component
│       ├── CreateLoad.tsx     # Create load form
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

### Frontend
- **Next.js 14** (React framework)
- **TypeScript**
- **Tailwind CSS** for styling
- **Leaflet** with OpenStreetMap for maps

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

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

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
- `locationName` (string): Name of the location
- `address` (string): Street address
- `city` (string): City name
- `state` (string): State abbreviation
- `zipCode` (string): ZIP code
- `earlyArrival` (string): ISO date string for early arrival
- `lateArrival` (string): ISO date string for late arrival

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
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 4,
    "totalPages": 1,
    "hasNextPage": false,
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
  "commodity": "Electronics"
}
```

#### Update Load
```
PUT /api/loads/:id
```

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

### Loads Page
- **Table View**: Displays load ID, company name, pickup/delivery locations, dates, miles, and weight
- **Pagination**: Configurable items per page (5, 10, 20, 50)
- **Click to View**: Click any load row to open details side panel
- **Filtering**: Access filters from header to search and filter loads

### Load Details Panel
- **4 Tabs**:
  1. **Load Details**: Complete load information with all stops
  2. **Customer Details**: Full customer information and contact details
  3. **Lane History**: Historical loads on the same route
  4. **Calculator**: Quote calculation tool
- **Show Map Button**: Opens interactive map with route visualization

### Create Load Form
- Customer selection dropdown
- Equipment type selection (12 types)
- Dynamic stops management:
  - First stop: Fixed as "Pickup"
  - Last stop: Fixed as "Delivery"
  - Intermediate stops: Can be "Pickup" or "Delivery"
  - Add/remove intermediate stops
- Shipment details: Weight, Miles, Rate, Commodity
- Auto-generated Order ID

### Map View
- **OpenStreetMap Integration**: Free, no API key required
- **Route Visualization**: Shows all stops with color-coded markers
  - Green: Pickup
  - Red: Delivery
  - Blue: Intermediate
- **Origin/Destination Info Box**: Displays detailed information with arrival windows
- **Interactive Popups**: Click markers for stop details

### Calculator
- Base cost and miles input
- Multiple accessorial charges:
  - Detention, Layover, Stop-off, Reconsignment
  - Fuel Surcharge, Tarping, Loading/Unloading
  - Inside Delivery, Residential Delivery, Liftgate
  - Driver Assist, Overweight/Oversized, Hazmat
  - Temperature Control, Lumper Fee, Scale Ticket
  - Toll Charges, Permit Fee, Escort Service, Other
- Margin percentage input
- Real-time quote calculation
- Save to database

## 🔧 Code Architecture

### Backend Modularization

The database layer is modularized into separate files:

- **`database/connection.js`**: Database connection and promisified methods
- **`database/schema.js`**: Table schema definitions and initialization
- **`database/seedData.js`**: Demo data seeding functions
- **`database/loadOperations.js`**: All load-related database operations
- **`database/customerOperations.js`**: Customer database operations
- **`database/chargeOperations.js`**: Charge and quote operations
- **`database/laneHistoryOperations.js`**: Lane history queries
- **`database/index.js`**: Main export file that aggregates all operations

### Benefits of Modularization
- **Separation of Concerns**: Each module has a single responsibility
- **Maintainability**: Easier to find and update specific functionality
- **Testability**: Individual modules can be tested in isolation
- **Scalability**: Easy to add new operations or modules
- **Code Reusability**: Shared utilities and helpers

## 📝 Environment Variables

### Backend
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:5000)

## 🚦 Usage Examples

### Creating a Load

1. Click "Create Load" button in header
2. Select customer from dropdown
3. Select equipment type
4. Fill in pickup stop details (first stop)
5. Fill in delivery stop details (last stop)
6. Add intermediate stops if needed (can set type as pickup or delivery)
7. Enter shipment details (weight, miles, rate, commodity)
8. Submit form

### Calculating a Quote

1. Open load details
2. Navigate to "Calculator" tab
3. Enter base cost and miles
4. Add accessorial charges (click "+ Add Charge")
5. Enter margin percentage
6. Review calculated quote
7. Click "Save Quote" to persist to database

### Filtering Loads

1. Click "Filters" button in header
2. Enter search term or select filter options
3. Click "Apply Filters"
4. Results update automatically

### Viewing Route Map

1. Open load details
2. Click "Show Map" button
3. View interactive map with route and stop details
4. Click markers for stop information

### Using AI Load Creator

1. Click "🤖 AI Create Load" button in the header
2. Type your load details naturally, for example:
   - "Create a load for TechLogistics from Los Angeles, CA to San Francisco, CA using a Dry Van, weight 15000 lbs, 380 miles, rate $2850, commodity Electronics"
   - "I need a Refrigerated truck from Dallas, TX to Austin, TX for FreshFood Transport, 22000 lbs, 450 miles"
3. The AI will extract information and ask for any missing details
4. Review the extracted information when prompted
5. Type "yes" or "confirm" to create the load
6. The load will be automatically created and added to your system

**Example Conversations:**
```
User: Create a load for TechLogistics from LA to SF
AI: I need a few more details: equipment type, weight, miles, and commodity. Can you provide these?

User: Dry Van, 15000 lbs, 380 miles, Electronics
AI: Perfect! I've extracted all the information. [Shows summary] Would you like me to create this load?

User: yes
AI: ✅ Load created successfully! Order ID: ORD-0005
```

**Note**: The AI Load Creator currently uses mock AI processing. In a production environment, this can be integrated with real AI services (e.g., OpenAI GPT, Google Gemini) for more accurate natural language understanding. Additionally, voice input can be added for hands-free operation, making it even more convenient for users on the go.

## 🤖 AI Load Creator

The AI Load Creator is an innovative feature that allows users to create loads using natural language instead of filling out forms. This feature demonstrates the potential for AI-powered automation in transportation management.

### How It Works

1. **Natural Language Input**: Users describe their load in plain English
2. **AI Processing**: The system (currently mocked) extracts key information:
   - Customer name
   - Equipment type
   - Pickup and delivery locations
   - Weight, miles, rate
   - Commodity type
3. **Interactive Verification**: If information is missing, the AI asks clarifying questions
4. **Confirmation**: Once all data is collected, the AI presents a summary for user confirmation
5. **Auto-Creation**: Upon confirmation, the load is automatically created

### Current Implementation

- **Mock AI Service**: Uses pattern matching and keyword extraction to parse natural language
- **Chat Interface**: Real-time chat UI with message history
- **Smart Extraction**: Recognizes various phrasings and formats
- **Error Handling**: Gracefully handles incomplete or ambiguous input

### Future Enhancements

- **Real AI Integration**: Connect to AI services (OpenAI GPT-4, Google Gemini, etc.) for better understanding
- **Voice Input**: Add speech-to-text for hands-free load creation
- **Multi-language Support**: Support for multiple languages
- **Learning**: AI learns from user corrections and preferences
- **Smart Suggestions**: Suggest common routes, rates, and equipment based on history
- **Voice Output**: Audio confirmation for accessibility

### Example Use Cases

- **Quick Load Entry**: "Create a load for TechLogistics from LA to SF, Dry Van, 15000 lbs"
- **Conversational**: "I need to ship electronics from Los Angeles to San Francisco"
- **Partial Information**: "Pickup in Dallas, delivery in Austin, refrigerated truck"
- **Natural Phrasing**: "Ship 22000 pounds of food products from Dallas TX to Austin TX using a reefer"

## 🧪 Demo Data

The application comes pre-loaded with:
- **4 Customers**: TechLogistics Inc., FreshFood Transport, BuildRight Materials, Global Freight Solutions
- **4 Loads**: Various routes with different equipment types and stop counts

## 🏗️ Database Module Structure

The database layer is organized into focused modules:

### `database/connection.js`
- Creates SQLite in-memory database connection
- Provides promisified database methods (`dbRun`, `dbGet`, `dbAll`, `dbExec`)

### `database/schema.js`
- Defines all table schemas (customers, loads, charges)
- Handles database initialization
- Manages initialization state to prevent duplicate schema creation

### `database/seedData.js`
- Contains demo customer and load data
- Provides seeding functions (`seedCustomers`, `seedLoads`)
- Exports `initializeDemoData()` for initial data population

### `database/loadOperations.js`
- All load-related database operations
- CRUD operations for loads
- Filtering and pagination logic
- Helper functions for ID generation

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

## 🔄 Migration from Monolithic to Modular

The original `database.js` file (751 lines) has been split into:
- **8 focused modules** (average ~100 lines each)
- **Clear separation** of concerns
- **Improved maintainability** and testability

## 📄 License

ISC

## 👥 Author

TMS Development Team
