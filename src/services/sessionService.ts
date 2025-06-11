import * as httpRequest from '../utils/api/httpRequests';
import { ISession } from '../utils/interfaces/sessions';


class SeatSessionService {
    // Base URL cho seat session API

    // Chọn ghế
    async selectSeats(data: ISession) {
        try {
            const response = await httpRequest.post(`/sessions/select`, {
                showtimeId: data.showtimeId,
                seatIds: data.seatIds,
                sessionId: data.sessionId
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Hủy chọn ghế
    async unselectSeats(data: ISession) {
        try {
            const response = await httpRequest.post(`/sessions/unselect`, {
                showtimeId: data.showtimeId,
                seatIds: data.seatIds,
                sessionId: data.sessionId
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Lấy ghế đang được chọn cho showtime
    async getActiveSeatsForShowtime(showtimeId: string, excludeSessionId: string) {
        try {
            const params = excludeSessionId ? { excludeSessionId } : {};
            const response = await httpRequest.get(`/sessions/showtime/${showtimeId}`, {
                params
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Kiểm tra session còn hiệu lực
    async validateSession(sessionId: string, showtimeId: string) {
        try {
            const response = await httpRequest.get(`/sessions/validate/${sessionId}/${showtimeId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Gia hạn session
    async extendSession(sessionId: string, showtimeId: string, extendMinutes = 10) {
        try {
            const response = await httpRequest.post(`/sessions/extend`, {
                sessionId,
                showtimeId,
                extendMinutes
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Xóa session
    async clearSession(sessionId: string, showtimeId: string) {
        try {
            const response = await httpRequest.post(`/sessions/clear`, {
                sessionId,
                showtimeId
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Cleanup expired sessions (admin)
    async cleanupExpiredSessions() {
        try {
            const response = await httpRequest.post(`/sessions/cleanup`, null);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Error handler
    handleError(error: any) {
        if (error.response) {
            // Server responded with error status
            return {
                success: false,
                message: error.response.data?.message || 'Có lỗi xảy ra',
                statusCode: error.response.status,
                data: error.response.data
            };
        } else if (error.request) {
            // Request was made but no response received
            return {
                success: false,
                message: 'Không thể kết nối đến server',
                statusCode: 0
            };
        } else {
            // Something else happened
            return {
                success: false,
                message: error.message || 'Lỗi không xác định',
                statusCode: 0
            };
        }
    }
}
const seatSessionService = new SeatSessionService();
export default seatSessionService;