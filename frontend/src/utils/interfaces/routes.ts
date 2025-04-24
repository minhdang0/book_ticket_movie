import React from "react";

export interface IRoutes{
    name:string,
    path: string,
    component: React.ComponentType,
    layout?:React.ComponentType | null,
    display:boolean,
    protected?: boolean
}