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

export interface IBillMore {
    _id: string;
    booking_id: {
        _id: string;
        customer_id: {
            _id: string;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
        };
        seat_numbers: string[];
        ticket_quantity: number;
        total_price: number;
        booking_status: string;
        voucher: string;
        booking_time: string;
    };
    showtime_id: {
        _id: string;
        movie_id: string;
        room_id: string;
        date: string;
        time: string;
        availableSeats: number;
    };
    print_time: string;
    total: number;
    product_list: Array<{
        seat_number: string;
        seat_type: string;
        price: number;
        type: string;
    }>;
    tickets: Array<{
        _id: string;
        movie_id: {
            _id: string;
            name: string;
            image: string;
            description: string;
            director: string;
            duration: number;
            language: string;
            ageAllowed: number;
            releaseDate: string;
        };
        seat_name: string;
        room_name: string;
        cinema_name: string;
        price: number;
    }>;
    foods: any[];
    createdAt: string;
    updatedAt: string;
}

export interface IBillResponse {
    lists: IBillMore[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalBills: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        nextPage: number | null;
        prevPage: number | null;
    };
}