// import * as  authService from "../../services/authService";
import { createAsyncThunk } from "@reduxjs/toolkit";
import roomService from "../../services/roomService";
import cinemaService from "../../services/cinemaService";


export const getAllRooms = createAsyncThunk(
    'cinema/getAllRooms',
    async (_, { rejectWithValue }) => {
        try {
            const response = await roomService.getAllRooms();
            return response;
        } catch (error: any) {
            rejectWithValue(error.message || 'Failed to fetch cinema')
        }
    }

)

export const getRoomById = createAsyncThunk(
    'cinema/getRoomById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await roomService.getRoom(id);
            return response;
        } catch (error: any) {
            rejectWithValue(error.message || 'Failed to fetch cinema')
        }
    }
)

export const getRoomByCinemaId = createAsyncThunk(
    'cinema/getRoomByCinemaId',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await cinemaService.getRoomByCinemaId(id);
            return response;
        } catch (error: any) {
            rejectWithValue(error.message || 'Failed to fetch cinema')
        }
    }
)