import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Ensure this matches your backend URL
const API_URL = 'http://localhost:5000/api/applications';

export type ApplicationStatus = 'applied' | 'screening' | 'shortlisted' | 'interview' | 'selected' | 'rejected';

export interface Application {
  location: any;
  _id?: string; // MongoDB ID
  id?: string;  // Fallback
  driveId: string;
  companyName: string;
  companyLogo?: string;
  role: string;
  appliedDate: string;
  status: ApplicationStatus;
  currentRound: number;
  totalRounds: number;
  package: string;
  nextStep?: string;
  timeline?: {
    date: string;
    event: string;
    status: 'completed' | 'current' | 'pending';
    feedback?: string;
  }[];
}

interface ApplicationsState {
  applications: Application[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  applications: [],
  isLoading: false,
  error: null,
};

// --- 1. THUNK: FETCH APPLICATIONS ---
// Updated to include Token as well, so your dashboard works later
export const fetchApplications = createAsyncThunk(
  'applications/fetch', 
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Uncomment this when your backend route is ready
      // const response = await axios.get(`${API_URL}/my-applications`, config);
      // return response.data;
      return []; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch');
    }
});

// --- 2. THUNK: SUBMIT NEW APPLICATION (FIXED) ---
export const submitApplication = createAsyncThunk(
  'applications/submit', 
  async (applicationData: { driveId: string; studentId: string; studentName: string }, { rejectWithValue }) => {
    try {
      // 1. Get the Token from Local Storage
      const token = localStorage.getItem('token');

      // 2. Validate Token
      if (!token) {
        return rejectWithValue("Authentication missing. Please login again.");
      }

      // 3. Configure Headers
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <--- CRITICAL FIX
        }
      };

      console.log("📤 Submitting Application...", applicationData);

      // 4. Send Request with Config
      const response = await axios.post(`${API_URL}/apply`, applicationData, config);
      
      return response.data; 

    } catch (error: any) {
      console.error("❌ Apply Error:", error.response?.data);
      // Return the specific message from the backend (e.g., "Already applied")
      return rejectWithValue(error.response?.data?.message || 'Failed to apply');
    }
  }
);

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Submit Handlers
    builder
      .addCase(submitApplication.pending, (state) => { 
        state.isLoading = true; 
        state.error = null;
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload.application) {
            state.applications.unshift(action.payload.application);
        } 
        // Optional: Add the new application to the state immediately
        // state.applications.unshift(action.payload.application); 
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Fetch Handlers
    builder
      .addCase(fetchApplications.pending, (state) => { state.isLoading = true; })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
  }
});

export default applicationsSlice.reducer;