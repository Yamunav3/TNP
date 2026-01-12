import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'email';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  notifications: Notification[];
  unreadCount: number;
  activeModal: string | null;
  theme: 'light' | 'dark';
  globalSearch: string; // Correctly typed
}

const initialState: UIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  notifications: [],
  unreadCount: 0,
  activeModal: null,
  theme: 'light',
  globalSearch: '', // Only data here, no functions!
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    // Search Reducer
    setGlobalSearch: (state, action: PayloadAction<string>) => {
      state.globalSearch = action.payload;
    },
    // Notification Reducers
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    setActiveModal: (state, action: PayloadAction<string | null>) => {
      state.activeModal = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setGlobalSearch, // Exported once here
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  setActiveModal,
  setTheme,
} = uiSlice.actions;

export default uiSlice.reducer;