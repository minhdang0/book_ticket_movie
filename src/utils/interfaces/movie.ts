export interface IMovie{
    name:string;
    image:string;
    description?:string;
    duration:number;
    date?: Date;
    category:string[];
}