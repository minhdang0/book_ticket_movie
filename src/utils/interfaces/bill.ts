export interface IBill {
    _id?: string;
    booking_id: string;
    ticket_id: string;
    time: Date;
    total_price: number;
    product_list: Array<{
        seat_number: string;
        seat_type: string;
        price: number;
    }>;
}