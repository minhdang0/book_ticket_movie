import { createSlice } from '@reduxjs/toolkit';
import { getCurrentUser } from './authAsync';


const authSlice = createSlice({
    name: 'auth',
    initialState: {
        currentUser: null,
        isLoading: true,
    },
    reducers: {
        setCurrentUser(state, action) {
            state.currentUser = action.payload;
        },
        setUserLoading(state, action) {
            state.isLoading = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCurrentUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.currentUser = action.payload;
                state.isLoading = false;
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.currentUser = null;
                state.isLoading = false;
            });
    }
});

export const { setCurrentUser, setUserLoading } = authSlice.actions;
export default authSlice.reducer;
