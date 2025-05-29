import { createAsyncThunk } from "@reduxjs/toolkit";
import showtimeService from "../../services/showtimeService";



export const getShowtimeByCinema = createAsyncThunk(
    'cinema/getAllRooms',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await showtimeService.getShowtimeByCinema(id);
            return response;
        } catch (error: any) {
            rejectWithValue(error.message || 'Failed to fetch cinema')
        }
    }

)
