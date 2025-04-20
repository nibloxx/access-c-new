import axios from "axios";
export const baseDomain = "http://localhost:5000/api";

export const axiosInstance = axios.create({
  baseURL: baseDomain,
});
const ResponseInterceptor = (response) => {
  return response;
};
const RequestInterceptor = (config) => {
  const token = localStorage.getItem("token") || null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

axiosInstance.interceptors.request.use(RequestInterceptor);
axiosInstance.interceptors.response.use(ResponseInterceptor, (error) => {
  const expectedErrors =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 509;
  if (!expectedErrors) {
    return Promise.reject(error.response);
  } else {
    return Promise.reject(error.response);
  }
});
