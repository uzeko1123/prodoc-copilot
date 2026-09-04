import { authTokenRefreshCreate } from '@/api/gen/endpoints/auth/auth';
import Axios, { type AxiosRequestConfig, type AxiosError } from 'axios';

export const AXIOS_INSTANCE = Axios.create({
  baseURL: '',
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// Track whether a refresh is already in progress to avoid parallel refresh calls
let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(null);
    }
  });
  failedQueue = [];
};

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/token/refresh/')
    ) {
      if (isRefreshing) {
        // Queue the request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            originalRequest._retry = true;
            return AXIOS_INSTANCE(originalRequest);
          })
          .catch((error) => Promise.reject(error));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await authTokenRefreshCreate({ refresh: '' });

        processQueue(null);
        return AXIOS_INSTANCE(originalRequest);
      } catch {
        processQueue(error);
        // Redirect to login or emit an event
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Add a second `options` argument to pass extra options to each query
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
  }).then(({ data }) => data);

  return promise;
};

// Override the return error type for react-query and swr
export type ErrorType<Error> = AxiosError<Error>;

// Standard body type
export type BodyType<BodyData> = BodyData;

// Or wrap the body type if processing data before sending
// export type BodyType<BodyData> = CamelCase<BodyData>;
