// services/seatService.ts
import * as httpRequest from '../utils/api/httpRequests';

// Get seats by room ID
const getSeatByRoomId = async (id: string) => {
    const response = await httpRequest.get(`/rooms/${id}/seats`);
    return response.data;
};



// Update multiple seats (general)
const updateManySeats = async (seatIds: string[], updateData: any) => {
    const response = await httpRequest.put('/seats/many', {
        seatIds,
        updateData
    });
    return response.data;
};

// Book/unbook multiple seats
const bookSeats = async (seatIds: string[], isBooked: boolean = true) => {
    const response = await httpRequest.put('/seats/book/many', {
        seatIds,
        isBooked
    });
    return response.data;
};

// Select/unselect multiple seats
const selectSeats = async (seatIds: string[], isSelecting: boolean = true) => {
    const response = await httpRequest.put('/seats/select/many', {
        seatIds,
        isSelecting
    });
    return response.data;
};

// Update seat status (both booking and selecting)
const updateSeatStatus = async (
    seatIds: string[],
    isBooked?: boolean,
    isSelecting?: boolean
) => {
    const response = await httpRequest.put('/seats/status/many', {
        seatIds,
        isBooked,
        isSelecting
    });
    return response.data;
};

// Specific use cases
const markSeatsAsSelecting = async (seatIds: string[]) => {
    return await selectSeats(seatIds, true);
};

const unmaskSeatsAsSelecting = async (seatIds: string[]) => {
    return await selectSeats(seatIds, false);
};

const confirmBooking = async (seatIds: string[]) => {
    return await updateSeatStatus(seatIds, true, false);
};

const cancelBooking = async (seatIds: string[]) => {
    return await updateSeatStatus(seatIds, false, false);
};

export default {
    getSeatByRoomId,
    updateManySeats,
    bookSeats,
    selectSeats,
    updateSeatStatus,
    markSeatsAsSelecting,
    unmaskSeatsAsSelecting,
    confirmBooking,
    cancelBooking
};

