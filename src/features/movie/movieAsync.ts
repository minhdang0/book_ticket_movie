// import * as  authService from "../../services/authService";
import { createAsyncThunk } from "@reduxjs/toolkit";
import cinemaService from "../../services/cinemaService";
import movieService from "../../services/movieService";


export const getAllMovies = createAsyncThunk(
    'cinema/getAllMovies',
    async (_, { rejectWithValue }) => {
        try {
            const response = await movieService.getAllMovies();
            return response;
        } catch (error: any) {
            rejectWithValue(error.message || 'Failed to fetch cinema')
        }
    }

)

export const getMovieById = createAsyncThunk(
    'cinema/getCinemaById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await movieService.getMovie(id);
            return response;
        } catch (error: any) {
            rejectWithValue(error.message || 'Failed to fetch cinema')
        }
    }
)

export const getMovieByCinema = createAsyncThunk(
    'cinema/getMoviesByCinema',
    async (cinema_id: string, { rejectWithValue }) => {
        try {
            const response = await cinemaService.getMovieByCinema(cinema_id);
            return response;
        } catch (error: any) {
            rejectWithValue(error.message || 'Failed to fetch cinema')
        }
    }
);