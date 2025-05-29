import { createSlice } from '@reduxjs/toolkit';
import { getAllRooms, getRoomByCinemaId, getRoomById } from './roomAsync';
import { IRoom } from '../../utils/interfaces/room';

interface RoomState {
    rooms: IRoom[];
    currentRoom: IRoom | null;
    loading: boolean;
    error: string | null;
}

const initialState: RoomState = {
    rooms: [],
    currentRoom: null,
    loading: false,
    error: null,
};

const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Handle getAllRooms
        builder
            .addCase(getAllRooms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllRooms.fulfilled, (state, action) => {
                state.loading = false;
                state.rooms = action.payload;
            })
            .addCase(getAllRooms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Handle getRoomById
            .addCase(getRoomById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRoomById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentRoom = action.payload;
            })
            .addCase(getRoomById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(getRoomByCinemaId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRoomByCinemaId.fulfilled, (state, action) => {
                state.loading = false;
                state.currentRoom = action.payload;
            })
            .addCase(getRoomByCinemaId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = roomSlice.actions;

export default roomSlice.reducer;