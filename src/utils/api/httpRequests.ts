import axios from "axios";
import { AxiosResponse, AxiosRequestConfig } from "axios";
import { IRequestProps } from "../interfaces/api";

const httpRequest = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
});

let isRefreshing = false;
const tokenListeners = <any>[];

function tokenSubscribe(listener: Function) {
    tokenListeners.push(listener);
}

function clearListeners() {
    tokenListeners.splice(0, tokenListeners.length);
}
function onRefreshed() {
    tokenListeners.forEach((listener: Function) => listener());
}

httpRequest.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config
})

httpRequest.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalConfig = error.config;
        const refreshToken = localStorage.getItem('refresh_token');
        const shouldRenewToken = error.response?.status === 401 && refreshToken;

        if (shouldRenewToken) {
            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/refresh-token`, {
                        refresh_token: refreshToken
                    })

                    const data = res.data.data;

                    localStorage.setItem("token", data.access_token);
                    localStorage.setItem("refresh_token", data.refresh_token);

                    onRefreshed();
                    isRefreshing = false;

                    return httpRequest(originalConfig);
                } catch (refreshError) {
                    isRefreshing = false;

                    clearListeners();

                    localStorage.removeItem("token");
                    localStorage.removeItem("refresh_token");


                    return Promise.reject(refreshError);
                }
            } else {
                return new Promise((resolve) => {
                    tokenSubscribe(() => {
                        resolve(httpRequest(originalConfig));
                    })
                })
            }
        }

        return Promise.reject(error);
    }
)
const send = async ({ method, url, data, config }: IRequestProps): Promise<any> => {
    const isPutOrPatch = ["put", "patch"].includes(method.toLowerCase());
    const effectiveMethod = isPutOrPatch ? "post" : method;
    const effectivePath = isPutOrPatch
        ? `${url}${url.includes("?") ? "&" : "?"}_method=${method}`
        : url;

    const response: AxiosResponse = await httpRequest.request({
        method: effectiveMethod,
        url: effectivePath,
        data,
        ...config
    });

    return response.data;
};

export const get = (url: string, config?: AxiosRequestConfig) => {
    return send({ method: "get", url, config });
};

export const post = (url: string, data: any, config?: AxiosRequestConfig) => {
    return send({ method: "post", url, data, config });
};

export const put = (url: string, data: any, config?: AxiosRequestConfig) => {
    return send({ method: "put", url, data, config });
};

export const patch = (url: string, data: any, config?: AxiosRequestConfig) => {
    return send({ method: "patch", url, data, config });
};

export const del = (url: string, config?: AxiosRequestConfig) => {
    return send({ method: "delete", url, config });
};

// export const setToken = (token: string) => {
//     httpRequest.defaults.headers["Authorization"] = `Bearer ${token}`;
//     localStorage.setItem("token", token);
// };

export default {
    get,
    post,
    put,
    patch,
    del
};