export interface IBooking {
    _id?: string,
    customer_id?: string;
    seat_numbers?: string[];
    seat_ids?: string[];
    ticket_quantity?: number;
    total_price?: number;
    booking_status?: string,
    voucher?: string;

}