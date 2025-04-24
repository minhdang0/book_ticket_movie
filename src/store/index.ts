import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice';
import logger from "redux-logger";
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage';
import { productApi } from "../services/product";

const rootConfig = {
  key: 'root',
  storage,
  whitelist: ['auth']
}

const rootReducer = combineReducers({
  auth: authReducer,
  [productApi.reducerPath]: productApi.reducer
})
export const store = configureStore({
  reducer: persistReducer(rootConfig, rootReducer),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: true }).concat(logger, productApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;