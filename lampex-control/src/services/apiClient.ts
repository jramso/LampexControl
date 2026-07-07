import { PostgrestClient } from '@supabase/postgrest-js';

export const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || '/api';
  if (url.startsWith('/') && typeof window !== 'undefined') {
    return `${window.location.origin}${url}`;
  }
  return url;
};

export const apiClient = new PostgrestClient<any>(getApiUrl());

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
