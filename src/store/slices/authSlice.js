import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api.js';

export const login = createAsyncThunk('auth/login', async (payload) => {
  const res = await API.post('/auth/login', payload);
  return res.data;
});

export const register = createAsyncThunk('auth/register', async (payload) => {
  const res = await API.post('/auth/register', payload);
  return res.data;
});

const slice = createSlice({
  name: 'auth',
  initialState: { token: localStorage.getItem('token') || null, user: null, status: 'idle' },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
    },
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
    });
  }
});

export const { logout, setCredentials } = slice.actions;
export default slice.reducer;
