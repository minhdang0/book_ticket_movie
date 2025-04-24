import { AxiosRequestConfig } from "axios"; 

export interface IRequestProps{  
    method: "get" | "post" | "put" | "patch" | "delete";
    url: string;
    data?: any;
    config?: AxiosRequestConfig;
}
