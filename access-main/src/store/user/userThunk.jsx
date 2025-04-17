import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../utils/axios";

export const loginUser = createAsyncThunk(
  "user/login",
  async ({ payload, onSuccess, onError }, thunkAPI) => {
    try {
      const { data, status } = await axiosInstance.post(
		  "/api/auth/login",
		  payload
		);
      if (status == 200) {
        onSuccess();
        return data;
      } else if (status == 204) {
        toast.error("Wrong Email Or Password");
        return thunkAPI.rejectWithValue("");
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

export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (_, thunkAPI) => {
    try {
      const { data, status } = await axiosInstance.get("/api/users");
      if (status == 200) {
        return data;
      }
      return thunkAPI.rejectWithValue(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async ({ payload, onSuccess, onError }, thunkAPI) => {
    try {
      const { data, status } = await axiosInstance.post("/api/users", payload);
      if (status == 201) {
        onSuccess();
        toast.success("User Created Successfully...!");
        return data;
      }
      onError();
      return thunkAPI.rejectWithValue(data.details);
    } catch (error) {
      onError();
      toast.error(error.data.details);
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const updateUser = createAsyncThunk(
	  "user/updateUser",
  async ({ id, payload, onSuccess, onError }, thunkAPI) => {

	try {
	  const { data, status } = await axiosInstance.put(
		`/api/users/${id}`,
		payload
	  );
	  if (status == 200) {
		onSuccess();
		toast.success("User Updated Successfully...!");
		return data;
	  }
	  onError();
	  return thunkAPI.rejectWithValue(data.details);
	} catch (error) {
	  onError();
	  toast.error(error.data.details);
	  return thunkAPI.rejectWithValue(error);
	}
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async ({ userId, onSuccess, onError }, thunkAPI) => {
    try {
      const { data, status } = await axiosInstance.delete(
        `/api/users/${userId}`
      );
   
      if (status == 200) {
        onSuccess();
        toast.success("User Deleted Successfully...!");
        return {userId};
      }
      onError();
      return thunkAPI.rejectWithValue(data.details);
    } catch (error) {
      onError();
      toast.error(error.data.details);
      return thunkAPI.rejectWithValue(error);
    }
  }
);