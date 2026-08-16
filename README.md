<div align="center">

# 📈 Stockify

### AI-Powered Stock Market & Paper Trading Platform

A full-stack investing workspace for exploring live markets, simulating trades, managing portfolios, and getting AI-powered investment insights.

<br />

[![Live Demo](https://img.shields.io/badge/🚀_LIVE_DEMO-Open_Stockify-8B5CF6?style=for-the-badge)](https://stockify-sm.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Kaniska1/Stockify)

<br />

![React](https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-AI-8E75FF?style=flat-square&logo=google&logoColor=white)

<br />

**[Launch Stockify →](https://stockify-sm.vercel.app/)**

No installation required. A demo account is available directly from the login page.

</div>

---

<img width="1917" height="832" alt="Stockify" src="https://github.com/user-attachments/assets/3e302214-8049-4406-b512-a6cb8d6a739c" />

---

## ✨ Overview

**Stockify** is a full-stack stock market management and paper-trading platform that brings market data, portfolio management, simulated trading, and AI-powered research into one focused investing workspace.

Rather than being a simple stock-price dashboard or CRUD portfolio tracker, Stockify provides an end-to-end simulated investing experience.

Users can:

- 📈 Explore live stock market data
- 💵 Buy and sell stocks using virtual funds
- 💼 Build and track a persistent portfolio
- 📊 Monitor profit, loss, holdings, and valuation
- ⭐ Maintain personalized watchlists
- 📜 Review complete transaction history
- 🔔 Receive persistent account notifications
- 🤖 Ask an AI investment research assistant
- 🧠 Analyze portfolio diversification and risk with AI

The application is fully deployed with a **React/Vite frontend on Vercel**, a **Node.js/Express API on Render**, and persistent data stored in **MongoDB Atlas**.

> **Stockify is a paper-trading and educational application. No real money or securities are involved.**

---

## 🚀 Live Demo

Stockify is deployed and can be used directly without cloning or installing the project.

### **[→ Open Stockify](https://stockify-sm.vercel.app/)**

A **Demo Login** is available on the authentication page, allowing visitors to explore the platform without creating a new account.

| Service | Deployment |
| :--- | :--- |
| **Frontend** | Vercel |
| **Backend API** | Render |
| **Database** | MongoDB Atlas |
| **Market Data** | Finnhub |
| **AI** | Google Gemini |

---

# 🚀 Features

## 🔐 Authentication & Accounts

Stockify implements a complete authentication system rather than relying on mocked frontend users.

- JWT-based authentication
- bcrypt password hashing
- User registration
- Email or username login
- Demo account
- Protected API routes
- Persistent sessions
- User profile management
- Password updates
- Virtual wallet management

Every new account receives virtual funds that can be used for paper trading.

---

## 📈 Live Market Data

Stockify integrates with **Finnhub** to retrieve real financial market data.

Users can:

- Search publicly traded companies
- View live stock quotes
- Explore market movers
- Track daily price changes
- View company information
- Inspect individual stock pages
- Monitor gains and losses
- Add stocks directly to a watchlist

Market information is presented through a focused interface designed to avoid the clutter of traditional trading dashboards.

---

## 💵 Paper Trading

Stockify includes a simulated trading system backed by persistent portfolio and transaction data.

Users can:

- Buy stocks using virtual funds
- Sell existing positions
- Select quantities
- Track execution prices
- Monitor remaining wallet balance
- Persist every transaction
- Automatically update portfolio holdings

This allows the application to simulate a simplified brokerage workflow without involving real financial transactions.

---

## 💼 Portfolio Management

Trades automatically update the user's portfolio.

The portfolio dashboard provides information such as:

- Current holdings
- Number of shares owned
- Average purchase price
- Total investment
- Current position value
- Profit and loss
- Portfolio valuation
- Available cash
- Portfolio performance

Portfolio information is stored persistently in MongoDB rather than existing only in frontend state.

---

## ⭐ Watchlist

Users can create a personalized collection of stocks they want to monitor.

Features include:

- Add stocks to watchlist
- Remove stocks
- Persistent watchlist storage
- Live price information
- Quick access to stock details

---

## 🤖 AI Investment Assistant

Stockify includes an AI-powered research assistant built using **Google Gemini**.

Instead of functioning as a generic chatbot, the assistant is designed around investing and financial education.

Users can ask questions such as:

> "What does P/E ratio mean?"

> "What are the risks of concentrating my portfolio in technology?"

> "How does diversification reduce risk?"

> "Compare these companies."

> "What should I look at before researching a stock?"

The assistant provides contextual explanations and helps users understand market and portfolio concepts.

---

## 🧠 AI Portfolio Analyzer

The AI Portfolio Analyzer works with the user's actual Stockify portfolio rather than requiring them to manually describe their holdings.

It evaluates factors such as:

- Portfolio Health
- Diversification
- Cash Utilization
- Concentration Risk
- Overall Risk
- Portfolio Strengths
- Portfolio Weaknesses
- Potential Areas for Improvement

The portfolio data is transformed into structured context and analyzed using **Google Gemini**.

> AI-generated output is intended for educational purposes and should not be interpreted as professional financial advice.

---

## 🔔 Notifications

Stockify maintains persistent notifications for important account activity.

Notifications can be generated for events such as:

- Stock purchases
- Stock sales
- Wallet deposits
- Account activity

Notifications are stored in MongoDB and remain available between sessions.

---

## 📜 Transaction History

Every simulated trade creates a transaction record.

Users can review:

- BUY / SELL operation
- Stock symbol
- Company name
- Quantity
- Execution price
- Total transaction value
- Transaction timestamp

This creates a persistent audit trail of portfolio activity.

---

# 📸 Screenshots

<div align="center">

<img width="48%" alt="Stockify Dashboard" src="https://github.com/user-attachments/assets/56cbf3c3-6457-413d-bc67-d1d9e95c6f9f" />
<img width="48%" alt="Stockify Market View" src="https://github.com/user-attachments/assets/d9307ae2-ddaf-4e81-8fe9-a8e97b28f48e" />

<br />

<img width="48%" alt="Stockify Portfolio" src="https://github.com/user-attachments/assets/8dbfa2f7-9ff3-4145-9046-110d8b1abc18" />
<img width="48%" alt="Stockify Stock Details" src="https://github.com/user-attachments/assets/d41d2e9d-9540-4d8e-b7bc-3fec33a00cdc" />

<br />

<img width="48%" alt="Stockify AI" src="https://github.com/user-attachments/assets/84211ab5-4c95-4eaf-aacc-537abb902542" />
<img width="48%" alt="Stockify Portfolio Analysis" src="https://github.com/user-attachments/assets/9aa6edfe-c8a4-4674-ba13-155698e0bbcd" />

</div>

---

# 🛠️ Tech Stack

## Frontend

| Technology | Purpose |
| :--- | :--- |
| **React** | Component-based frontend |
| **TypeScript** | Type-safe application development |
| **Vite** | Development and production build tooling |
| **React Router** | Client-side routing |
| **Tailwind CSS** | Styling |
| **Recharts** | Financial data visualization |
| **Lucide React** | Interface icons |
| **Sonner** | Toast notifications |

## Backend

| Technology | Purpose |
| :--- | :--- |
| **Node.js** | JavaScript runtime |
| **Express.js** | REST API server |
| **TypeScript** | Type-safe backend development |
| **MongoDB** | Persistent application database |
| **Mongoose** | MongoDB ODM and schema modelling |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |

## External Services

| Service | Purpose |
| :--- | :--- |
| **Finnhub API** | Live stock market data |
| **Google Gemini** | AI assistant and portfolio analysis |
| **MongoDB Atlas** | Managed cloud database |
| **Render** | Backend hosting |
| **Vercel** | Frontend hosting |

---

# 🧱 Architecture

```text
                              User
                               │
                               ▼
                    ┌────────────────────┐
                    │   React + Vite     │
                    │      Vercel        │
                    └─────────┬──────────┘
                              │
                         REST / JSON
                              │
                         JWT Bearer Auth
                              │
                              ▼
                    ┌────────────────────┐
                    │ Node.js + Express  │
                    │       Render       │
                    └─────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │   MongoDB   │ │   Finnhub   │ │   Gemini    │
       │    Atlas    │ │     API     │ │     AI      │
       └─────────────┘ └─────────────┘ └─────────────┘
              │               │               │
              ▼               ▼               ▼
        Users, Trades,    Live Market      AI Research &
        Portfolios &         Data         Portfolio Analysis
        Notifications
```

---

# 🔄 Application Flow

```text
                         Authentication
                               │
                               ▼
                           Dashboard
                               │
          ┌────────────────────┼─────────────────────┐
          │                    │                     │
          ▼                    ▼                     ▼
       Markets              Portfolio             AI Tools
          │                    │                     │
          ▼                    │              ┌──────┴──────┐
    Stock Details              │              │             │
       │      │                │              ▼             ▼
       │      │                │         AI Assistant   Portfolio
      BUY    SELL              │                         Analyzer
       │      │                │
       └──┬───┘                │
          ▼                    │
      Transaction ─────────────┘
          │
          ├──── Update Portfolio
          ├──── Update Wallet
          └──── Create Notification
```

---

# 🌐 REST API

The backend is organized into domain-specific REST endpoints.

```text
/api/auth
/api/portfolio
/api/transactions
/api/watchlist
/api/notifications
/api/market
/api/ai
```

Protected endpoints require an authentication token:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Authentication

```text
POST    /api/auth/register
POST    /api/auth/login
GET     /api/auth/me
PATCH   /api/auth/profile
PATCH   /api/auth/password
PATCH   /api/auth/wallet/deposit
```

The remaining routes handle portfolio operations, transactions, watchlists, notifications, market information, and AI functionality.

---

# 📂 Project Structure

```text
Stockify/
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── pages/
│   │   │   └── ...
│   │   │
│   │   └── styles/
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

---

# 🔐 Security

Stockify implements several security practices across the application:

- Passwords hashed using **bcrypt**
- JWT-based authentication
- Protected backend routes
- Authorization headers for authenticated requests
- Environment-based secret management
- Server-side request validation
- MongoDB authentication
- Production CORS configuration
- Separation between frontend and backend credentials

API keys, JWT secrets, and database credentials are never intended to be committed to the repository.

---

# 💻 Local Development

> **You do not need to run Stockify locally to use it.**
>
> The complete application is available at **[stockify-sm.vercel.app](https://stockify-sm.vercel.app/)**.

The following instructions are only for developers interested in running or modifying the source code.

### Clone the repository

```bash
git clone https://github.com/Kaniska1/Stockify.git
cd Stockify
```

### Install backend dependencies

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model

FINNHUB_API_KEY=your_finnhub_api_key
```

Start the backend:

```bash
npm run dev
```

### Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

Optionally create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

---

# 🚢 Deployment

Stockify uses separate deployments for the frontend and backend.

```text
GitHub
   │
   ├──────────────► Vercel
   │                 │
   │                 └── React/Vite Frontend
   │
   └──────────────► Render
                     │
                     └── Node/Express API
                              │
                              ▼
                         MongoDB Atlas
```

Production environment variables are configured independently on the relevant hosting platforms.

### Production

**Application**

[https://stockify-sm.vercel.app/](https://stockify-sm.vercel.app/)

**API**

[https://stockify-api-xsuy.onrender.com/](https://stockify-api-xsuy.onrender.com/)

---

# 🧪 What This Project Demonstrates

Stockify was built as more than a frontend stock dashboard.

It demonstrates practical experience with:

- Full-stack TypeScript development
- REST API design
- Authentication and authorization
- MongoDB schema modelling
- Persistent application state
- Financial transaction workflows
- Third-party API integration
- AI integration with application context
- Portfolio calculation logic
- Protected frontend and backend routes
- Responsive dashboard design
- Production environment configuration
- Separate frontend/backend deployments
- Debugging differences between Windows development and Linux production environments

---

# 🗺️ Roadmap

Potential future improvements include:

- 📊 Advanced TradingView-style charts
- 📰 Live financial news
- 🔔 Custom stock price alerts
- 🔍 Advanced stock screener
- 📄 Exportable portfolio reports
- 📈 Historical portfolio performance charts
- 🧠 Deeper AI stock research
- 📊 Sector and asset-allocation visualization
- ⚡ Market-data caching
- 🔄 Real-time updates using WebSockets/SSE
- 🧪 Automated API and frontend testing
- 🚀 Route-level code splitting and bundle optimization
- 📱 Progressive Web App support
- 🌍 Multi-currency portfolio support

---

# ⚠️ Disclaimer

**Stockify is an educational and portfolio project.**

The platform performs simulated trades using virtual funds and does **not** execute real securities transactions.

Market information and AI-generated responses are provided for demonstration and educational purposes only. They should not be considered financial, investment, legal, or tax advice.

---

# 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your work
5. Open a pull request

---

# 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

## 👨‍💻 Built by Kaniska Mitra

Built as a full-stack exploration of **financial technology, backend architecture, real-time market data, and applied generative AI**.

[![GitHub](https://img.shields.io/badge/GitHub-Kaniska1-181717?style=for-the-badge&logo=github)](https://github.com/Kaniska1)
[![Stockify](https://img.shields.io/badge/Live-Stockify-8B5CF6?style=for-the-badge)](https://stockify-sm.vercel.app/)

<br />

**If you found Stockify interesting, consider giving the repository a ⭐**

</div>
