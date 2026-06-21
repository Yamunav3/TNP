import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchDrives } from './drivesSlice';


import { Application } from './applicationsSlice';
import { setProfile } from './profileSlice';

// --- THE COORDINATOR THUNK ---
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchAll',
  async (_, { dispatch }) => {
    // Fire all requests in parallel for speed
    await Promise.all([
      dispatch(setProfile()),
      dispatch(fetchDrives()),
      dispatch(setApplications())
    ]);
  }
);

// We need a tiny slice to track the loading state of the *whole* dashboard
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    isLoading: false,
    lastUpdated: null as string | null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state) => {
        state.isLoading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state) => {
        state.isLoading = false;
      });
  }
});

export default dashboardSlice.reducer;

function setApplications(): any {
    throw new Error('Function not implemented.');
}
