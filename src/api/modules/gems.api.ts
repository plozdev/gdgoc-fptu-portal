import { api, buildQueryString } from '../client';

export interface QueryLeaderboardParams {
  tenureId?: string;
  departmentCode?: string;
  limit?: number;
}

export interface QueryTransactionsParams {
  userId?: string;
  page?: number;
  limit?: number;
}

export const gemsApi = {
  getLeaderboard: (params?: QueryLeaderboardParams) =>
    api.get(`/api/gems/leaderboard${buildQueryString(params)}`),

  getTransactions: (params?: QueryTransactionsParams) =>
    api.get(`/api/gems/transactions${buildQueryString(params)}`),

  adjustGems: (dto: { userId: string; amount: number; reason: string }) =>
    api.post('/api/gems/adjust', dto),
};
