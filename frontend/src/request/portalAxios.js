import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';

// A dedicated axios instance (not the shared `axios.defaults` the Admin
// `request.js` mutates) so a Student session can never overwrite or be
// overwritten by an Admin session's auth header within the same tab.
const portalAxios = axios.create({
  baseURL: API_BASE_URL + 'portal/',
  withCredentials: true,
});

portalAxios.interceptors.request.use((config) => {
  const portalAuth = storePersist.get('portal_auth');
  if (portalAuth?.current?.token) {
    config.headers.Authorization = `Bearer ${portalAuth.current.token}`;
  }
  return config;
});

export default portalAxios;
