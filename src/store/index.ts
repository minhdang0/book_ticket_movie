import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice';
import cinemaReducer from '../features/cinema/cinemaSlice'
import movieReducer from '../features/movie/movieSlice'
import roomReducer from '../features/room/roomSlice'
import showtimeReducer from '../features/showtime/showtimeSlice';
import logger from "redux-logger";
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage';

const rootConfig = {
  key: 'root',
  storage,
  whitelist: ['auth']
}

const rootReducer = combineReducers({
  auth: authReducer,
  cinema: cinemaReducer,
  movie: movieReducer,
  room: roomReducer,
  showtime: showtimeReducer
})
export const store = configureStore({
  reducer: persistReducer(rootConfig, rootReducer),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: true }).concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;