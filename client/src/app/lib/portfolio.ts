import api from './api';

export const getPortfolio = (
  token: string
) =>
  api('/portfolio', {
    token,
  });