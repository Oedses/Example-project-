import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const defaultHeader = {
    'Content-type': 'application/json'
};

export const AuthHeader = () => ({
    ...defaultHeader,
    'Authorization': `Bearer ${localStorage.getItem('AuthToken')}`
});

export default axios.create({
  baseURL: REACT_APP_API_URL,
  headers: {
    'Content-type': 'application/json'
  }
});
