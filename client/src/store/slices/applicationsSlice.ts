import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Ensure this matches your backend URL
const API_URL = 'http://localhost:5002/api/applications';

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
export const fetchApplications = createAsyncThunk(
  'applications/fetch', 
  async (studentId?: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Fetch applications from backend
      const response = await axios.get(`${API_URL}/my-applications`, config);
      // Extract the applications array from the response
      return response.data.applications || []; 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Failed to fetch applications:", error.response?.data);
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch');
      }
      console.error("❌ Failed to fetch applications:", error);
      return rejectWithValue('Failed to fetch');
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

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Apply Error:", error.response?.data);
        return rejectWithValue(error.response?.data?.message || 'Failed to apply');
      }
      console.error("❌ Apply Error:", error);
      return rejectWithValue('Failed to apply');
    }
  }
);

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    // Add a new application manually (for socket updates)
    addNewApplication: (state, action: PayloadAction<Application>) => {
      state.applications.unshift(action.payload);
    },
    // Update application status (for admin status updates via socket)
    updateApplicationStatus: (state, action: PayloadAction<{ applicationId: string; status: ApplicationStatus }>) => {
      const app = state.applications.find(a => (a._id || a.id) === action.payload.applicationId);
      if (app) {
        app.status = action.payload.status;
      }
    },
    // Refresh entire applications list
    setApplications: (state, action: PayloadAction<Application[]>) => {
      state.applications = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Submit Handlers
    builder
      .addCase(submitApplication.pending, (state) => { 
        state.isLoading = true; 
        state.error = null;
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        if (action.payload.application) {
          // Add the new application to the top of the list with all details
          const newApp: Application = {
            _id: action.payload.application._id,
            id: action.payload.application.id,
            driveId: action.payload.application.driveId,
            companyName: action.payload.application.companyName,
            companyLogo: action.payload.application.companyLogo,
            role: action.payload.application.role,
            appliedDate: action.payload.application.appliedDate,
            status: action.payload.application.status || 'applied',
            currentRound: 1,
            totalRounds: 5,
            package: action.payload.application.package,
            location: action.payload.application.location
          };
          state.applications.unshift(newApp);
        }
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

export const { addNewApplication, updateApplicationStatus, setApplications } = applicationsSlice.actions;
export default applicationsSlice.reducer;
