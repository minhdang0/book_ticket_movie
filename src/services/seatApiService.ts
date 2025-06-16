import seatSessionService from './sessionService';
import socketService from './socketService';

interface SeatUpdateParams {
    showtimeId: string;
    seatIds: string[];
    sessionId: string;
}

class SeatApiService {
    private isLoading = false;

    // Select seats on server
    // Chỉ sửa phần selectSeats method trong seatApiService.ts

    async selectSeats(params: SeatUpdateParams): Promise<{ success: boolean; message?: string; occupiedSeatIds?: string[] }> {
        if (this.isLoading) {
            throw new Error('Another operation is in progress');
        }

        const { showtimeId, seatIds, sessionId } = params;

        if (!seatIds || seatIds.length === 0) {
            throw new Error('No seat IDs provided');
        }

        const validSeatIds = seatIds.filter(id => id && typeof id === 'string');
        if (validSeatIds.length === 0) {
            throw new Error('No valid seat IDs found');
        }

        this.isLoading = true;

        try {
            console.log('Selecting seats:', validSeatIds, 'for session:', sessionId);

            // Call API to select seats
            const response = await seatSessionService.selectSeats({
                showtimeId,
                seatIds: validSeatIds,
                sessionId
            });

            console.log('Raw API response:', response);

            // Kiểm tra response cơ bản
            if (!response || typeof response !== 'object') {
                throw new Error('Invalid response format from server');
            }

            // Axios response có format: { data: actualData, status: number, ... }
            const actualData = response.data || response;

            // Xử lý response data
            if (actualData && typeof actualData === 'object') {
                // Trường hợp 1: Response có success field
                if (actualData.success === true) {
                    console.log('Seats operation completed:', actualData);

                    // THAY ĐỔI: Trả về occupiedSeatIds để component có thể cập nhật UI
                    const result = {
                        success: true,
                        message: actualData.message || 'Operation completed',
                        occupiedSeatIds: actualData.data?.occupiedSeatIds || []
                    };

                    // Emit socket event if connected và có ghế được chọn thành công
                    if (socketService.connected && actualData.data?.selectedSeats?.length > 0) {
                        validSeatIds.forEach(seatId => {
                            socketService.selectSeat(seatId, seatId);
                        });
                    }

                    return result;
                }

                if (actualData.success === false) {
                    throw new Error(actualData.message || 'Failed to select seats');
                }

                // Trường hợp 2: Response không có success field nhưng có sessionId (thành công)
                if (actualData.sessionId || actualData.selectedSeats) {
                    console.log('Seats selected successfully (direct data):', actualData);

                    // Emit socket event if connected
                    if (socketService.connected) {
                        validSeatIds.forEach(seatId => {
                            socketService.selectSeat(seatId, seatId);
                        });
                    }

                    return { success: true, message: 'Seats selected successfully' };
                }
            }

            // Nếu không match pattern nào
            console.error('Unexpected response structure:', actualData);
            throw new Error(`Unexpected response format: ${JSON.stringify(actualData)}`);

        } catch (error) {
            console.error('Error selecting seats:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }
    // Unselect seats on server
    async unselectSeats(params: SeatUpdateParams): Promise<{ success: boolean; message?: string }> {
        if (this.isLoading) {
            throw new Error('Another operation is in progress');
        }

        const { showtimeId, seatIds, sessionId } = params;

        if (!seatIds || seatIds.length === 0) {
            throw new Error('No seat IDs provided');
        }

        const validSeatIds = seatIds.filter(id => id && typeof id === 'string');
        if (validSeatIds.length === 0) {
            throw new Error('No valid seat IDs found');
        }

        this.isLoading = true;

        try {
            console.log('Unselecting seats:', validSeatIds, 'for session:', sessionId);

            // Call API to unselect seats
            const response = await seatSessionService.unselectSeats({
                showtimeId,
                seatIds: validSeatIds,
                sessionId
            });

            console.log('Raw unselect API response:', response);

            // FIX: Xử lý response tương tự như selectSeats
            if (response && typeof response === 'object') {
                // Nếu có lỗi từ handleError
                if (response.success === false) {
                    throw new Error(response.message || 'Failed to unselect seats');
                }

                // Nếu response trực tiếp từ API thành công
                if (response.success === true) {
                    console.log('Seats unselected successfully:', response);

                    // Emit socket event if connected
                    if (socketService.connected) {
                        validSeatIds.forEach(seatId => {
                            socketService.unselectSeat(seatId, seatId);
                        });
                    }

                    return { success: true };
                }

                // Nếu không có field success nhưng có data
                if (response.data && !('success' in response)) {
                    console.log('Seats unselected successfully:', response);

                    // Emit socket event if connected
                    if (socketService.connected) {
                        validSeatIds.forEach(seatId => {
                            socketService.unselectSeat(seatId, seatId);
                        });
                    }

                    return { success: true };
                }
            }

            throw new Error('Invalid response format from server');

        } catch (error) {
            console.error('Error unselecting seats:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    // Get occupied seats for showtime
    async getOccupiedSeats(showtimeId: string, sessionId: string): Promise<Set<string>> {
        try {
            const response = await seatSessionService.getActiveSeatsForShowtime(showtimeId, sessionId);

            if (response?.success && response.data) {
                const occupiedSeatsData = Array.isArray(response.data.occupiedSeats)
                    ? response.data.occupiedSeats
                    : [];

                const occupiedSeatIds = new Set<string>(
                    occupiedSeatsData
                        .map((seat: any) => seat.seatId || seat._id || seat.id)
                        .filter((id: any) => id)
                );

                return occupiedSeatIds;
            }

            return new Set();
        } catch (error) {
            console.error('Error getting occupied seats:', error);
            return new Set();
        }
    }

    // Clear session
    async clearSession(sessionId: string, showtimeId: string): Promise<void> {
        try {
            await seatSessionService.clearSession(sessionId, showtimeId);
            console.log('Session cleared successfully');
        } catch (error) {
            console.error('Error clearing session:', error);
            throw error;
        }
    }

    // Extend session
    async extendSession(sessionId: string, showtimeId: string, minutes: number = 10): Promise<boolean> {
        try {
            const response = await seatSessionService.extendSession(sessionId, showtimeId, minutes);

            // FIX: Xử lý response cho extend session
            if (response && typeof response === 'object') {
                if (response.success === true) {
                    console.log('Session extended successfully');
                    return true;
                } else if (response.success === false) {
                    console.error('Failed to extend session:', response.message);
                    return false;
                } else if (response.data && !('success' in response)) {
                    // Nếu API trả về data mà không có success field
                    console.log('Session extended successfully');
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('Error extending session:', error);
            return false;
        }
    }

    // Validate session
    async validateSession(sessionId: string, showtimeId: string): Promise<any> {
        try {
            const response = await seatSessionService.validateSession(sessionId, showtimeId);
            return response;
        } catch (error) {
            console.error('Error validating session:', error);
            return null;
        }
    }

    get loading(): boolean {
        return this.isLoading;
    }
}

const seatApiService = new SeatApiService();
export default seatApiService;