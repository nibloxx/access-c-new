import { createSlice } from '@reduxjs/toolkit';
import { fetchAccessLogs } from './accessLogThunk';

const initialState = {
  logs: [],
  isLoading: false,
  error: null
};

const accessLogSlice = createSlice({
  name: 'accessLog',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccessLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccessLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload;
      })
      .addCase(fetchAccessLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = accessLogSlice.actions;
export default accessLogSlice.reducer;