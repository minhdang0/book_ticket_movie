export interface IBill {
    _id?: string;
    booking_id: string;
    showtime_id: string;
    print_time: Date;
    total: number;
    product_list: Array<{
        seat_number: string;
        seat_type: string;
        price: number;
    }>;
}