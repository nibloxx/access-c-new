import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../utils/axios';


export const loginUser = createAsyncThunk(
	'user/login',
	async ({ payload, onSuccess, onError }, thunkAPI) => {
		try {
			const { data, status } = await axiosInstance.post(
				'/api/v1/user/',
				payload
			);
			if (status == 200 && data.details.UserID) {
				onSuccess();
				return data.details;
			} else if (status == 204) {
				toast.error('Wrong Email Or Password');
				return thunkAPI.rejectWithValue('');
			} else {
				// toast.error(data.details);
				onError(data.details);
				return thunkAPI.rejectWithValue(data.details);
			}
		} catch (error) {
			onError("something went wrong");
			return thunkAPI.rejectWithValue(error);
		}
	}
);
export const registerUser = createAsyncThunk(
	'user/registerUser',
	async ({ payload, onSuccess, onError }, thunkAPI) => {
		try {
			const { data, status } = await axiosInstance.post(
				'/Auth/SignUp/',
				payload
			);
			if (status == 200) {
				toast.success('User Registered Successfully...!');
				onSuccess();
				return data.details;
			}
			//  else {
			// 	onError(response.data.detail);
			// 	toast.error(response.data.details);
			// 	return thunkAPI.rejectWithValue(data);
			// }
		} catch (error) {
			toast.error(error.data.details);
			onError(error);
			return thunkAPI.rejectWithValue(error);
		}
	}
);
export const getUserProfile= createAsyncThunk(
	'/Auth/SignUp/profile',
	async ({ onSuccess, onError }) => {
		try {
			const {status,data} = await axiosInstance.get(
				`/Auth/SignUp/`
			);
			if(status==200){
				onSuccess(data)
				return data.details;
			}
			return rejectWithValue(data.details); 
		} catch (error) {
			console.error(error.message)
			onError()
			return rejectWithValue(error.message); 
		}
	}
);
export const updateProfile= createAsyncThunk(
	'/Auth/updateProfile',
	async ({userID,payload, onSuccess, onError }) => {
	
		try {
			const {status,data} = await axiosInstance.put(
				`/Auth/SignUp/${userID}/`,payload
			);
			if(status==200){
				onSuccess(data.details)
				return data.details;
			}
			onError(data.details|| "something went wrong")

			return rejectWithValue(data.details);
		} catch (error) {
			
			onError(error.data.details|| "something went wrong")
			return rejectWithValue(error.message); // Handle the error state in Redux
		}
	}
);
export const getSubscribedPackaged = createAsyncThunk(
	'/Plan/Plan-APIs',
	async ({userId }, thunkAPI) => {
		try {
			const { data, status } = await axiosInstance.get(
                `/Plan/Plan-APIs/${userId}/`
			);
			if (status == 200 ) {
				
				return data.details;
			} 
            return thunkAPI.rejectWithValue(data.details);
		} catch (error) {
			
			return thunkAPI.rejectWithValue(error);
		}
	}
);
export const sendVerifyCode = createAsyncThunk(
	'/SendOTP/',
	async ({payload,onSuccess,onError }, thunkAPI) => {
		try {
			const { data, status } = await axiosInstance.post(
                `/SendOTP/`,payload
			);
			if (status == 200 ) {
				onSuccess(data.details)
				return data.details;
			} 
			onError(data.details)
            return thunkAPI.rejectWithValue(data.details);
		} catch (error) {
			onError(error.data.details|| "something went wrong")
			return thunkAPI.rejectWithValue(error);
		}
	}
);
export const verifyOTP = createAsyncThunk(
	'/VerifyOTP/',
	async ({payload,onSuccess,onError }, thunkAPI) => {
		try {
			const { data, status } = await axiosInstance.post(
                `/VerifyOTP/`,payload
			);
			if (status == 200 ) {
				onSuccess(data.details)
				return data.details;
			} 
			onError(data.details)
            return thunkAPI.rejectWithValue(data.details);
		} catch (error) {
			onError(error.data.details|| "something went wrong")
			return thunkAPI.rejectWithValue(error);
		}
	}
);
export const deleteAccount = createAsyncThunk(
	'/Auth/SignUp/deleteAccount',
	async ({UserID,onSuccess,onError }, thunkAPI) => {
		try {
			const { data, status } = await axiosInstance.delete(
                `/Auth/SignUp/${UserID}/`
			);
			if (status == 200 ) {
				onSuccess(data.details)
				return data.details;
			} 
			onError(data.details)
            return thunkAPI.rejectWithValue(data.details);
		} catch (error) {
			onError(error.data.details|| "something went wrong")
			return thunkAPI.rejectWithValue(error);
		}
	}
);
export const updatePassword = createAsyncThunk(
	'/Change-Password/',
	async ({payload,onSuccess,onError }, thunkAPI) => {
		try {
			const { data, status } = await axiosInstance.post(
                `/Change-Password/`,payload
			);
			if (status == 200 ) {
				onSuccess(data.details)
				return data.details;
			} 
			onError(data.details)
            return thunkAPI.rejectWithValue(data.details);
		} catch (error) {
			onError(error.data.details|| "something went wrong")
			return thunkAPI.rejectWithValue(error);
		}
	}
);