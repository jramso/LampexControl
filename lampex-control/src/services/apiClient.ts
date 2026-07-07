import { PostgrestClient } from '@supabase/postgrest-js';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000');

export const apiClient = new PostgrestClient<any>(API_URL);

export function setAuthHeader(token: string | null) {
  if (token) {
    apiClient.headers.set('Authorization', `Bearer ${token}`);
  } else {
    apiClient.headers.delete('Authorization');
  }
}

// Inicialização automática do token a partir do localStorage
const storedToken = localStorage.getItem('lampex_jwt_token');
if (storedToken) {
  setAuthHeader(storedToken);
}
