// services/reviewService.ts
import * as httpRequest from "../utils/api/httpRequests";
import { IReview } from "../utils/interfaces/review";

// Lấy tất cả reviews
const getAllReviews = async () => {
    const response = await httpRequest.get('/reviews');
    return response.data;
};

// Lấy review theo ID
const getReviewById = async (id: string) => {
    const response = await httpRequest.get(`/reviews/${id}`);
    return response.data;
};

// Lấy reviews theo movie ID với pagination
const getReviewsByMovieId = async (movieId: string, page: number = 1, limit: number = 10) => {
    const response = await httpRequest.get(`/reviews/movie/${movieId}?page=${page}&limit=${limit}`);
    return response;
};

// Lấy thống kê rating cho phim
const getMovieRatingStats = async (movieId: string) => {
    const response = await httpRequest.get(`/reviews/movie/${movieId}/stats`);
    return response.data;
};

// Lấy reviews theo customer ID
const getReviewsByCustomerId = async (customerId: string) => {
    const response = await httpRequest.get(`/reviews/customer/${customerId}`);
    return response.data;
};

// Tạo review mới
const createReview = async (data: IReview) => {
    const response = await httpRequest.post('/reviews', data);
    return response.data;
};

// Cập nhật review
const updateReview = async (id: string, data: Partial<IReview>) => {
    const response = await httpRequest.put(`/reviews/${id}`, data);
    return response.data;
};

// Xóa review
const removeReview = async (id: string) => {
    const response = await httpRequest.del(`/reviews/${id}`);
    return response.data;
};

export default {
    getAllReviews,
    getReviewById,
    getReviewsByMovieId,
    getMovieRatingStats,
    getReviewsByCustomerId,
    createReview,
    updateReview,
    removeReview
};