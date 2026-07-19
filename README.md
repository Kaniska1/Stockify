# Stockify

Stockify is a modern stock market dashboard and portfolio simulator built with React, TypeScript, and Vite.

It provides a rich front-end experience for exploring market data, viewing stock details, managing a virtual portfolio, tracking transactions, and interacting with a polished financial UI inspired by a Figma-based workflow.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [How the App Is Organized](#how-the-app-is-organized)
- [Data and State Management](#data-and-state-management)
- [Styling and Theming](#styling-and-theming)
- [Attributions](#attributions)
- [Design Source](#design-source)

---

## Overview

Stockify is a single-page web app focused on stock discovery and portfolio interaction.  
The project appears to be generated from a Figma-to-code flow and then organized into a maintainable React structure.

From the current codebase, the app includes:

- Authentication flows (login and signup)
- Dashboard and market analysis views
- Stock list and detailed stock pages
- Portfolio and transaction tracking screens
- Profile and account-oriented screens
- Command palette and wallet funding modal for quick actions

---

## Features

### Core Product Screens

- **Login page** (`src/app/pages/LoginPage.tsx`)
- **Signup page** (`src/app/pages/SignupPage.tsx`)
- **Dashboard page** (`src/app/pages/DashboardPage.tsx`)
- **Stocks listing page** (`src/app/pages/StocksPage.tsx`)
- **Stock detail page** (`src/app/pages/StockDetailPage.tsx`)
- **Portfolio page** (`src/app/pages/PortfolioPage.tsx`)
- **Transactions page** (`src/app/pages/TransactionsPage.tsx`)
- **Market analysis page** (`src/app/pages/MarketAnalysisPage.tsx`)
- **Profile page** (`src/app/pages/ProfilePage.tsx`)

### Key UI Components

- Reusable app layout (`src/app/components/Layout.tsx`)
- Command palette for quick navigation/actions (`src/app/components/CommandPalette.tsx`)
- Wallet funding modal (`src/app/components/FundWalletModal.tsx`)
- Extensive reusable UI primitives in `src/app/components/ui`

### State and Data

- Authentication context (`src/app/context/AuthContext.tsx`)
- App-level state context (`src/app/context/AppContext.tsx`)
- Local stock dataset (`src/app/data/stocks.ts`)

---

## Tech Stack

### Frameworks and Build Tools

- **React 18** (peer dependency)
- **TypeScript**
- **Vite 6**

### UI and Styling

- **Tailwind CSS v4** (`tailwindcss`, `@tailwindcss/vite`)
- **Radix UI** primitives
- **MUI** (`@mui/material`, `@mui/icons-material`)
- **Emotion** (`@emotion/react`, `@emotion/styled`)
- Utility libraries: `clsx`, `class-variance-authority`, `tailwind-merge`

### Charts, Motion, and Interaction

- **Recharts** for charts
- **motion** for animations
- **react-router** for routing
- Additional helpers: `sonner`, `react-hook-form`, `embla-carousel-react`, `cmdk`, and more

### Package Management

- `pnpm-lock.yaml` is present
- You can run the project with npm commands (shown below)

---

## Project Structure

```text
Stockify/
├── .gitignore
├── ATTRIBUTIONS.md
├── README.md
├── default_shadcn_theme.css
├── guidelines/
│   └── Guidelines.md
├── index.html
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── app/
    │   ├── App.tsx
    │   ├── components/
    │   │   ├── CommandPalette.tsx
    │   │   ├── FundWalletModal.tsx
    │   │   ├── Layout.tsx
    │   │   ├── figma/
    │   │   └── ui/
    │   ├── context/
    │   │   ├── AppContext.tsx
    │   │   └── AuthContext.tsx
    │   ├── data/
    │   │   └── stocks.ts
    │   └── pages/
    │       ├── DashboardPage.tsx
    │       ├── LoginPage.tsx
    │       ├── MarketAnalysisPage.tsx
    │       ├── PortfolioPage.tsx
    │       ├── ProfilePage.tsx
    │       ├── SignupPage.tsx
    │       ├── StockDetailPage.tsx
    │       ├── StocksPage.tsx
    │       └── TransactionsPage.tsx
    ├── imports/
    │   └── pasted_text/
    └── styles/
        ├── fonts.css
        ├── globals.css
        ├── index.css
        ├── tailwind.css
        └── theme.css
```

---

## Getting Started

### Prerequisites

- **Node.js** (recommended: current LTS)
- **npm** or **pnpm**

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

By default, Vite serves the app at:

- `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## Available Scripts

Defined in `package.json`:

- `npm run dev` — Starts Vite development server
- `npm run build` — Creates a production build

---

## How the App Is Organized

- `src/main.tsx` bootstraps the React app.
- `src/app/App.tsx` acts as the app shell and route-level composition root.
- `src/app/pages` contains page-level screens.
- `src/app/components` contains reusable app and UI components.
- `src/app/context` encapsulates shared auth and app state.
- `src/app/data/stocks.ts` provides stock-related source data for UI rendering.
- `src/styles` contains global styles, theme variables, and Tailwind entry files.

This separation keeps page composition, shared state, and reusable UI concerns clean and scalable.

---

## Data and State Management

Stockify currently appears to rely on local/application state and static data for core interactions:

- Authentication/session behavior is managed via `AuthContext`.
- Cross-feature app state is managed via `AppContext`.
- Stock records and market demo data come from `src/app/data/stocks.ts`.

If you later integrate real market APIs, these are natural extension points for async fetching, caching, and persistence.

---

## Styling and Theming

Styling combines utility-first and component-driven approaches:

- Tailwind setup in `src/styles/tailwind.css`
- Theme-level CSS tokens/system in `src/styles/theme.css`
- Additional font/global files in `src/styles/`
- `default_shadcn_theme.css` indicates shadcn-style theme compatibility

---

## Attributions

See [`ATTRIBUTIONS.md`](./ATTRIBUTIONS.md) for third-party and generated-content attribution details.

---

## Optional Next Improvements

You can further improve this README by adding:

- Screenshots/GIF previews
- Architecture diagram
- Deployment steps (Vercel/Netlify)
- Environment variable template
- Contribution guidelines
- License section
