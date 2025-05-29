import { createSlice } from '@reduxjs/toolkit';
import { getShowtimeByCinema } from './showtimeAsync';
import { IShowtime } from '../../utils/interfaces/showtime';

interface RoomState {
    showtime: IShowtime[];
    loading: boolean,
    error: string | null
}

const initialState: RoomState = {
    showtime: [],
    loading: false,
    error: null,
};

const roomSlice = createSlice({
    name: 'showtime',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Handle getAllRooms
        builder
            .addCase(getShowtimeByCinema.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getShowtimeByCinema.fulfilled, (state, action) => {
                state.loading = false;
                state.showtime = action.payload;
            })
            .addCase(getShowtimeByCinema.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

    },
});

export const { clearError } = roomSlice.actions;

export default roomSlice.reducer;