import { createSlice } from '@reduxjs/toolkit';
import { ISeat } from '../../utils/interfaces/seat';
import { getSeatByRoomById } from './seatAsync';


interface SeatState {
    seats: ISeat[];
    selectedSeat: ISeat[];
    loading: boolean;
    error: string | null;
}

const initialState: SeatState = {
    seats: [],
    selectedSeat: [],
    loading: false,
    error: null,
};

const roomSlice = createSlice({
    name: 'seat',
    initialState,
    reducers: {
        setSelectedSeats: (state, action) => {
            state.selectedSeat = action.payload
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Handle getAllRooms
        builder
            .addCase(getSeatByRoomById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSeatByRoomById.fulfilled, (state, action) => {
                state.loading = false;
                state.seats = action.payload;
            })
            .addCase(getSeatByRoomById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })


    },
});

export const { setSelectedSeats, clearError } = roomSlice.actions;

export default roomSlice.reducer;