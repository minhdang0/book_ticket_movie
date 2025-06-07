export interface IReview {
    _id?: string;
    customer_id?: string;
    movie_id?: string;
    content?: string;
    rating?: number;
    createdAt?: Date;
    updatedAt?: Date;
    likes?: number;
    isLiked?: boolean;
    customer?: {
        _id: string;
        firstName: string;
        lastName: string;
        image?: string;
    };
}