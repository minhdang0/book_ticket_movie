// services/billService.ts
import * as httpRequest from "../utils/api/httpRequests";
import { IBill } from "../utils/interfaces/bill";
import bookingService from "./bookingService";

// Tạo hóa đơn mới
const createBill = async (data: IBill): Promise<IBill> => {
    const response = await httpRequest.post('/bills', data);
    return response.data;
};

// Lấy hóa đơn theo booking ID
const getBillByBookingId = async (bookingId: string): Promise<IBill> => {
    const response = await httpRequest.get(`/bills/booking/${bookingId}`);
    return response.data;
};

// Lấy hóa đơn theo ID
const getBillById = async (billId: string): Promise<IBill> => {
    const response = await httpRequest.get(`/bills/${billId}`);
    return response.data;
};

// Lấy booking theo ID
const getBookingById = async (bookingId: string) => {
    const result = await bookingService.getBooking(bookingId);
    return result
}

export default { createBill, getBillByBookingId, getBillById, getBookingById }