import { ShowtimeDay } from "../interfaces/showtime";

export const showtimeData: ShowtimeDay[] = [
    // ==== MOVIE 1 ====
    {
        id: 1,
        showDate: {
            date: "27/04 - CN",
            showtime: [
                { time: "08:00", availableSeats: 110 },
                { time: "10:00", availableSeats: 105 },
                { time: "13:00", availableSeats: 95 },
            ]
        },
        movieId: 1,
        cinemaId: 1,
        roomId: 1,
    },
    {
        id: 2,
        showDate: {
            date: "28/04 - T2",
            showtime: [
                { time: "09:00", availableSeats: 100 },
                { time: "11:00", availableSeats: 98 },
                { time: "14:00", availableSeats: 104 },
            ],
        },
        movieId: 1,
        cinemaId: 1,
        roomId: 1,
    },
    {
        id: 3,
        showDate: {
            date: "29/04 - T3",
            showtime: [
                { time: "07:00", availableSeats: 99 },
                { time: "12:00", availableSeats: 109 },
                { time: "16:00", availableSeats: 100 },
            ],
        },
        movieId: 1,
        cinemaId: 1,
        roomId: 1,
    },

    // ==== MOVIE 2 ====
    {
        id: 4,
        showDate: {
            date: "27/04 - CN",
            showtime: [
                { time: "08:30", availableSeats: 102 },
                { time: "11:30", availableSeats: 106 },
                { time: "15:30", availableSeats: 101 },
            ],
        },
        movieId: 2,
        cinemaId: 1,
        roomId: 2,
    },
    {
        id: 5,
        showDate: {
            date: "28/04 - T2",
            showtime: [
                { time: "09:30", availableSeats: 111 },
                { time: "12:30", availableSeats: 95 },
                { time: "18:00", availableSeats: 103 },
            ],
        },
        movieId: 2,
        cinemaId: 1,
        roomId: 2,
    },
    {
        id: 6,
        showDate: {
            date: "29/04 - T3",
            showtime: [
                { time: "10:00", availableSeats: 97 },
                { time: "14:00", availableSeats: 102 },
                { time: "17:00", availableSeats: 96 },
            ],
        },
        movieId: 2,
        cinemaId: 1,
        roomId: 2,
    },

    // ==== MOVIE 3 ====
    {
        id: 7,
        showDate: {
            date: "27/04 - CN",
            showtime: [
                { time: "07:00", availableSeats: 114 },
                { time: "14:00", availableSeats: 99 },
                { time: "20:30", availableSeats: 104 },
            ],
        },
        movieId: 3,
        cinemaId: 1,
        roomId: 3,
    },
    {
        id: 8,
        showDate: {
            date: "28/04 - T2",
            showtime: [
                { time: "10:30", availableSeats: 110 },
                { time: "13:30", availableSeats: 105 },
                { time: "19:30", availableSeats: 98 },
            ],
        },
        movieId: 3,
        cinemaId: 1,
        roomId: 3,
    },
    {
        id: 9,
        showDate: {
            date: "29/04 - T3",
            showtime: [
                { time: "09:00", availableSeats: 108 },
                { time: "11:30", availableSeats: 100 },
                { time: "20:00", availableSeats: 97 },
            ],
        },
        movieId: 3,
        cinemaId: 1,
        roomId: 3,
    },

    // ==== MOVIE 4 ====
    {
        id: 10,
        showDate: {
            date: "27/04 - CN",
            showtime: [
                { time: "07:30", availableSeats: 99 },
                { time: "13:15", availableSeats: 95 },
                { time: "18:45", availableSeats: 113 },
            ],
        },
        movieId: 4,
        cinemaId: 1,
        roomId: 4,
    },
    {
        id: 11,
        showDate: {
            date: "28/04 - T2",
            showtime: [
                { time: "08:45", availableSeats: 111 },
                { time: "15:00", availableSeats: 109 },
                { time: "21:00", availableSeats: 98 },
            ],
        },
        movieId: 4,
        cinemaId: 1,
        roomId: 4,
    },
    {
        id: 12,
        showDate: {
            date: "29/04 - T3",
            showtime: [
                { time: "10:15", availableSeats: 104 },
                { time: "16:30", availableSeats: 99 },
                { time: "22:15", availableSeats: 108 },
            ],
        },
        movieId: 4,
        cinemaId: 1,
        roomId: 4,
    },

    // ==== MOVIE 5 ====
    {
        id: 13,
        showDate: {
            date: "27/04 - CN",
            showtime: [
                { time: "09:00", availableSeats: 98 },
                { time: "14:30", availableSeats: 101 },
                { time: "19:00", availableSeats: 104 },
            ],
        },
        movieId: 5,
        cinemaId: 1,
        roomId: 5,
    },
    {
        id: 14,
        showDate: {
            date: "28/04 - T2",
            showtime: [
                { time: "11:15", availableSeats: 100 },
                { time: "16:15", availableSeats: 95 },
                { time: "20:15", availableSeats: 102 },
            ],
        },
        movieId: 5,
        cinemaId: 1,
        roomId: 5,
    },
    {
        id: 15,
        showDate: {
            date: "29/04 - T3",
            showtime: [
                { time: "13:00", availableSeats: 106 },
                { time: "18:00", availableSeats: 101 },
                { time: "23:00", availableSeats: 107 },
            ],
        },
        movieId: 5,
        cinemaId: 1,
        roomId: 5,
    },

    {
        id: 18,
        showDate: {
            date: "29/04 - T3",
            showtime: [
                { time: "07:00", availableSeats: 99 },
                { time: "12:00", availableSeats: 109 },
                { time: "16:00", availableSeats: 100 },
            ],
        },
        movieId: 1,
        cinemaId: 2,
        roomId: 1,
    },

    // ==== MOVIE 2 ====
    {
        id: 19,
        showDate: {
            date: "27/04 - CN",
            showtime: [
                { time: "08:30", availableSeats: 102 },
                { time: "11:30", availableSeats: 106 },
                { time: "15:30", availableSeats: 101 },
            ],
        },
        movieId: 2,
        cinemaId: 2,
        roomId: 2,
    },
    {
        id: 20,
        showDate: {
            date: "28/04 - T2",
            showtime: [
                { time: "09:30", availableSeats: 111 },
                { time: "12:30", availableSeats: 95 },
                { time: "18:00", availableSeats: 103 },
            ],
        },
        movieId: 2,
        cinemaId: 2,
        roomId: 2,
    },
    {
        id: 21,
        showDate: {
            date: "29/04 - T3",
            showtime: [
                { time: "10:00", availableSeats: 97 },
                { time: "14:00", availableSeats: 102 },
                { time: "17:00", availableSeats: 96 },
            ],
        },
        movieId: 2,
        cinemaId: 2,
        roomId: 2,
    },

    // ==== MOVIE 3 ====
    {
        id: 22,
        showDate: {
            date: "27/04 - CN",
            showtime: [
                { time: "07:00", availableSeats: 114 },
                { time: "14:00", availableSeats: 99 },
                { time: "20:30", availableSeats: 104 },
            ],
        },
        movieId: 3,
        cinemaId: 2,
        roomId: 3,
    },
    {
        id: 23,
        showDate: {
            date: "28/04 - T2",
            showtime: [
                { time: "10:30", availableSeats: 110 },
                { time: "13:30", availableSeats: 105 },
                { time: "19:30", availableSeats: 98 },
            ],
        },
        movieId: 3,
        cinemaId: 2,
        roomId: 3,
    },
    {
        id: 24,
        showDate: {
            date: "29/04 - T3",
            showtime: [
                { time: "09:00", availableSeats: 108 },
                { time: "11:30", availableSeats: 100 },
                { time: "20:00", availableSeats: 97 },
            ],
        },
        movieId: 3,
        cinemaId: 2,
        roomId: 3,
    },

    // ==== MOVIE 4 ====
    {
        id: 25,
        showDate: {
            date: "27/04 - CN",
            showtime: [
                { time: "07:30", availableSeats: 99 },
                { time: "13:15", availableSeats: 95 },
                { time: "18:45", availableSeats: 113 },
            ],
        },
        movieId: 4,
        cinemaId: 2,
        roomId: 4,
    },
    {
        id: 26,
        showDate: {
            date: "28/04 - T2",
            showtime: [
                { time: "08:45", availableSeats: 111 },
                { time: "15:00", availableSeats: 109 },
                { time: "21:00", availableSeats: 98 },
            ],
        },
        movieId: 4,
        cinemaId: 2,
        roomId: 4,
    },
    {
        id: 27,
        showDate: {
            date: "29/04 - T3",
            showtime: [
                { time: "10:15", availableSeats: 104 },
                { time: "16:30", availableSeats: 99 },
                { time: "22:15", availableSeats: 108 },
            ],
        },
        movieId: 4,
        cinemaId: 2,
        roomId: 4,
    },

];
