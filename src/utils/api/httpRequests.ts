import axios from "axios";
import { AxiosResponse , AxiosRequestConfig} from "axios";
import {    IRequestProps } from "../interfaces/api";

const httpRequest = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL ,
    headers: 
    {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
    }
});

const send = async ({ method, url, data, config }:  IRequestProps): Promise<any>  => {
    const response: AxiosResponse   = await httpRequest.request   ({
        method,
        url,
        data,
        ...config
    });

    return response.data;
};

export const get = (url:string, config? :AxiosRequestConfig ) => {
    return send({ method: "get", url, config });
};

export const post = (url:string,data: any, config? :AxiosRequestConfig) => {
    return send({ method: "post", url, data, config });
};

export const put = (url:string,data: any, config? :AxiosRequestConfig) => {
    return send({ method: "put", url, data, config });
};

export const patch = (url:string,data: any, config? :AxiosRequestConfig) => {
    return send({ method: "patch", url, data, config });
};

export const del = (url:string, config? :AxiosRequestConfig) => {
    return send({ method: "delete", url, config });
};

export const setToken = (token: string) => {
    httpRequest.defaults.headers["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
};

export default {
    get,
    post,
    put,
    patch,
    del,
    setToken
};