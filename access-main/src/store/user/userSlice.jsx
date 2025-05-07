import { createSlice } from "@reduxjs/toolkit";
import {
  createUser,
  deleteUser,
  fetchAllUsers,
  loginUser,
  updateUser,
  updateUserProfile,
} from "./userThunk";

const initialState = {
  user: null,
  allUsers: [],
  isLoading: false,
  profileLoader: false,
  userProfile: false,
  userProfileLoader: false,
  token: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUser: (state) => {
      state.token = user ? user.Token : null;
      state.user = user ? user : null;
    },
    logoutUser: (state) => {
      state.user = null;

      localStorage.clear();
      state.token = null;
    },
  },

  extraReducers: (builder) => {
    builder

      //Login User

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        const { user, token } = action.payload;
        state.user = user;
        state.token = token;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
      })
      // Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.allUsers = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllUsers.rejected, (state) => {
        state.isLoading = false;
      })

      // Create User
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.allUsers = [action.payload.user,...state.allUsers ];
        state.isLoading = false;
      })
      .addCase(createUser.rejected, (state) => {
        state.isLoading = false;
      })

      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.profileLoader = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profileLoader = false;
        state.user = action.payload.user;
      })
      .addCase(updateUserProfile.rejected, (state) => {
        state.profileLoader = false;
      })




      // Update User
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
      })  
      .addCase(updateUser.fulfilled, (state, action) => {
        console.log('action: ', action);
        const updatedUser = action.payload.user;
        const index = state.allUsers.findIndex(user => user._id === updatedUser._id);
        if (index !== -1) {
          state.allUsers[index] = updatedUser;
        }
        state.isLoading = false;
      })
      .addCase(updateUser.rejected, (state) => {
        state.isLoading = false;
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const deletedUserId = action.payload.userId;
        state.allUsers = state.allUsers.filter(user => user._id !== deletedUserId);
        state.isLoading = false;
      })  
      .addCase(deleteUser.rejected, (state) => {
        state.isLoading = false;
      })
  },
});
export const { logoutUser, addUser } = userSlice.actions;

export default userSlice.reducer;
