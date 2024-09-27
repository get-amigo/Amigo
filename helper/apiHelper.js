import { API_URL } from '@env';
import axios from 'axios';

import { getToken } from '../stores/auth';

const config = {
    baseURL: 'https://e28c-2409-40c2-116b-2591-9f0b-dc3d-37a5-b81b.ngrok-free.app/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
};
console.log('API_URL', API_URL);
const request = axios.create(config);
request.interceptors.request.use(
    async (reqConfig) => {
        const reqHeader = { ...reqConfig };
        let token;
        if (getToken) token = getToken();
        if (token) {
            reqHeader.headers = {
                ...reqConfig.headers,
                Authorization: `Bearer ${token}`,
            };
        }

        return reqHeader;
    },
    (error) => Promise.reject(error),
);
export default request;
