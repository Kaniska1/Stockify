import * as icons from "simple-icons";

export function getStockLogo(symbol: string) {
  const map: Record<string, keyof typeof icons> = {
    AAPL: "siApple",
    MSFT: "siMicrosoft",
    NVDA: "siNvidia",
    GOOG: "siGoogle",
    GOOGL: "siGoogle",
    META: "siMeta",
    AMZN: "siAmazon",
    TSLA: "siTesla",
    NFLX: "siNetflix",
    AMD: "siAmd",
    INTC: "siIntel",
    ORCL: "siOracle",
    IBM: "siIbm",
    CRM: "siSalesforce",
    ADBE: "siAdobe",
    PYPL: "siPaypal",
    V: "siVisa",
    MA: "siMastercard",
    KO: "siCocacola",
    PEP: "siPepsi",
    DIS: "siDisney",
    JPM: "siJpmorgan",
    AVGO: "siBroadcom",
    COST: "siCostco",
    WMT: "siWalmart",
  };

  return icons[map[symbol]];
}