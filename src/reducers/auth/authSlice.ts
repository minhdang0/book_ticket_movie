import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        currentUser: null,
        isLoading: true,
    },
    reducers: {
        setCurrentUser(state, action) {
            state.currentUser = action.payload
        },
        setUserLoading(state, action) {
            state.isLoading = action.payload
        },
    },
})

export const { setCurrentUser, setUserLoading } = authSlice.actions
export default authSlice.reducer