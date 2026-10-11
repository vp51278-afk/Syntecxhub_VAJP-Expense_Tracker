
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://syntecxhub-vajp-expense-tracker-g8s.vercel.app"
).replace(/\/+$/, "");

export default API_BASE_URL;
