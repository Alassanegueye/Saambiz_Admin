import api from './api';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.NOTIFICATION_GLOBALE;

export const envoyerNotificationGlobale = (data) => api.post(E.ENVOYER, data);
