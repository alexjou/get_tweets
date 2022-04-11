import axios from 'axios';
import secretTwitter from '../configs/SecretApiTwitter';

const twApi = axios.create({
  baseURL: 'https://api.twitter.com/2/tweets/search/',
});

twApi.defaults.headers.Authorization = `Bearer ${secretTwitter.bearer_token}`;

export default twApi;
