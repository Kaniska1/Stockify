<div align="center">

# Stockify

### AI-Powered Stock Portfolio & Market Analysis Platform

Real-time stock tracking, intelligent portfolio insights, AI-powered investment assistant, watchlists, live market data, and portfolio analytics — all in one modern platform.


---

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-8E75FF?style=for-the-badge&logo=google)

</div>

<img width="1917" height="832" alt="Screenshot 2026-08-06 003730" src="https://github.com/user-attachments/assets/3e302214-8049-4406-b512-a6cb8d6a739c" />


---

# ✨ Overview

Stockify is a full-stack stock portfolio management platform that enables users to monitor investments, manage portfolios, analyze market trends, and receive AI-powered investment insights.

Unlike traditional CRUD portfolio trackers, Stockify combines:

- 📊 Live Market Data
- 🤖 AI Portfolio Analysis
- 💬 AI Investment Assistant
- 📈 Real-time Portfolio Tracking
- ⭐ Watchlists
- 🔔 Smart Notifications
- 💼 Portfolio Analytics

---

# 🚀 Features

## 🔐 Authentication

- JWT Authentication
- Secure Password Hashing
- Protected Routes
- User Profiles
- Session Persistence

---

## 📈 Market

- Live Stock Prices (Finnhub)
- Market Movers
- Price Change Tracking
- Live Gain/Loss
- Stock Search
- Detailed Stock Pages

---

## 💼 Portfolio

- Buy & Sell Stocks
- Portfolio Holdings
- Average Purchase Price
- Total Investment
- Profit & Loss
- Daily P&L
- Portfolio Valuation

---

## ⭐ Watchlist

- Add Stocks
- Remove Stocks
- Live Price Updates
- Quick Access

---

## 🤖 AI Features

### AI Investment Assistant

Ask questions like:

- Should I diversify?
- Explain P/E Ratio
- What are the risks in my portfolio?
- Compare two companies
- Investment education

---

### AI Portfolio Analyzer

Automatically evaluates:

- Portfolio Health Score
- Diversification Score
- Cash Utilization
- Concentration Risk
- Strengths
- Weaknesses
- Investment Suggestions
- Risk Assessment

Powered by **Google Gemini AI**

---

## 🔔 Notifications

- Buy Notifications
- Sell Notifications
- System Alerts

---

## 📜 Transactions

- Complete Transaction History
- Buy/Sell Records
- Order Details
- Timestamp Tracking

---

# 🛠 Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons
- React Router
- Sonner

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt

## APIs

- Finnhub API
- Google Gemini AI

---

# 🧱 Architecture

```text
                    React Frontend
                          │
            ┌─────────────┼─────────────┐
            │             │             │
      Authentication   Portfolio      Markets
            │             │             │
            └─────────────┼─────────────┘
                          │
                    Express Backend
                          │
      ┌───────────────────┼───────────────────┐
      │                   │                   │
   MongoDB            Finnhub API        Gemini AI
      │                   │                   │
 Users & Data       Live Market Data    AI Analysis
```

---

# 📂 Project Structure

```text
Stockify
│
├── client
│   ├── src
│   │   ├── app
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── lib
│   │   ├── pages
│   │   └── styles
│
├── server
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── utils
│   └── config
```

---

# ⚡ Getting Started

## Clone Repository

```bash
git clone https://github.com/Kaniska1/Stockify.git
```

```bash
cd Stockify
```

---

## Backend

```bash
cd server
npm install
npm run dev
```

---

## Frontend

```bash
cd client
npm install
npm run dev
```

---

# 🔑 Environment Variables

## Backend

```env
PORT=

MONGODB_URI=

JWT_SECRET=

GEMINI_API_KEY=
GEMINI_MODEL=

FINNHUB_API_KEY=
```

---

# 📸 Screenshots

<div align="center">

<img width="48%" height="20%" alt="Screenshot 2026-08-06 003914" src="https://github.com/user-attachments/assets/56cbf3c3-6457-413d-bc67-d1d9e95c6f9f" />
<img width="48%" height="20%" alt="Screenshot 2026-08-06 003941" src="https://github.com/user-attachments/assets/d9307ae2-ddaf-4e81-8fe9-a8e97b28f48e" />
<img width="48%" height="20%" alt="image" src="https://github.com/user-attachments/assets/8dbfa2f7-9ff3-4145-9046-110d8b1abc18" />
<img width="48%" height="20%" alt="Screenshot 2026-08-06 004012" src="https://github.com/user-attachments/assets/d41d2e9d-9540-4d8e-b7bc-3fec33a00cdc" />
<img width="48%" height="20%" alt="Screenshot 2026-08-06 004116" src="https://github.com/user-attachments/assets/84211ab5-4c95-4eaf-aacc-537abb902542" />
<img width="48%" height="20%" alt="Screenshot 2026-08-06 004150" src="https://github.com/user-attachments/assets/9aa6edfe-c8a4-4674-ba13-155698e0bbcd" />


</div>


---

# 🚧 Upcoming Features

- 📊 TradingView Charts
- 📰 Live Market News
- 📄 PDF Portfolio Reports
- 🤖 AI Stock Research
- 🔍 Advanced Stock Screener
- 📈 Portfolio Allocation Charts
- 🌙 Redesigned Premium UI
- 📱 Progressive Web App
- 🔔 Price Alerts
- 🌍 Multi-Currency Support

---

# 🤝 Contributing

Contributions are welcome.

Feel free to fork the repository, create a feature branch, and submit a pull request.

---

# 📄 License

This project is licensed under the MIT License.

---

<div align="center">

### Built with ❤️ by Kaniska Mitra

⭐ Star the repository if you found it useful!

</div>
