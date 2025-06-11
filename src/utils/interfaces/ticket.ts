export interface ITicket {
    _id?: string
    bill_id?: string;
    movie_id?: string;
    seat_name?: string;
    room_name?: string;
    cinema_name?: string;
    show_time?: Date;
    price?: number;
}