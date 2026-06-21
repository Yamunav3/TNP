import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Update this if your backend port changes
const API_URL = 'http://localhost:5000/api/drives';

// --- Types ---
export interface Drive {
  _id?: string; // MongoDB ID
  id?: string;  // Fallback
  companyName: string;
  companyLogo: string;
  role: string;
  package: string;
  location: string;
  jobType: string;
  description: string;
  requirements: string[];
  eligibility: {
    minCGPA: number;
    maxBacklogs: number;
    allowedBranches: string[];
    batch: number[];
  };
  selectionProcess: {
    round: number;
    name: string;
    description: string;
  }[];
  deadline: string;
  postedDate: string;
  totalApplicants: number;
  applied: boolean;
  isEligible: boolean; 
  createdAt?: string; 
  applicationLink?: string; 
}

interface DrivesState {
  drives: Drive[];
  filteredDrives: Drive[];
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    jobType: string[];
    eligibleOnly: boolean;
    sortBy: string;
  };
}

const initialState: DrivesState = {
  drives: [],
  filteredDrives: [],
  loading: false,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    jobType: [],
    eligibleOnly: false,
    sortBy: 'deadline',
  },
};

// --- ASYNC THUNKS (REAL API CALLS) ---

// 1. FETCH (Corrected: No more mock data)
export const fetchDrives = createAsyncThunk('drives/fetchDrives', async () => {
  const response = await axios.get(API_URL);
  return response.data; // Returns array from MongoDB
});

// 2. ADD
export const addDrive = createAsyncThunk('drives/addDrive', async (newDrive: Partial<Drive>) => {
  const response = await axios.post(API_URL, newDrive);
  return response.data;
});

// 3. DELETE
export const deleteDrive = createAsyncThunk(
  'drives/deleteDrive',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id; 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete drive');
      }
      return rejectWithValue('Failed to delete drive');
    }
  }
);

// 4. APPLY
export const applyToDrive = createAsyncThunk('drives/applyToDrive', async (id: string) => {
  // In a real app: await axios.post(`${API_URL}/${id}/apply`);
  return { id }; 
});

const drivesSlice = createSlice({
  name: 'drives',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<DrivesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    applyFilters: (state) => {
        let filtered = [...state.drives];
        // Search Logic
        if (state.filters.search) {
             const s = state.filters.search.toLowerCase();
             filtered = filtered.filter(d => 
               d.companyName.toLowerCase().includes(s) || 
               d.role.toLowerCase().includes(s)
             );
        }
        // Job Type Logic
        if (state.filters.jobType.length > 0) {
             filtered = filtered.filter(d => state.filters.jobType.includes(d.jobType));
        }
        // Eligible Logic
        if (state.filters.eligibleOnly) {
             filtered = filtered.filter(d => d.isEligible);
        }
        state.filteredDrives = filtered;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Drives ---
      .addCase(fetchDrives.pending, (state) => { 
        state.loading = true; 
        state.isLoading = true; 
        state.error = null;
      })
      .addCase(fetchDrives.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.drives = action.payload;
        state.filteredDrives = action.payload; // Initialize filtered list
      })
      .addCase(fetchDrives.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch drives';
      })

      // --- Add Drive ---
      .addCase(addDrive.fulfilled, (state, action) => {
          state.drives.unshift(action.payload);
          state.filteredDrives.unshift(action.payload);
      })

      // --- Delete Drive ---
      .addCase(deleteDrive.fulfilled, (state, action) => {
        const idToDelete = action.payload;
        // Remove from both lists using _id OR id
        state.drives = state.drives.filter(
          (drive) => drive._id !== idToDelete && drive.id !== idToDelete
        );
        state.filteredDrives = state.filteredDrives.filter(
          (drive) => drive._id !== idToDelete && drive.id !== idToDelete
        );
      })

      // --- Apply to Drive ---
      .addCase(applyToDrive.fulfilled, (state, action) => {
          const id = action.payload.id;
          const drive = state.drives.find(d => (d._id || d.id) === id);
          if (drive) {
              drive.applied = true;
              drive.totalApplicants += 1;
          }
          const fDrive = state.filteredDrives.find(d => (d._id || d.id) === id);
          if(fDrive) {
              fDrive.applied = true;
              fDrive.totalApplicants += 1;
          }
      });
  },
});

export const { setFilters, applyFilters } = drivesSlice.actions;
export default drivesSlice.reducer;