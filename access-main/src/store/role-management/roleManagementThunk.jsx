import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";

// Async Thunks
export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const { status, data } = await axiosInstance.get(`/roles`);
      if (status == 200) {
        return data;
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch roles"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch roles"
      );
    }
  }
);

export const createRole = createAsyncThunk(
  "roles/createRole",
  async ({ formData, onSuccess, onError }, { rejectWithValue }) => {
    try {
      const { status, data } = await axiosInstance.post(`/roles`, formData);

      if (status == 201) {
        toast.success("Role Created Successfully...!");
        onSuccess();
        return data.role;
      }
    
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create role"
      );
    }
  }
);

export const updateRole = createAsyncThunk(
  "roles/updateRole",
  async ({ id, formData, onSuccess }, { rejectWithValue }) => {
    try {
      const { status, data } = await axiosInstance.put(`/roles/${id}`, formData);

      if (status == 200) {
        toast.success("Role Updated Successfully...!");
        onSuccess();
        return data.role;
      }
      toast.error("Failed to update role...!");
      return rejectWithValue(
        error.response?.data?.message || "Failed to update role"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update role"
      );
    }
  }
);

export const deleteRole = createAsyncThunk(
  "roles/deleteRole",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/roles/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete role"
      );
    }
  }
);
