export interface PricePoint {
  date: string;
  price: number;
}

export interface Stock {
  id: string;
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  dailyHigh: number;
  dailyLow: number;
  openingPrice: number;
  previousClose: number;
  marketCap: number; // billions USD
  sector: string;
  volume: number; // millions
  description: string;
  priceHistory: PricePoint[];
  color: string; // for avatar
}

interface StockDef {
  symbol: string;
  name: string;
  basePrice: number;
  volatility: number; // % per day
  marketCap: number;
  sector: string;
  volume: number;
  description: string;
  color: string;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    return ((s >>> 0) / 4294967296);
  };
}

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

function genPriceHistory(basePrice: number, volatility: number, seed: number, days = 90): PricePoint[] {
  const rand = seededRandom(seed);
  const history: PricePoint[] = [];
  let price = basePrice * (0.85 + rand() * 0.1);
  const today = new Date('2026-07-19');

  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const drift = 0.0003;
    const shock = (volatility / 100) * (rand() * 2 - 1);
    price = Math.max(price * (1 + drift + shock), 0.5);
    history.push({
      date: d.toISOString().split('T')[0],
      price: +price.toFixed(2),
    });
  }
  return history;
}

function createStock(def: StockDef): Stock {
  const seed = hashStr(def.symbol);
  const rand = seededRandom(seed + 9999);
  const history = genPriceHistory(def.basePrice, def.volatility, seed);
  const currentPrice = history[history.length - 1].price;
  const previousClose = history[history.length - 2].price;
  const change = +(currentPrice - previousClose).toFixed(2);
  const changePercent = +((change / previousClose) * 100).toFixed(2);
  const spread = currentPrice * 0.018;
  const dailyHigh = +(currentPrice + rand() * spread).toFixed(2);
  const dailyLow = +(currentPrice - rand() * spread).toFixed(2);
  const openingPrice = +(previousClose * (1 + (rand() - 0.5) * 0.008)).toFixed(2);

  return {
    id: def.symbol.toLowerCase(),
    symbol: def.symbol,
    companyName: def.name,
    currentPrice,
    change,
    changePercent,
    dailyHigh: Math.max(dailyHigh, currentPrice),
    dailyLow: Math.min(dailyLow, currentPrice),
    openingPrice,
    previousClose,
    marketCap: def.marketCap,
    sector: def.sector,
    volume: def.volume,
    description: def.description,
    priceHistory: history,
    color: def.color,
  };
}

const STOCK_DEFS: StockDef[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 214.5, volatility: 1.6, marketCap: 3280, sector: 'Technology', volume: 62.4, description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.', color: '#6366f1' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 418.2, volatility: 1.4, marketCap: 3110, sector: 'Technology', volume: 22.8, description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.', color: '#3b82f6' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 118.4, volatility: 3.2, marketCap: 2890, sector: 'Technology', volume: 289.6, description: 'NVIDIA Corporation designs and manufactures graphics, computing and networking solutions used in gaming and professional visualization.', color: '#10b981' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 178.3, volatility: 1.5, marketCap: 2180, sector: 'Technology', volume: 25.1, description: 'Alphabet Inc. provides various products and platforms including search, advertising, cloud, and hardware.', color: '#f59e0b' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 196.8, volatility: 1.8, marketCap: 2070, sector: 'E-commerce', volume: 45.2, description: 'Amazon.com Inc. engages in the retail sale of consumer products and subscriptions through online and physical stores worldwide.', color: '#f97316' },
  { symbol: 'META', name: 'Meta Platforms Inc.', basePrice: 524.6, volatility: 2.1, marketCap: 1340, sector: 'Technology', volume: 18.7, description: 'Meta Platforms Inc. develops social media products connecting people through mobile devices, PCs, and other surfaces.', color: '#0ea5e9' },
  { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 248.9, volatility: 3.8, marketCap: 793, sector: 'Automotive', volume: 98.4, description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, energy storage and generation systems.', color: '#ef4444' },
  { symbol: 'NFLX', name: 'Netflix Inc.', basePrice: 692.4, volatility: 2.2, marketCap: 298, sector: 'Entertainment', volume: 4.8, description: 'Netflix, Inc. provides entertainment services including streaming of TV series, documentaries, feature films, and mobile games.', color: '#dc2626' },
  { symbol: 'INTC', name: 'Intel Corp.', basePrice: 24.6, volatility: 2.5, marketCap: 105, sector: 'Technology', volume: 42.6, description: 'Intel Corporation designs, develops, manufactures, markets, and sells computing and related products and technologies worldwide.', color: '#0284c7' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', basePrice: 162.8, volatility: 3.0, marketCap: 263, sector: 'Technology', volume: 56.2, description: 'Advanced Micro Devices, Inc. operates as a semiconductor company worldwide, offering microprocessors and graphics products.', color: '#e11d48' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', basePrice: 224.5, volatility: 1.2, marketCap: 647, sector: 'Finance', volume: 9.6, description: 'JPMorgan Chase & Co. operates as a financial services company worldwide, offering investment banking, commercial banking, and asset management.', color: '#1d4ed8' },
  { symbol: 'BAC', name: 'Bank of America Corp.', basePrice: 41.8, volatility: 1.5, marketCap: 328, sector: 'Finance', volume: 38.4, description: 'Bank of America Corporation provides banking and financial products and services for individual consumers, small businesses, and institutions.', color: '#1e40af' },
  { symbol: 'WMT', name: 'Walmart Inc.', basePrice: 71.4, volatility: 0.9, marketCap: 576, sector: 'Consumer Goods', volume: 12.8, description: 'Walmart Inc. engages in the operation of retail and wholesale stores worldwide, offering merchandise and grocery products.', color: '#0369a1' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', basePrice: 152.6, volatility: 0.8, marketCap: 367, sector: 'Healthcare', volume: 7.4, description: 'Johnson & Johnson researches and develops, manufactures, and sells various products in the healthcare field worldwide.', color: '#c2410c' },
  { symbol: 'V', name: 'Visa Inc.', basePrice: 289.4, volatility: 1.1, marketCap: 587, sector: 'Finance', volume: 6.8, description: 'Visa Inc. operates as a payments technology company worldwide, facilitating digital payments between consumers, merchants, and financial institutions.', color: '#1e3a8a' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', basePrice: 68.4, volatility: 2.4, marketCap: 73, sector: 'Finance', volume: 14.8, description: 'PayPal Holdings, Inc. operates a technology platform that enables digital payments on behalf of merchants and consumers worldwide.', color: '#1d4ed8' },
  { symbol: 'DIS', name: 'Walt Disney Co.', basePrice: 108.6, volatility: 1.6, marketCap: 198, sector: 'Entertainment', volume: 11.4, description: 'The Walt Disney Company, together with its subsidiaries and affiliates, operates as an entertainment company worldwide.', color: '#7c3aed' },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', basePrice: 78.4, volatility: 2.8, marketCap: 162, sector: 'Technology', volume: 24.6, description: 'Uber Technologies, Inc. develops and operates proprietary technology applications in the United States, Canada, Latin America, Europe, and elsewhere.', color: '#111827' },
  { symbol: 'SNAP', name: 'Snap Inc.', basePrice: 12.8, volatility: 4.2, marketCap: 21, sector: 'Technology', volume: 28.4, description: 'Snap Inc. operates as a camera and social media company in North America, Europe, and internationally.', color: '#eab308' },
  { symbol: 'SHOP', name: 'Shopify Inc.', basePrice: 78.6, volatility: 3.2, marketCap: 102, sector: 'E-commerce', volume: 8.6, description: 'Shopify Inc. provides a commerce platform and services in Canada, the United States, Europe, and internationally.', color: '#16a34a' },
  { symbol: 'SQ', name: 'Block Inc.', basePrice: 72.4, volatility: 3.5, marketCap: 43, sector: 'Finance', volume: 6.8, description: 'Block, Inc. creates tools that help sellers of all sizes start, run, and grow their businesses.', color: '#111827' },
  { symbol: 'ZM', name: 'Zoom Video Communications', basePrice: 68.2, volatility: 2.8, marketCap: 21, sector: 'Technology', volume: 5.4, description: 'Zoom Video Communications, Inc. provides unified communications platform in the Americas, Asia Pacific, and Europe, Middle East, and Africa.', color: '#2563eb' },
  { symbol: 'PLTR', name: 'Palantir Technologies', basePrice: 28.6, volatility: 3.8, marketCap: 62, sector: 'Technology', volume: 48.6, description: 'Palantir Technologies Inc. builds and deploys software platforms for the intelligence community in the United States.', color: '#0f172a' },
  { symbol: 'RBLX', name: 'Roblox Corp.', basePrice: 42.8, volatility: 3.6, marketCap: 27, sector: 'Entertainment', volume: 14.2, description: 'Roblox Corporation develops and operates an online entertainment platform, enabling anyone to imagine, create, and have fun.', color: '#e11d48' },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', basePrice: 228.4, volatility: 5.2, marketCap: 58, sector: 'Finance', volume: 8.4, description: 'Coinbase Global, Inc. provides financial infrastructure and technology for the cryptoeconomy in the United States and internationally.', color: '#0ea5e9' },
  { symbol: 'CRM', name: 'Salesforce Inc.', basePrice: 284.6, volatility: 1.8, marketCap: 275, sector: 'Technology', volume: 4.8, description: 'Salesforce, Inc. provides Customer Relationship Management (CRM) technology that brings companies and customers together worldwide.', color: '#0ea5e9' },
  { symbol: 'ORCL', name: 'Oracle Corp.', basePrice: 152.8, volatility: 1.4, marketCap: 418, sector: 'Technology', volume: 8.6, description: 'Oracle Corporation offers products and services that address enterprise information technology environments worldwide.', color: '#dc2626' },
  { symbol: 'IBM', name: 'IBM Corp.', basePrice: 196.4, volatility: 1.0, marketCap: 179, sector: 'Technology', volume: 4.2, description: 'International Business Machines Corporation provides integrated solutions and services worldwide in hybrid cloud and AI.', color: '#1d4ed8' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', basePrice: 186.8, volatility: 2.2, marketCap: 208, sector: 'Technology', volume: 9.6, description: 'QUALCOMM Incorporated engages in the development and commercialization of foundational technologies for the wireless industry.', color: '#dc2626' },
  { symbol: 'ADBE', name: 'Adobe Inc.', basePrice: 442.8, volatility: 1.8, marketCap: 196, sector: 'Technology', volume: 3.8, description: 'Adobe Inc. operates as a diversified software company worldwide, providing Digital Media and Digital Experience solutions.', color: '#dc2626' },
  { symbol: 'NOW', name: 'ServiceNow Inc.', basePrice: 882.4, volatility: 1.6, marketCap: 182, sector: 'Technology', volume: 1.4, description: 'ServiceNow, Inc. provides enterprise cloud computing solutions that define, structure, consolidate, manage, and automate services.', color: '#16a34a' },
  { symbol: 'SPOT', name: 'Spotify Technology', basePrice: 384.6, volatility: 2.4, marketCap: 78, sector: 'Entertainment', volume: 2.8, description: 'Spotify Technology S.A., together with its subsidiaries, provides audio streaming services worldwide.', color: '#16a34a' },
  { symbol: 'ABNB', name: 'Airbnb Inc.', basePrice: 148.4, volatility: 2.6, marketCap: 93, sector: 'E-commerce', volume: 6.4, description: 'Airbnb, Inc. operates a platform that enables hosts to offer stays and experiences to guests worldwide.', color: '#e11d48' },
  { symbol: 'DASH', name: 'DoorDash Inc.', basePrice: 178.6, volatility: 2.8, marketCap: 72, sector: 'E-commerce', volume: 7.2, description: 'DoorDash, Inc. operates a logistics platform that connects merchants, consumers, and independent contractors.', color: '#dc2626' },
  { symbol: 'RIVN', name: 'Rivian Automotive', basePrice: 11.8, volatility: 5.6, marketCap: 12, sector: 'Automotive', volume: 42.8, description: 'Rivian Automotive, Inc. designs, develops, manufactures, and sells electric vehicles and accessories.', color: '#059669' },
  { symbol: 'LCID', name: 'Lucid Group Inc.', basePrice: 3.48, volatility: 6.2, marketCap: 8, sector: 'Automotive', volume: 68.4, description: 'Lucid Group, Inc. a technology company, designs, engineers, and builds electric vehicles and EV powertrains.', color: '#7c3aed' },
  { symbol: 'AFRM', name: 'Affirm Holdings Inc.', basePrice: 42.6, volatility: 4.2, marketCap: 13, sector: 'Finance', volume: 12.6, description: 'Affirm Holdings, Inc. operates a platform for digital and mobile-first commerce in the United States and Canada.', color: '#0f172a' },
  { symbol: 'SOFI', name: 'SoFi Technologies Inc.', basePrice: 10.4, volatility: 3.8, marketCap: 10, sector: 'Finance', volume: 28.6, description: 'SoFi Technologies, Inc. provides digital financial services that help members borrow, save, spend, invest, and protect their money.', color: '#6366f1' },
  { symbol: 'HOOD', name: 'Robinhood Markets Inc.', basePrice: 22.4, volatility: 4.8, marketCap: 19, sector: 'Finance', volume: 14.8, description: 'Robinhood Markets, Inc. operates a financial services platform offering brokerage, cryptocurrency, and cash management services.', color: '#16a34a' },
  { symbol: 'LYFT', name: 'Lyft Inc.', basePrice: 17.6, volatility: 4.2, marketCap: 6, sector: 'Technology', volume: 18.4, description: 'Lyft, Inc. operates a peer-to-peer marketplace for on-demand ridesharing in the United States and Canada.', color: '#e879f9' },
  { symbol: 'RELI', name: 'Reliance Industries', basePrice: 33.8, volatility: 1.4, marketCap: 228, sector: 'Energy', volume: 18.6, description: 'Reliance Industries Limited operates as a conglomerate in India, with businesses in petrochemicals, refining, oil and gas, retail, telecommunications, and financial services.', color: '#dc2626' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', basePrice: 21.4, volatility: 1.2, marketCap: 194, sector: 'Technology', volume: 8.4, description: 'Tata Consultancy Services Limited provides IT services, business solutions, and outsourcing services in India and internationally.', color: '#1d4ed8' },
  { symbol: 'INFY', name: 'Infosys Ltd.', basePrice: 18.6, volatility: 1.4, marketCap: 78, sector: 'Technology', volume: 14.2, description: 'Infosys Limited provides consulting, technology, outsourcing, and next-generation digital services to clients in multiple countries.', color: '#1d4ed8' },
  { symbol: 'HDFC', name: 'HDFC Bank Ltd.', basePrice: 74.8, volatility: 1.1, marketCap: 137, sector: 'Finance', volume: 6.8, description: 'HDFC Bank Limited provides various banking and financial services including commercial, transactional, and treasury banking.', color: '#1e40af' },
  { symbol: 'ICICI', name: 'ICICI Bank Ltd.', basePrice: 27.4, volatility: 1.3, marketCap: 97, sector: 'Finance', volume: 12.6, description: 'ICICI Bank Limited provides banking and financial services including retail and corporate banking in India and internationally.', color: '#dc2626' },
];

export const STOCKS: Stock[] = STOCK_DEFS.map(createStock);
export const STOCKS_MAP: Record<string, Stock> = Object.fromEntries(STOCKS.map(s => [s.id, s]));
export const SECTORS = [...new Set(STOCKS.map(s => s.sector))].sort();
