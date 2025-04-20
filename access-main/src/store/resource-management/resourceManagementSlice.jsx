import { createSlice } from "@reduxjs/toolkit";
import {
  fetchResources,
  createResource,
  updateResource,
  deleteResource,
} from "./resourceManagementThunk";

const initialState = {
  resources: [],
  isLoading: false,
  error: null,
  selectedResource: null,
};

const resourceManagementSlice = createSlice({
  name: "resource",
  initialState,
  reducers: {
    setSelectedResource: (state, action) => {
      state.selectedResource = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Resources
      .addCase(fetchResources.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Resource
      .addCase(createResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createResource.fulfilled, (state, action) => {
        console.log('action: ', action);
        state.isLoading = false;
        state.resources.unshift(action.payload);
      })
      .addCase(createResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Resource
      .addCase(updateResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateResource.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.resources.findIndex(
          (resource) => resource._id === action.payload._id
        );
        if (index !== -1) {
          state.resources[index] = action.payload;
        }
      })
      .addCase(updateResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Resource
      .addCase(deleteResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources = state.resources.filter(
          (resource) => resource._id !== action.payload
        );
      })
      .addCase(deleteResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedResource, clearError } = resourceManagementSlice.actions;
export default resourceManagementSlice.reducer;