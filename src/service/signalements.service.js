import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

export const getSignalements = () => api.get(ENDPOINTS.SIGNALEMENTS.LIST);
