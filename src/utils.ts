import axios from "axios";

const ax = axios.create({
  baseURL: import.meta.env.VITE_BACKEND,
  timeout: 25000, // Request timeout in milliseconds
});

export default ax;
