// Force the Java backend URL if the environment variable is missing or points to the old service
const rawUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = (rawUrl && rawUrl.includes('kaqb'))
    ? rawUrl
    : 'https://secure-api-gateway-with-intelligent-rate-kaqb.onrender.com';

console.log('Final Backend URL being used:', API_BASE_URL);
export default API_BASE_URL;
