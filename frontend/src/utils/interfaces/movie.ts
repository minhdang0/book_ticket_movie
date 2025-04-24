export interface IMovie {
    id: number;
    name: string;
    image: string;
    description?: string;
    duration: number;
    releaseDate?: Date;
    category: string[];
    director?: string;
    review?: string;
    ageAllowed?: number;
    trailer?: string;
    screenRoom?: string;
}