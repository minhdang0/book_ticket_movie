import { createSlice } from '@reduxjs/toolkit';
import { getShowtimeByCinema } from './showtimeAsync';
import { IShowtime } from '../../utils/interfaces/showtime';
import { LocalSeatSession } from '../../utils/interfaces/sessionLocal';

interface ShowtimeState {
    showtime: IShowtime[];
    currentShowtime: IShowtime | null;
    localSeatSessions: LocalSeatSession[];
    loading: boolean,
    error: string | null
}

const initialState: ShowtimeState = {
    showtime: [],
    currentShowtime: null,
    localSeatSessions: [],
    loading: false,
    error: null,
};

const showtimeSlice = createSlice({
    name: 'showtime',
    initialState,
    reducers: {
        setCurrentShowtime: (state, action) => {
            state.currentShowtime = action.payload;
        },
        addLocalSeatSession: (state, action) => {
            const session: LocalSeatSession = action.payload;
            // Xóa session cũ của cùng ghế + showtime (nếu có)
            state.localSeatSessions = state.localSeatSessions.filter(
                s => !(s.seatId === session.seatId && s.showtimeId === session.showtimeId)
            );
            state.localSeatSessions.push(session);
        },
        removeLocalSeatSession: (state, action) => {
            const { seatId, showtimeId } = action.payload;
            state.localSeatSessions = state.localSeatSessions.filter(
                s => !(s.seatId === seatId && s.showtimeId === showtimeId)
            );
        },
        cleanExpiredSessions: (state) => {
            const now = Date.now();
            state.localSeatSessions = state.localSeatSessions.filter(
                s => s.expiresAt > now
            );
        },
        clearLocalSessions: (state, action) => {
            const { showtimeId, sessionId } = action.payload;
            state.localSeatSessions = state.localSeatSessions.filter(
                s => !(s.showtimeId === showtimeId && s.sessionId === sessionId)
            );
        },
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

export const {
    setCurrentShowtime,
    addLocalSeatSession,
    removeLocalSeatSession,
    clearLocalSessions,
    cleanExpiredSessions,
    clearError
} = showtimeSlice.actions;

export default showtimeSlice.reducer;