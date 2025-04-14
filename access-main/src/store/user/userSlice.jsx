import { createSlice } from "@reduxjs/toolkit";
import {
  getSubscribedPackaged,
  getUserProfile,
  loginUser,
  registerUser,
  sendVerifyCode,
  updatePassword,
  updateProfile,
  verifyOTP,
} from "./userThunk";

const initialState = {
  user: null,
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
    updateUser: (state, action) => {
      // state.user = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      //Login User

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.token = action.payload.AccessToken;
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
      })

      //Register User

      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })

      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
      })

      //  Get User Profile

      .addCase(getUserProfile.pending, (state) => {
        state.userProfileLoader = true;
      })

      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        state.userProfileLoader = false;
      })

      .addCase(getUserProfile.rejected, (state) => {
        state.userProfileLoader = false;
      })
      //  send otp
      .addCase(sendVerifyCode.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendVerifyCode.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendVerifyCode.rejected, (state) => {
        state.isLoading = false;
      })
      //  veryfy otp
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyOTP.rejected, (state) => {
        state.isLoading = false;
      })

      //  update profile
      .addCase(updateProfile.pending, (state) => {
        state.profileLoader = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };

        state.profileLoader = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileLoader = false;
      })

      // Update Passowrd
      .addCase(updatePassword.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isLoading = false;
      })

      //GET SUBSCRIPTION By ID

      .addCase(getSubscribedPackaged.pending, (state, action) => {
        // state.isLoading = true;
      })
      .addCase(getSubscribedPackaged.fulfilled, (state, action) => {
        state.user = {
          ...state.user,
          SubscribedPlan: action.payload.SubscribedPlan,
          SubscriptionData: action.payload.SubscriptionData,
        };

        // state.isLoading = false;
      })
      .addCase(getSubscribedPackaged.rejected, (state, action) => {
        // state.isLoading = false;
      });
  },
});
export const { logoutUser, addUser, updateUser } = userSlice.actions;

export default userSlice.reducer;
