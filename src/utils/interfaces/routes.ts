import React from "react";

export interface IRoutes{
    name:string,
    path: string,
    component: React.ComponentType,
    layout?:string,
    display:boolean
}