const config = {
    routes: {
        home: '/',
        showtime: '/showtime',
        movie: '/movie',
        theater: '/theater',
        priceTicket: '/price_ticket',
        login: '/login',
        register: '/register',
        user: `/p/:userId`,
        selectSeat: `/select-seat/:movieId`,
        movieDetail: '/movie/:id'
    }
}

export default config;