// import * as  authService from "../../services/authService";
import { createAsyncThunk } from "@reduxjs/toolkit";
import seatService from "../../services/seatService";


export const getSeatByRoomById = createAsyncThunk(
    'cinema/getSeatByRoomById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await seatService.getSeatByRoomId(id);
            return response;
        } catch (error: any) {
            rejectWithValue(error.message || 'Failed to fetch cinema')
        }
    }
)

