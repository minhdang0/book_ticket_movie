import * as  authService from "../../services/authService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async () => {
        const res = await authService.currentUser();
        return res;
    }
)