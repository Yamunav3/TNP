import { configureStore } from '@reduxjs/toolkit';
import applicationsReducer from './slices/applicationsSlice';
import drivesReducer from './slices/drivesSlice';
import profileReducer from './slices/profileSlice';
import uiReducer from './slices/uiSlice';
import adminReducer from './slices/adminSlice';



export const store = configureStore({
  reducer: {
    applications: applicationsReducer,
    drives: drivesReducer,
    profile: profileReducer,
    ui: uiReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
