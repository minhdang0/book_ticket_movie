import * as httpRequest from "../utils/api/httpRequests";
import { IBooking } from "../utils/interfaces/booking";

const createBooking = async (data: IBooking) => {
    const response = await httpRequest.post('/bookings', data);
    return response.data;
}
const updateBookingStatus = async (id: string, data: IBooking) => {
    const response = await httpRequest.put(`/bookings/${id}`, data);
    return response.data;
}

const getBooking = async (id: string) => {
    const response = await httpRequest.get(`/booking/${id}`);
    return response.data;
}


export default { createBooking, updateBookingStatus, getBooking }