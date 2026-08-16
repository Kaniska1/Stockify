You are an expert full-stack software engineer and UI/UX designer. Build a **production-quality Stock Market Management System** as a complete web application.

This should **NOT** look like a generic AI-generated dashboard. I want something that looks like a modern fintech platform (similar to Zerodha, Groww, Robinhood, TradingView, or Stripe Dashboard) with attention to spacing, typography, animations, and user experience.

## Tech Stack

Frontend

Next.js (JavaScript/JSX only, NOT TypeScript)
Tailwind CSS
shadcn/ui
React Hooks
React Context (or simple state management where appropriate)
Recharts for charts
Lucide React icons

Backend

* Node.js
* Express.js

Database

* MongoDB
* Mongoose ODM

Authentication

* JWT Authentication
* Password hashing using bcrypt
* Secure authentication middleware
* Protected routes
* Refresh authentication state
* Store users in MongoDB
* Never store plain text passwords

## UI Requirements

Create a **premium dark mode UI**.

The design should be:

* sleek
* elegant
* modern
* professional
* fintech-inspired
* minimal yet visually rich

Avoid:

* generic AI-generated layouts
* oversized cards
* random gradients everywhere
* poor spacing
* ugly tables

Use:

* shadcn/ui components extensively
* Cards
* Tables
* Dialogs
* Dropdown menus
* Sheets
* Tooltips
* Toast notifications
* Skeleton loading
* Badges
* Tabs
* Data tables
* Progress indicators

Use:

* subtle glassmorphism where appropriate
* smooth hover animations
* beautiful charts
* consistent spacing
* responsive layouts
* rounded corners
* shadows
* proper typography hierarchy

The website should feel polished enough to showcase as a portfolio project.

---

# Authentication

Implement complete authentication.

### Signup

Collect:

* Full Name
* Email
* Username
* Password
* Confirm Password

Validate:

* unique email
* unique username
* password strength

Store user in MongoDB.

Hash passwords using bcrypt.

### Login

Authenticate using:

* email/username
* password

Generate JWT.

Store authentication securely.

Persist login.

Protected routes should redirect unauthenticated users.

---

# Database Models

Create proper MongoDB schemas.

## User

* name
* username
* email
* password (hashed)
* walletBalance
* profileImage
* createdAt

---

## Stock

* stockSymbol
* companyName
* currentPrice
* dailyHigh
* dailyLow
* openingPrice
* previousClose
* marketCap
* sector
* volume
* description
* priceHistory
* createdAt

---

## Portfolio

* userId
* holdings

  * stockId
  * quantity
  * averageBuyPrice
* totalInvestment
* currentValue

---

## Transaction

* userId
* stockId
* quantity
* buyPrice
* totalAmount
* transactionType (BUY / SELL)
* timestamp

---

# Features

## Dashboard

Show

* Welcome message
* Portfolio value
* Today's profit/loss
* Overall returns
* Holdings summary
* Recent transactions
* Market overview
* Top gainers
* Top losers
* Popular stocks

Beautiful charts should be included.

---

## Stock Market

Create a Stocks page.

Display

* Search
* Filters
* Sort
* Pagination

Columns

* Company
* Symbol
* Current Price
* Change
* Change %
* Volume

Clicking a stock opens a detailed page.

---

## Stock Details

Show

* Company information
* Live price (mock live updates)
* Historical chart
* Day high
* Day low
* Previous close
* Volume
* Market cap
* Buy button
* Sell button

Use Recharts for graphs.

---

## Buy Stocks

Allow users to

* enter quantity
* calculate total automatically
* confirm purchase

Validation

* sufficient wallet balance
* valid quantity

On purchase

* update wallet
* update portfolio
* create transaction

---

## Sell Stocks

Allow selling owned shares.

Validate

* cannot sell more than owned
* update holdings
* update wallet
* record transaction

---

## Portfolio

Display

* all owned stocks
* average buying price
* current price
* total invested
* current value
* profit/loss
* profit percentage

Charts

* allocation pie chart
* portfolio growth chart

---

## Transaction History

Provide

* search
* filters
* date filtering
* pagination

Columns

* Date
* Stock
* Quantity
* Buy/Sell
* Price
* Total

---

## Market Analysis

Include

* market summary
* trending stocks
* gainers
* losers
* sector performance
* overall market statistics

Use attractive charts.

---

## Profile

Allow users to

* edit profile
* upload avatar
* change password
* view account details

---

# Admin Seed Data

Automatically seed MongoDB with around 40–50 realistic companies.

Examples:

* Apple
* Microsoft
* Google
* Amazon
* NVIDIA
* Meta
* Tesla
* Netflix
* Intel
* AMD
* Reliance
* TCS
* Infosys
* HDFC Bank
* ICICI Bank

Generate realistic stock prices and historical data.

---

# API Design

Create a well-structured REST API.

Examples:

```
POST /api/auth/register
POST /api/auth/login

GET /api/stocks
GET /api/stocks/:id

POST /api/stocks/buy
POST /api/stocks/sell

GET /api/portfolio

GET /api/transactions

PUT /api/profile

GET /api/market-analysis
```

Use proper MVC architecture.

```
controllers/
routes/
middleware/
models/
services/
config/
utils/
```

---

# Validation

Use proper validation everywhere.

* invalid quantities
* duplicate users
* invalid JWT
* insufficient balance
* invalid stock IDs
* server errors

Return meaningful HTTP status codes.

---

# Security

Implement

* JWT authentication
* bcrypt password hashing
* Helmet
* CORS
* Rate limiting
* Environment variables
* Input sanitization
* Error handling middleware

Never expose secrets.

---

# Folder Structure

Create a clean professional project structure.

Separate frontend and backend.

```
stock-market-management-system/
│
├── client/                 # Next.js Frontend
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── services/
│   ├── context/
│   ├── public/
│   ├── styles/
│   ├── utils/
│   ├── package.json
│   └── next.config.js
│
├── server/                 # Express Backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── seed/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── README.md
```
# Code Quality

* Modular components
* Reusable hooks
* Reusable services
* Clean, well-organized JavaScript (ES6+) using JSX
* Clean naming
* Comments only where necessary
* No duplicated logic
* No placeholder code

---

# Responsiveness

The website must work beautifully on

* Desktop
* Laptop
* Tablet
* Mobile

---

# Extra Polish

Include

* loading skeletons
* empty states
* error pages
* 404 page
* animated page transitions
* toast notifications
* confirmation dialogs
* searchable tables
* beautiful icons
* subtle micro-interactions
* smooth hover effects
* polished charts
* responsive sidebar
* collapsible navigation
* command palette (Ctrl+K)
* dark theme throughout

---

# Important

Do **not** leave features as placeholders. Every feature should be fully functional with MongoDB persistence. Authentication, portfolio updates, transactions, wallet balance, buying/selling logic, and user management must work end-to-end.

Follow clean architecture and production-ready coding practices. Build this as if it were a real fintech application suitable for deployment and as a strong portfolio project. Use realistic mock market data (or a seeding mechanism) rather than hardcoded values scattered throughout the code. Ensure the application is easy to extend later with real stock market APIs (such as Alpha Vantage, Finnhub, Twelve Data, or Yahoo Finance).
