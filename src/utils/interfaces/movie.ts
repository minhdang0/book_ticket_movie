export interface IMovie {
    _id: string;
    name: string;
    image: string;
    description?: string;
    duration: number;
    releaseDate?: Date;
    categories: string[];
    director?: string;
    review?: string;
    ageAllowed?: number;
    trailer?: string;
    screenRoom?: string;
}