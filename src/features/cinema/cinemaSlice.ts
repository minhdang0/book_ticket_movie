import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAllCinemas, getCinemaById } from './cinemaAsync'; // Import thunks
import { ICinema } from '../../utils/interfaces/cinema';



interface CinemaState {
    cinemas: ICinema[];
    selectedCinema: string | null;
    currentCinema: ICinema | {};
    loading: boolean;
    error: string | null;
}

const initialState: CinemaState = {
    cinemas: [],
    selectedCinema: null,
    currentCinema: {},
    loading: false,
    error: null,
};

const cinemaSlice = createSlice({
    name: 'cinema',
    initialState,
    reducers: {
        setSelectedCinema: (state, action: PayloadAction<string | null>) => {
            state.selectedCinema = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Handle getAllCinemas
        builder
            .addCase(getAllCinemas.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllCinemas.fulfilled, (state, action) => {
                state.loading = false;
                state.cinemas = action.payload;
            })
            .addCase(getAllCinemas.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Handle getCinemaById
            .addCase(getCinemaById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCinemaById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCinema = action.payload;
            })
            .addCase(getCinemaById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setSelectedCinema, clearError } = cinemaSlice.actions;
export default cinemaSlice.reducer;