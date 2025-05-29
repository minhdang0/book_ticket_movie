// import * as  authService from "../../services/authService";
import { createAsyncThunk } from "@reduxjs/toolkit";
import cinemaService from "../../services/cinemaService";


export const getAllCinemas = createAsyncThunk(
    'cinema/getAllCinema',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cinemaService.getAllCinemas();
            return response;
        } catch (error: any) {
            rejectWithValue(error.message || 'Failed to fetch cinema')
        }
    }

)

export const getCinemaById = createAsyncThunk(
    'cinema/getCinemaById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await cinemaService.getCinema(id);
            return response;
        } catch (error: any) {
            rejectWithValue(error.message || 'Failed to fetch cinema')
        }
    }
)

export const getCurrentCinema = createAsyncThunk(
    'cinema/getCurrentCinema',
    async () => {
        return {
            selectedCinema: 1
        };
    }
);