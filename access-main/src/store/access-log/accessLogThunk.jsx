import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../utils/axios';

export const fetchAccessLogs = createAsyncThunk(
  'accessLog/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const {data,status} = await axiosInstance.get('/logs');
      console.log('data: ', JSON.stringify(data.slice(0, 5)));
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch access logs'
      );
    }
  }
);