// // import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// // export interface StudentProfile {
// //   id: string;
// //   personalInfo: {
// //     firstName: string;
// //     lastName: string;
// //     email: string;
// //     phone: string;
// //     avatar: string;
// //     dateOfBirth: string;
// //     gender: string;
// //     address: string;
// //   };
// //   academicInfo: {
// //     rollNumber: string;
// //     branch: string;
// //     batch: number;
// //     cgpa: number;
// //     activeBacklogs: number;
// //     totalBacklogs: number;
// //     tenthPercentage: number;
// //     twelfthPercentage: number;
// //   };
// //   skills: string[];
// //   certifications: {
// //     name: string;
// //     issuer: string;
// //     date: string;
// //     credentialUrl?: string;
// //   }[];
// //   projects: {
// //     name: string;
// //     description: string;
// //     technologies: string[];
// //     link?: string;
// //     startDate: string;
// //     endDate?: string;
// //   }[];
// //   internships: {
// //     company: string;
// //     role: string;
// //     duration: string;
// //     description: string;
// //     startDate: string;
// //     endDate: string;
// //   }[];
// //   resumes: {
// //     id: string;
// //     name: string;
// //     uploadedAt: string;
// //     isDefault: boolean;
// //   }[];
// //   profileCompletion: number;
// // }

// // interface ProfileState {
// //   profile: StudentProfile | null;
// //   loading: boolean;
// //   error: string | null;
// // }

// // const initialState: ProfileState = {
// //   profile: {
// //     id: '1',
// //     personalInfo: {
// //       firstName: 'Rahul',
// //       lastName: 'Sharma',
// //       email: 'rahul.sharma@university.edu',
// //       phone: '+91 98765 43210',
// //       avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
// //       dateOfBirth: '2001-05-15',
// //       gender: 'Male',
// //       address: 'Bangalore, Karnataka',
// //     },
// //     academicInfo: {
// //       rollNumber: 'CS21B1045',
// //       branch: 'Computer Science & Engineering',
// //       batch: 2024,
// //       cgpa: 8.45,
// //       activeBacklogs: 0,
// //       totalBacklogs: 0,
// //       tenthPercentage: 92.5,
// //       twelfthPercentage: 89.3,
// //     },
// //     skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'AWS', 'Docker', 'TypeScript', 'MongoDB'],
// //     certifications: [
// //       { name: 'AWS Solutions Architect', issuer: 'Amazon Web Services', date: '2023-08-15', credentialUrl: 'https://aws.amazon.com/verify' },
// //       { name: 'Meta Frontend Developer', issuer: 'Coursera', date: '2023-06-20' },
// //     ],
// //     projects: [
// //       {
// //         name: 'E-Commerce Platform',
// //         description: 'Full-stack e-commerce application with payment integration, inventory management, and analytics dashboard.',
// //         technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
// //         link: 'https://github.com/rahul/ecommerce',
// //         startDate: '2023-01-01',
// //         endDate: '2023-04-01',
// //       },
// //       {
// //         name: 'AI Chatbot',
// //         description: 'Conversational AI chatbot using NLP for customer support automation.',
// //         technologies: ['Python', 'TensorFlow', 'FastAPI', 'Docker'],
// //         link: 'https://github.com/rahul/chatbot',
// //         startDate: '2023-05-01',
// //         endDate: '2023-07-01',
// //       },
// //     ],
// //     internships: [
// //       {
// //         company: 'TechCorp Solutions',
// //         role: 'Software Development Intern',
// //         duration: '3 months',
// //         description: 'Developed RESTful APIs and contributed to the frontend dashboard using React.',
// //         startDate: '2023-05-01',
// //         endDate: '2023-08-01',
// //       },
// //     ],
// //     resumes: [
// //       { id: '1', name: 'Resume_Main.pdf', uploadedAt: '2024-01-15', isDefault: true },
// //       { id: '2', name: 'Resume_SDE.pdf', uploadedAt: '2024-01-10', isDefault: false },
// //     ],
// //     profileCompletion: 85,
// //   },
// //   loading: false,
// //   error: null,
// // };

// // const profileSlice = createSlice({
// //   name: 'profile',
// //   initialState,
// //   reducers: {
// //     setProfile: (state, action: PayloadAction<StudentProfile>) => {
// //       state.profile = action.payload;
// //     },
// //     updatePersonalInfo: (state, action: PayloadAction<Partial<StudentProfile['personalInfo']>>) => {
// //       if (state.profile) {
// //         state.profile.personalInfo = { ...state.profile.personalInfo, ...action.payload };
// //       }
// //     },
// //     addSkill: (state, action: PayloadAction<string>) => {
// //       if (state.profile && !state.profile.skills.includes(action.payload)) {
// //         state.profile.skills.push(action.payload);
// //       }
// //     },
// //     removeSkill: (state, action: PayloadAction<string>) => {
// //       if (state.profile) {
// //         state.profile.skills = state.profile.skills.filter(s => s !== action.payload);
// //       }
// //     },
// //     addCertification: (state, action: PayloadAction<StudentProfile['certifications'][0]>) => {
// //       if (state.profile) {
// //         state.profile.certifications.push(action.payload);
// //       }
// //     },
// //     addProject: (state, action: PayloadAction<StudentProfile['projects'][0]>) => {
// //       if (state.profile) {
// //         state.profile.projects.push(action.payload);
// //       }
// //     },
// //     addResume: (state, action: PayloadAction<StudentProfile['resumes'][0]>) => {
// //       if (state.profile) {
// //         state.profile.resumes.push(action.payload);
// //       }
// //     },
// //     setDefaultResume: (state, action: PayloadAction<string>) => {
// //       if (state.profile) {
// //         state.profile.resumes = state.profile.resumes.map(r => ({
// //           ...r,
// //           isDefault: r.id === action.payload,
// //         }));
// //       }
// //     },
// //     updateProfileCompletion: (state, action: PayloadAction<number>) => {
// //       if (state.profile) {
// //         state.profile.profileCompletion = action.payload;
// //       }
// //     },
// //     setLoading: (state, action: PayloadAction<boolean>) => {
// //       state.loading = action.payload;
// //     },
// //     setError: (state, action: PayloadAction<string | null>) => {
// //       state.error = action.payload;
// //     },
// //   },
// // });

// // export const {
// //   setProfile,
// //   updatePersonalInfo,
// //   addSkill,
// //   removeSkill,
// //   addCertification,
// //   addProject,
// //   addResume,
// //   setDefaultResume,
// //   updateProfileCompletion,
// //   setLoading,
// //   setError,
// // } = profileSlice.actions;

// // export default profileSlice.reducer;



// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// export interface Link {
//   platform: 'github' | 'linkedin' | 'portfolio' | 'leetcode' | 'other';
//   url: string;
//   label?: string;
// }

// export interface StudentProfile {
//   experience: any[];
//   resumeUrl: string;
//   resumeName: string;
//   id: string;
//   personalInfo: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     phone: string;
//     avatar: string;
//     dateOfBirth: string;
//     gender: string;
//     address: string;
//   };
//   academicInfo: {
//     rollNumber: string;
//     branch: string;
//     batch: number;
//     cgpa: number;
//     activeBacklogs: number;
//     totalBacklogs: number;
//     tenthPercentage: number;
//     twelfthPercentage: number;
//   };
//   skills: string[];
//   links: Link[];
//   certifications: {
//     name: string;
//     issuer: string;
//     date: string;
//     credentialUrl?: string;
//   }[];
//   projects: {
//     name: string;
//     description: string;
//     technologies: string[];
//     link?: string;
//     startDate: string;
//     endDate?: string;
//   }[];
//   internships: {
//     company: string;
//     role: string;
//     duration: string;
//     description: string;
//     startDate: string;
//     endDate: string;
//   }[];
//   resumes: {
//     id: string;
//     name: string;
//     uploadedAt: string;
//     isDefault: boolean;
//   }[];
//   profileCompletion: number;
// }

// interface ProfileState {
//   profile: StudentProfile | null;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: ProfileState = {
//   profile: {
//     id: '1',
//     personalInfo: {
//       firstName: 'Rahul',
//       lastName: 'Sharma',
//       email: 'rahul.sharma@university.edu',
//       phone: '+91 98765 43210',
//       avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
//       dateOfBirth: '2001-05-15',
//       gender: 'Male',
//       address: 'Bangalore, Karnataka',
//     },
//     academicInfo: {
//       rollNumber: 'CS21B1045',
//       branch: 'Computer Science & Engineering',
//       batch: 2024,
//       cgpa: 8.45,
//       activeBacklogs: 0,
//       totalBacklogs: 0,
//       tenthPercentage: 92.5,
//       twelfthPercentage: 89.3,
//     },
//     skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'AWS', 'Docker', 'TypeScript', 'MongoDB'],
//     links: [
//       { platform: 'github', url: 'https://github.com/rahulsharma', label: 'GitHub Profile' },
//       { platform: 'linkedin', url: 'https://linkedin.com/in/rahulsharma', label: 'LinkedIn Profile' },
//       { platform: 'portfolio', url: 'https://rahulsharma.dev', label: 'Personal Portfolio' },
//       { platform: 'leetcode', url: 'https://leetcode.com/rahul_sharma', label: 'LeetCode Profile' },
//     ],
//     certifications: [
//       { name: 'AWS Solutions Architect', issuer: 'Amazon Web Services', date: '2023-08-15', credentialUrl: 'https://aws.amazon.com/verify' },
//       { name: 'Meta Frontend Developer', issuer: 'Coursera', date: '2023-06-20' },
//     ],
//     projects: [
//       {
//         name: 'E-Commerce Platform',
//         description: 'Full-stack e-commerce application with payment integration, inventory management, and analytics dashboard.',
//         technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
//         link: 'https://github.com/rahul/ecommerce',
//         startDate: '2023-01-01',
//         endDate: '2023-04-01',
//       },
//       {
//         name: 'AI Chatbot',
//         description: 'Conversational AI chatbot using NLP for customer support automation.',
//         technologies: ['Python', 'TensorFlow', 'FastAPI', 'Docker'],
//         link: 'https://github.com/rahul/chatbot',
//         startDate: '2023-05-01',
//         endDate: '2023-07-01',
//       },
//     ],
//     internships: [
//       {
//         company: 'TechCorp Solutions',
//         role: 'Software Development Intern',
//         duration: '3 months',
//         description: 'Developed RESTful APIs and contributed to the frontend dashboard using React.',
//         startDate: '2023-05-01',
//         endDate: '2023-08-01',
//       },
//     ],
//     resumes: [
//       { id: '1', name: 'Resume_Main.pdf', uploadedAt: '2024-01-15', isDefault: true },
//       { id: '2', name: 'Resume_SDE.pdf', uploadedAt: '2024-01-10', isDefault: false },
//     ],
//     profileCompletion: 85,
//     experience: [],
//     resumeUrl: '',
//     resumeName: ''
//   },
//   loading: false,
//   error: null,
// };

// const profileSlice = createSlice({
//   name: 'profile',
//   initialState,
//   reducers: {
//     setProfile: (state, action: PayloadAction<StudentProfile>) => {
//       state.profile = action.payload;
//     },
//     updatePersonalInfo: (state, action: PayloadAction<Partial<StudentProfile['personalInfo']>>) => {
//       if (state.profile) {
//         state.profile.personalInfo = { ...state.profile.personalInfo, ...action.payload };
//       }
//     },
//     updateAcademicInfo: (state, action: PayloadAction<Partial<StudentProfile['academicInfo']>>) => {
//       if (state.profile) {
//         state.profile.academicInfo = { ...state.profile.academicInfo, ...action.payload };
//       }
//     },
//     setSkills: (state, action: PayloadAction<string[]>) => {
//       if (state.profile) {
//         state.profile.skills = action.payload;
//       }
//     },
//     addSkill: (state, action: PayloadAction<string>) => {
//       if (state.profile && !state.profile.skills.includes(action.payload)) {
//         state.profile.skills.push(action.payload);
//       }
//     },
//     removeSkill: (state, action: PayloadAction<string>) => {
//       if (state.profile) {
//         state.profile.skills = state.profile.skills.filter(s => s !== action.payload);
//       }
//     },
//     setLinks: (state, action: PayloadAction<Link[]>) => {
//       if (state.profile) {
//         state.profile.links = action.payload;
//       }
//     },
//     addLink: (state, action: PayloadAction<Link>) => {
//       if (state.profile) {
//         state.profile.links.push(action.payload);
//       }
//     },
//     removeLink: (state, action: PayloadAction<number>) => {
//       if (state.profile) {
//         state.profile.links = state.profile.links.filter((_, index) => index !== action.payload);
//       }
//     },
//     // Generic updateProfile action
//     updateProfile: (state, action: PayloadAction<{section: string, data: any}>) => {
//       if (state.profile) {
//         const { section, data } = action.payload;
//         switch(section) {
//           case 'personalInfo':
//             state.profile.personalInfo = { ...state.profile.personalInfo, ...data };
//             break;
//           case 'academicInfo':
//             state.profile.academicInfo = { ...state.profile.academicInfo, ...data };
//             break;
//           case 'skills':
//             state.profile.skills = data;
//             break;
//           case 'links':
//             state.profile.links = data;
//             break;
//           case 'certifications':
//             state.profile.certifications = data;
//             break;
//           case 'projects':
//             state.profile.projects = data;
//             break;
//           case 'internships':
//             state.profile.internships = data;
//             break;
//           case 'resumes':
//             state.profile.resumes = data;
//             break;
//           default:
//             console.warn(`Unknown section: ${section}`);
//         }
//       }
//     },
//     addCertification: (state, action: PayloadAction<StudentProfile['certifications'][0]>) => {
//       if (state.profile) {
//         state.profile.certifications.push(action.payload);
//       }
//     },
//     addProject: (state, action: PayloadAction<StudentProfile['projects'][0]>) => {
//       if (state.profile) {
//         state.profile.projects.push(action.payload);
//       }
//     },
//     addResume: (state, action: PayloadAction<StudentProfile['resumes'][0]>) => {
//       if (state.profile) {
//         state.profile.resumes.push(action.payload);
//       }
//     },
//     setDefaultResume: (state, action: PayloadAction<string>) => {
//       if (state.profile) {
//         state.profile.resumes = state.profile.resumes.map(r => ({
//           ...r,
//           isDefault: r.id === action.payload,
//         }));
//       }
//     },
//     updateProfileCompletion: (state, action: PayloadAction<number>) => {
//       if (state.profile) {
//         state.profile.profileCompletion = action.payload;
//       }
//     },
//     setLoading: (state, action: PayloadAction<boolean>) => {
//       state.loading = action.payload;
//     },
//     setError: (state, action: PayloadAction<string | null>) => {
//       state.error = action.payload;
//     },
//   },
// });

// // Fix: Only export once with all actions
// export const {
//   setProfile,
//   updatePersonalInfo,
//   updateAcademicInfo,
//   setSkills,
//   addSkill,
//   removeSkill,
//   setLinks,
//   addLink,
//   removeLink,
//   updateProfile,
//   addCertification,
//   addProject,
//   addResume,
//   setDefaultResume,
//   updateProfileCompletion,
//   setLoading,
//   setError,
// } = profileSlice.actions;

// export default profileSlice.reducer;


import axios from 'axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface StudentProfile {
  id: string;
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  year?: string;
  cgpa?: number;
  backlogs?: number;
  headline?: string;
  image?: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
    role: string;
  };
  academicInfo: {
    branch: string;
    cgpa: number;
    backlogs?: number;
    rollNumber: string;
    batch: number;
  };
  skills: string[];
  profileCompletion: number;
  // Add other fields as needed
}

interface ProfileState {
  profile: StudentProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
const API_URL = `${API_BASE_URL}/api/auth`;

const buildFallbackProfile = (user: any): StudentProfile => ({
  id: user._id || '1',
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  department: user.department,
  year: user.year,
  cgpa: user.cgpa || 0,
  backlogs: user.backlogs || 0,
  headline: user.headline || 'Student',
  image: user.image,
  personalInfo: {
    firstName: user.name ? user.name.split(' ')[0] : 'Student',
    lastName: user.name ? user.name.split(' ')[1] : '',
    email: user.email || 'student@example.com',
    phone: user.phone || '9999999999',
    avatar: user.image || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`,
    role: user.headline || 'Student'
  },
  academicInfo: {
    branch: user.department || 'Computer Science',
    cgpa: user.cgpa || 0,
    backlogs: user.backlogs || 0,
    rollNumber: user.rollNumber || '21B91A0501',
    batch: user.batch || 2025
  },
  skills: user.skills || [],
  profileCompletion: 70
});

// --- THUNK: Fetch Profile ---
export const fetchProfile = createAsyncThunk('profile/fetch', async () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = storedUser._id;

    if (!userId) {
      throw new Error('No logged in user found');
    }

    try {
      const response = await axios.get(`${API_URL}/profile/${userId}`);
      return buildFallbackProfile({ ...storedUser, ...response.data });
    } catch (error) {
      return buildFallbackProfile(storedUser);
    }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<StudentProfile>) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
        .addCase(fetchProfile.pending, (state) => { state.isLoading = true; })
        .addCase(fetchProfile.fulfilled, (state, action) => {
            state.isLoading = false;
            state.profile = action.payload;
        });
  }
});

export const { setProfile } = profileSlice.actions;
export default profileSlice.reducer;
