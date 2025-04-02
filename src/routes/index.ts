import config from '../config';
import Home from '../pages/Home';
import ShowTime from '../pages/ShowTime';
import Movie from '../pages/Movie';
import Theater from '../pages/Theater';
import PriceTicket from '../pages/PriceTicket';
import { IRoutes } from './../utils/interfaces/routes';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import NoFooterLayout from '../layouts/NoFooterLayout/NoFooterLayout';

const routes: IRoutes[] = [ 
    {   
        name:"Trang chủ",
        path: config.routes.home,
        component: Home,
        display:true
    },
    {
        name:"Lịch chiếu theo rạp",
        path: config.routes.showtime,
        component: ShowTime,
        display:true
    },
    {
        name:"Phim",
        path: config.routes.movie,
        component: Movie,
        display:true
    },
    {
        name:"Rạp",
        path: config.routes.theater,
        component: Theater,
        display:true
    },
    {
        name:"Giá vé",
        path: config.routes.priceTicket,
        component: PriceTicket,
        display:true
    },
    {
        name:"Đăng Nhập",
        path: config.routes.login,
        component: Login,
        layout: null,
        display:false
    },
    {
        name:"Đăng Ký",
        path: config.routes.register,
        component: Register,
        layout:null,
        display:false
    },
    {
        name:"User",
        path: config.routes.user,
        component: Profile,
        layout:NoFooterLayout,  
        display:false,
        protected:true
    }
]

export default routes;