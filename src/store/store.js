import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import boardsReducer from './slices/boardSlice.js';

export const store = configureStore({
  reducer: { auth: authReducer, boards: boardsReducer },
});
