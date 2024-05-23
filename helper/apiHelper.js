import axios from 'axios';
import { API_URL } from '@env';
import { getToken } from '../stores/auth';

const config = {
    baseURL: API_URL,
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
