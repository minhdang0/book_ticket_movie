interface Showtime {
    time: string;
    availableSeats: number;
}

interface ShowDate {
    date: string;
    showtime: Showtime[];
}

export interface ShowtimeDay {
    id: number;
    showDate: ShowDate;
    movieId: number;
    cinemaId: number;
    roomId: number;
}