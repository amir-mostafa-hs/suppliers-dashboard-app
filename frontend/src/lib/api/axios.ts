import { SECRET_VARIABLES } from "@/config/secret-variable";
import axios from "axios";

const api = axios.create({
  baseURL: SECRET_VARIABLES.api_url,
  withCredentials: true, // This is the key setting
});

export default api;
