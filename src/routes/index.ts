import config from '../config';
import Home from '../pages/Home/Home';
import ShowTime from './../pages/ShowTime/ShowTime';
import Movie from './../pages/Movie/Movie';
import Theater from './../pages/Theater/Theater';
import PriceTicket from './../pages/PriceTicket/PriceTicket';
import { IRoutes } from './../utils/interfaces/routes';

const routes: IRoutes[] = [ 
    {   
        name:"Trang chủ",
        path: config.routes.home,
        component: Home
    },
    {
        name:"Lịch chiếu theo rạp",
        path: config.routes.showtime,
        component: ShowTime
    },
    {
        name:"Phim",
        path: config.routes.movie,
        component: Movie
    },
    {
        name:"Rạp",
        path: config.routes.theater,
        component: Theater
    },
    {
        name:"Giá vé",
        path: config.routes.priceTicket,
        component: PriceTicket
    },
]

export default routes;