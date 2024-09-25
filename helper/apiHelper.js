import { API_URL } from '@env';
import axios from 'axios';

import { getToken } from '../stores/auth';

const config = {
    baseURL: 'https://38b8-2409-40c2-103c-eed3-6184-f97f-efcf-a6be.ngrok-free.app/',
    timeout: 10000, // env value is a string so we need to convert it to a number
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
