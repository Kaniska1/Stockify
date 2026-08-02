import api from './api';

export const getTransactions = (
  token: string
) =>
  api('/transactions', {
    token,
  });

export const addTransaction = (
  token: string,
  transaction: {
    symbol: string;
    companyName: string;
    quantity: number;
    price: number;
    type: 'BUY' | 'SELL';
  }
) =>
  api('/transactions', {
    method: 'POST',
    token,
    body: JSON.stringify(transaction),
  });