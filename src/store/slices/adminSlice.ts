// // // // // 
// // // // import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// // // // import axios from 'axios';

// // // // const API_URL = 'http://localhost:5000/api/admin';

// // // // // --- Interfaces ---
// // // // export interface Student {
// // // //   _id: string;
// // // //   name: string;
// // // //   email: string;
// // // //   department?: string;
// // // //   year?: string;
// // // //   cgpa?: number;
// // // //   applicationCount: number;
// // // //   placedCompany?: string | null;
// // // //   status?: 'placed' | 'active' | 'interviewing'; 
// // // //   company?: string;
// // // // }

// // // // export interface StudentDetails extends Student {
// // // //   phone?: string;
// // // //   rollNumber?: string;
// // // //   backlogs?: number;
// // // //   applications: {
// // // //     companyName: string;
// // // //     role: string;
// // // //     status: string;
// // // //     appliedDate: string;
// // // //     package?: string;
// // // //   }[];
// // // // }

// // // // interface AdminState {
// // // //   students: Student[];
// // // //   selectedStudent: StudentDetails | null;
// // // //   isLoading: boolean;
// // // //   notifications: any[];
// // // //   error: string | null;
// // // // }

// // // // const initialState: AdminState = {
// // // //   students: [],
// // // //   notifications: [],
// // // //   selectedStudent: null,
// // // //   isLoading: false,
// // // //   error: null,
// // // // };

// // // // // --- THUNKS ---

// // // // // 1. Fetch All Students
// // // // export const fetchAllStudents = createAsyncThunk('admin/fetchStudents', async () => {
// // // //   const response = await axios.get(`${API_URL}/students`);
// // // //   return response.data;
// // // // });

// // // // // 2. Delete Student
// // // // export const deleteStudent = createAsyncThunk('admin/deleteStudent', async (id: string) => {
// // // //     await axios.delete(`${API_URL}/students/${id}`);
// // // //     return id;
// // // // });

// // // // // 3. Fetch Single Student Details (This was missing in your code)
// // // // export const fetchStudentById = createAsyncThunk('admin/fetchStudentById', async (id: string) => {
// // // //   const response = await axios.get(`${API_URL}/students/${id}`);
// // // //   return response.data;
// // // // });

// // // // const adminSlice = createSlice({
// // // //   name: 'admin',
// // // //   initialState,
// // // //   reducers: {
// // // //     // Helper to clear data when modal closes
// // // //     clearSelectedStudent: (state) => {
// // // //       state.selectedStudent = null;
// // // //     }
// // // //     addAdminNotification: (state, action: PayloadAction<any>) => {
// // // //       state.notifications.unshift(action.payload);
// // // //     },
// // // //   },
// // // //   extraReducers: (builder) => {
// // // //     builder
// // // //       // Fetch All
// // // //       .addCase(fetchAllStudents.pending, (state) => { state.isLoading = true; })
// // // //       .addCase(fetchAllStudents.fulfilled, (state, action) => {
// // // //         state.isLoading = false;
// // // //         state.students = action.payload;
// // // //       })
// // // //       .addCase(fetchAllStudents.rejected, (state, action) => {
// // // //         state.isLoading = false;
// // // //         state.error = action.error.message || 'Failed to fetch students';
// // // //       })
// // // //       // Delete
// // // //       .addCase(deleteStudent.fulfilled, (state, action) => {
// // // //           state.students = state.students.filter(s => s._id !== action.payload);
// // // //       })
// // // //       // Fetch Single (Profile View)
// // // //       .addCase(fetchStudentById.pending, (state) => { state.isLoading = true; })
// // // //       .addCase(fetchStudentById.fulfilled, (state, action) => {
// // // //         state.isLoading = false;
// // // //         state.selectedStudent = action.payload;
// // // //       })
// // // //       .addCase(fetchStudentById.rejected, (state, action) => {
// // // //         state.isLoading = false;
// // // //         state.error = action.error.message || 'Error fetching student';
// // // //       });
// // // //   },
// // // // });
// // // // export const { addAdminNotification } = adminSlice.actions;
// // // // export const { clearSelectedStudent } = adminSlice.actions; 
// // // // export default adminSlice.reducer;


// // // import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// // // import axios from 'axios';

// // // const API_URL = 'http://localhost:5000/api/admin';

// // // // --- Interfaces ---
// // // export interface Student {
// // //   _id: string;
// // //   name: string;
// // //   email: string;
// // //   department?: string;
// // //   year?: string;
// // //   cgpa?: number;
// // //   applicationCount: number;
// // //   placedCompany?: string | null;
// // //   status?: 'placed' | 'active' | 'interviewing'; 
// // //   company?: string;
// // // }

// // // export interface StudentDetails extends Student {
// // //   phone?: string;
// // //   rollNumber?: string;
// // //   backlogs?: number;
// // //   applications: {
// // //     companyName: string;
// // //     role: string;
// // //     status: string;
// // //     appliedDate: string;
// // //     package?: string;
// // //   }[];
// // // }

// // // interface AdminState {
// // //   students: Student[];
// // //   selectedStudent: StudentDetails | null;
// // //   isLoading: boolean;
// // //   notifications: any[];
// // //   error: string | null;
// // // }

// // // const initialState: AdminState = {
// // //   students: [],
// // //   notifications: [],
// // //   selectedStudent: null,
// // //   isLoading: false,
// // //   error: null,
// // // };

// // // // --- THUNKS ---

// // // // 1. Fetch All Students
// // // export const fetchAllStudents = createAsyncThunk('admin/fetchStudents', async () => {
// // //   const response = await axios.get(`${API_URL}/students`);
// // //   return response.data;
// // // });

// // // // 2. Delete Student
// // // export const deleteStudent = createAsyncThunk('admin/deleteStudent', async (id: string) => {
// // //     await axios.delete(`${API_URL}/students/${id}`);
// // //     return id;
// // // });

// // // // 3. Fetch Single Student Details
// // // export const fetchStudentById = createAsyncThunk('admin/fetchStudentById', async (id: string) => {
// // //   const response = await axios.get(`${API_URL}/students/${id}`);
// // //   return response.data;
// // // });

// // // const adminSlice = createSlice({
// // //   name: 'admin',
// // //   initialState,
// // //   reducers: {
// // //     // Helper to clear data when modal closes
// // //     clearSelectedStudent: (state) => {
// // //       state.selectedStudent = null;
// // //     }, // <--- FIXED: Added missing comma here
    
// // //     addAdminNotification: (state, action: PayloadAction<any>) => {
// // //       state.notifications.unshift(action.payload);
// // //     },
// // //   },
// // //   extraReducers: (builder) => {
// // //     builder
// // //       // Fetch All
// // //       .addCase(fetchAllStudents.pending, (state) => { state.isLoading = true; })
// // //       .addCase(fetchAllStudents.fulfilled, (state, action) => {
// // //         state.isLoading = false;
// // //         state.students = action.payload;
// // //       })
// // //       .addCase(fetchAllStudents.rejected, (state, action) => {
// // //         state.isLoading = false;
// // //         state.error = action.error.message || 'Failed to fetch students';
// // //       })
// // //       // Delete
// // //       .addCase(deleteStudent.fulfilled, (state, action) => {
// // //           state.students = state.students.filter(s => s._id !== action.payload);
// // //       })
// // //       // Fetch Single (Profile View)
// // //       .addCase(fetchStudentById.pending, (state) => { state.isLoading = true; })
// // //       .addCase(fetchStudentById.fulfilled, (state, action) => {
// // //         state.isLoading = false;
// // //         state.selectedStudent = action.payload;
// // //       })
// // //       .addCase(fetchStudentById.rejected, (state, action) => {
// // //         state.isLoading = false;
// // //         state.error = action.error.message || 'Error fetching student';
// // //       });
// // //   },
// // // });

// // // // Correct Export Structure
// // // export const { addAdminNotification, clearSelectedStudent } = adminSlice.actions;
// // // export default adminSlice.reducer;




// // import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// // import axios from 'axios';

// // const API_URL = 'http://localhost:5000/api/admin';

// // // --- Interfaces for Dashboard Data ---
// // export interface DashboardStats {
// //   totalStudents: number;
// //   companiesOnboarded: number;
// //   activeDrives: number;
// //   avgPackage: string; // e.g. "12.5 LPA"
  
// //   // Trends (calculated on backend)
// //   studentTrend: number; // e.g. 12 (percent)
// //   companyTrend: number;
// //   drivesTrend: number;
// //   packageTrend: number;
// // }

// // export interface ChartData {
// //   month: string;
// //   placed: number;
// // }

// // export interface DeptData {
// //   name: string;
// //   value: number; // Percentage or Count
// //   color: string;
// // }

// // export interface ActivityLog {
// //   action: string;
// //   time: string;
// //   type: 'company' | 'application' | 'shortlist' | 'student';
// // }

// // export interface UpcomingDrive {
// //   company: string;
// //   date: string;
// //   slots: number;
// // }

// // interface AdminState {
// //   dashboardData: {
// //     stats: DashboardStats;
// //     placementTrend: ChartData[];
// //     departmentData: DeptData[];
// //     recentActivity: ActivityLog[];
// //     upcomingDrives: UpcomingDrive[];
// //   } | null;
// //   isLoading: boolean;
// //   error: string | null;
// // }

// // const initialState: AdminState = {
// //   dashboardData: null,
// //   isLoading: false,
// //   error: null,
// // };

// // // --- ASYNC THUNK ---
// // export const fetchDashboardStats = createAsyncThunk('admin/fetchDashboardStats', async () => {
// //   const response = await axios.get(`${API_URL}/dashboard-stats`);
// //   return response.data;
// // });

// // const adminSlice = createSlice({
// //   name: 'admin',
// //   initialState,
// //   reducers: {},
// //   extraReducers: (builder) => {
// //     builder
// //       .addCase(fetchDashboardStats.pending, (state) => {
// //         state.isLoading = true;
// //       })
// //       .addCase(fetchDashboardStats.fulfilled, (state, action) => {
// //         state.isLoading = false;
// //         state.dashboardData = action.payload;
// //       })
// //       .addCase(fetchDashboardStats.rejected, (state, action) => {
// //         state.isLoading = false;
// //         state.error = action.error.message || 'Failed to load stats';
// //       });
// //   },
// // });

// // export default adminSlice.reducer;



// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/admin';

// // --- 1. UPDATE THIS INTERFACE ---
// export interface DashboardStats {
//   totalStudents: number;
//   companiesOnboarded: number;
//   activeDrives: number;
//   avgPackage: string;

//   // --- ADD THESE MISSING FIELDS ---
//   studentTrend: number; 
//   companyTrend: number;
//   drivesTrend: number;
//   packageTrend: number;
// }

// export interface ChartData {
//   month: string;
//   placed: number;
// }

// export interface DeptData {
//   name: string;
//   value: number;
//   color: string;
// }

// export interface ActivityLog {
//   action: string;
//   time: string;
//   type: 'company' | 'application' | 'shortlist' | 'student';
// }

// export interface UpcomingDrive {
//   company: string;
//   date: string;
//   slots: number;
// }

// interface AdminState {
//   dashboardData: {
//     stats: DashboardStats;
//     placementTrend: ChartData[];
//     departmentData: DeptData[];
//     recentActivity: ActivityLog[];
//     upcomingDrives: UpcomingDrive[];
//   } | null;
//   notifications: any[];
//   isLoading: boolean;
//   error: string | null;
// }

// const initialState: AdminState = {
//   dashboardData: null,
//   notifications: [],
//   isLoading: false,
//   error: null,
// };

// // --- ASYNC THUNK ---
// export const fetchDashboardStats = createAsyncThunk('admin/fetchDashboardStats', async () => {
//   const response = await axios.get(`${API_URL}/dashboard-stats`);
//   return response.data;
// });

// const adminSlice = createSlice({
//   name: 'admin',
//   initialState,
//   reducers: {
//     addAdminNotification: (state, action: PayloadAction<any>) => {
//       state.notifications.unshift(action.payload);
//     },
//     clearNotifications: (state) => {
//       state.notifications = [];
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchDashboardStats.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(fetchDashboardStats.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.dashboardData = action.payload;
//       })
//       .addCase(fetchDashboardStats.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.error.message || 'Failed to load stats';
//       });
//   },
// });

// export const { addAdminNotification, clearNotifications } = adminSlice.actions;
// export default adminSlice.reducer;


import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5002/api/admin';

// ==========================================
// 1. INTERFACES (Types)
// ==========================================

// --- Student Types ---
export interface Student {
  _id: string;
  name: string;
  email: string;
  department?: string;
  year?: string;
  cgpa?: number;
  applicationCount: number;
  placedCompany?: string | null;
  status?: 'placed' | 'active' | 'interviewing'; 
  company?: string;
}

export interface StudentDetails extends Student {
  phone?: string;
  rollNumber?: string;
  backlogs?: number;
  applications: {
    companyName: string;
    role: string;
    status: string;
    appliedDate: string;
    package?: string;
  }[];
}

// --- Dashboard Types ---
export interface DashboardStats {
  totalStudents: number;
  companiesOnboarded: number;
  activeDrives: number;
  avgPackage: string;
  studentTrend: number;
  companyTrend: number;
  drivesTrend: number;
  packageTrend: number;
}

export interface ChartData {
  month: string;
  placed: number;
}

export interface DeptData {
  name: string;
  value: number;
  color: string;
}

export interface ActivityLog {
  action: string;
  time: string;
  type: 'company' | 'application' | 'shortlist' | 'student';
}

export interface UpcomingDrive {
  company: string;
  date: string;
  slots: number;
}

// ==========================================
// 2. STATE DEFINITION
// ==========================================
interface AdminState {
  // Student Management State
  students: Student[];
  selectedStudent: StudentDetails | null;
  
  // Dashboard State
  dashboardData: {
    stats: DashboardStats;
    placementTrend: ChartData[];
    departmentData: DeptData[];
    recentActivity: ActivityLog[];
    upcomingDrives: UpcomingDrive[];
  } | null;

  // Global State
  notifications: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  students: [],
  selectedStudent: null,
  dashboardData: null,
  notifications: [],
  isLoading: false,
  error: null,
};

// ==========================================
// 3. ASYNC THUNKS (API Calls)
// ==========================================

// --- Student Actions ---
export const fetchAllStudents = createAsyncThunk('admin/fetchStudents', async () => {
  const response = await axios.get(`${API_URL}/students`);
  return response.data;
});

export const deleteStudent = createAsyncThunk('admin/deleteStudent', async (id: string) => {
  await axios.delete(`${API_URL}/students/${id}`);
  return id;
});

export const fetchStudentById = createAsyncThunk('admin/fetchStudentById', async (id: string) => {
  const response = await axios.get(`${API_URL}/students/${id}`);
  return response.data;
});

// --- Dashboard Actions ---
export const fetchDashboardStats = createAsyncThunk('admin/fetchDashboardStats', async () => {
  const response = await axios.get(`${API_URL}/dashboard-stats`);
  return response.data;
});

// ==========================================
// 4. SLICE (Reducers)
// ==========================================
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Student Reducers
    clearSelectedStudent: (state) => {
      state.selectedStudent = null;
    },

    // Notification Reducers
    addAdminNotification: (state, action: PayloadAction<any>) => {
      state.notifications.unshift(action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch All Students ---
      .addCase(fetchAllStudents.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAllStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = action.payload;
      })
      .addCase(fetchAllStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch students';
      })

      // --- Delete Student ---
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.students = state.students.filter(s => s._id !== action.payload);
      })

      // --- Fetch Student Details ---
      .addCase(fetchStudentById.pending, (state) => { state.isLoading = true; })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedStudent = action.payload;
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error fetching student';
      })

      // --- Fetch Dashboard Stats ---
      .addCase(fetchDashboardStats.pending, (state) => { state.isLoading = true; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load stats';
      });
  },
});

// Export ALL actions
export const { 
  addAdminNotification, 
  clearNotifications, 
  clearSelectedStudent 
} = adminSlice.actions;

export default adminSlice.reducer;