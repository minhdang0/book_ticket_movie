import * as httpRequest from "../utils/api/httpRequests";
import { IBill } from "../utils/interfaces/bill";
import bookingService from "./bookingService";

// Tạo hóa đơn mới
const createBill = async (data: IBill): Promise<IBill> => {
    const response = await httpRequest.post('/bills', data);
    return response.data;
};

// Tạo ticket cho mỗi ghế đã đặt
const createTickets = async (billId: string, ticketData: any[]): Promise<any> => {
    const response = await httpRequest.post('/tickets/bulk', {
        bill_id: billId,
        tickets: ticketData
    });
    return response.data;
};

// Tạo food items cho bill
const createFoods = async (billId: string, foodData: any[]): Promise<any> => {
    const response = await httpRequest.post('/foods/bulk', {
        bill_id: billId,
        foods: foodData
    });
    return response.data;
};

// Lấy hóa đơn theo booking ID
const getBillByBookingId = async (bookingId: string): Promise<IBill> => {
    const response = await httpRequest.get(`/bills/booking/${bookingId}`);
    return response.data;
};

// Lấy hóa đơn theo ID với đầy đủ thông tin
const getBillById = async (billId: string): Promise<IBill> => {
    const response = await httpRequest.get(`/bills/${billId}`);
    return response.data;
};

// Lấy tickets theo bill ID
const getTicketsByBillId = async (billId: string): Promise<any[]> => {
    const response = await httpRequest.get(`/tickets/bill/${billId}`);
    return response.data;
};

// Lấy foods theo bill ID
const getFoodsByBillId = async (billId: string): Promise<any[]> => {
    const response = await httpRequest.get(`/foods/bill/${billId}`);
    return response.data;
};

// Lấy booking theo ID
const getBookingById = async (bookingId: string) => {
    const result = await bookingService.getBooking(bookingId);
    return result;
};

// Lấy bill đầy đủ thông tin (bill + tickets + foods)
const getFullBillData = async (billId: string): Promise<{
    bill: IBill;
    tickets: any[];
    foods: any[];
}> => {
    const [bill, tickets, foods] = await Promise.all([
        getBillById(billId),
        getTicketsByBillId(billId),
        getFoodsByBillId(billId)
    ]);

    return { bill, tickets, foods };
};

const getMoiveStats = async () => {
    const response = await httpRequest.get('/bills/movie-stats');
    return response.data;
}
export default {
    createBill,
    createTickets,
    createFoods,
    getBillByBookingId,
    getBillById,
    getTicketsByBillId,
    getFoodsByBillId,
    getBookingById,
    getFullBillData,
    getMoiveStats
};