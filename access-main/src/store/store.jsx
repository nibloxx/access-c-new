// import { configureStore } from "@reduxjs/toolkit";
// import { combineReducers } from "redux";
// import userSlice from "./user/userSlice";
// import roleManagementSlice from "./role-management/roleManagementSlice";
// import resourceReducer from "./resource/resourceSlice";
// import { persistStore, persistReducer } from "redux-persist";

// const reducers = combineReducers({
//   user: userSlice,
//   role: roleManagementSlice,
//   resource: resourceReducer,

// });

// const store = configureStore({
//   reducer: reducers,
//   devTools: process.env.NODE_ENV !== "production",
// });
// export default store;


import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import userSlice from "./user/userSlice";
import roleManagementSlice from "./role-management/roleManagementSlice";
import resourceManagementSlice from "./resource-management/resourceManagementSlice";
import accessLogSlice from './access-log/accessLogSlice';
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage


// Persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // Only persist user state
  blacklist: [], // Optionally blacklist any reducers
};

const reducers = combineReducers({
  user: userSlice,
  role: roleManagementSlice,
  resource: resourceManagementSlice,
  accessLog: accessLogSlice

});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, reducers);

// Create store with persisted reducer
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Create persistor
export const persistor = persistStore(store);

export default store;