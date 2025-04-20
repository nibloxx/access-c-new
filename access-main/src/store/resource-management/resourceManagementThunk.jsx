import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../utils/axios";

// Fetch all resources
export const fetchResources = createAsyncThunk(
  "resources/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/resources");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data);
    }
  }
);

// Create new resource
export const createResource = createAsyncThunk(
  "resources/create",
  async (resourceData, { rejectWithValue }) => {
    try {
      const payload = {
        name: resourceData.name,
        type: resourceData.type,
        description: resourceData.description,
        accessLevel: resourceData.accessLevel,
        contextRules: resourceData.contextRules || []
      };

      const response = await axiosInstance.post("/resources", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create resource'
      );
    }
  }
);

// Update existing resource
export const updateResource = createAsyncThunk(
  "resources/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const payload = {
        name: data.name,
        type: data.type,
        description: data.description,
        accessLevel: data.accessLevel,
        contextRules: data.contextRules || []
      };

      const response = await axiosInstance.put(`/resources/${id}`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update resource'
      );
    }
  }
);
// Delete resource
export const deleteResource = createAsyncThunk(
  "resources/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/resources/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.data);
    }
  }
);