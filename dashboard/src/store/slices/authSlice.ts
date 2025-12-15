import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../api/services/AuthService';
import { getUserFromToken, userUtils } from '../../api/utils';
import type { AdminUser, AdminProfileResponse } from '../../api/types';

// Helper function to map AdminProfileResponse to AdminUser
const mapAdminProfileToUser = (profile: AdminProfileResponse): AdminUser => {
  return {
    admin_id: profile.admin_id,
    email: profile.email,
    name: profile.name,
    google_id: profile.google_id,
    phone: profile.phone,
    photo_url: profile.photo_url,
    is_active: profile.is_active,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    user_id: profile.admin_id, // For backward compatibility
  };
};

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Load token and user from localStorage on initialization
const initialToken = authService.getToken();
// Try to load full user data from localStorage first, fallback to token-derived data
const storedUser = userUtils.get();
const initialUser = storedUser || (initialToken ? getUserFromToken(initialToken) : null);

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,
  loading: false,
  error: null,
};

// Async thunk for email login
export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.loginWithEmail(email, password);
      // Fetch full admin profile from API
      const profile = await authService.getAdminProfile();
      const user = mapAdminProfileToUser(profile);
      return {
        token: response.access_token,
        user,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Async thunk for Google login
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authService.loginWithGoogle(token);
      // Fetch full admin profile from API
      const profile = await authService.getAdminProfile();
      const user = mapAdminProfileToUser(profile);
      return {
        token: response.access_token,
        user,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Google login failed');
    }
  }
);

// Async thunk for fetching admin profile
export const fetchAdminProfile = createAsyncThunk(
  'auth/fetchAdminProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await authService.getAdminProfile();
      return mapAdminProfileToUser(profile);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch admin profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      userUtils.remove();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setUser: (state, action: PayloadAction<AdminUser>) => {
      state.user = action.payload;
      // Store user data in localStorage
      userUtils.set(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    // Initialize auth state from stored token
    initializeAuth: (state) => {
      const token = authService.getToken();
      state.token = token;
      state.isAuthenticated = !!token;
    },
  },
  extraReducers: (builder) => {
    // Email login
    builder
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
        // Store user data in localStorage
        userUtils.set(action.payload.user);
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Google login
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
        // Store user data in localStorage
        userUtils.set(action.payload.user);
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Fetch admin profile
    builder
      .addCase(fetchAdminProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        // Store user data in localStorage
        userUtils.set(action.payload);
      })
      .addCase(fetchAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setUser, clearError, initializeAuth } = authSlice.actions;
export default authSlice.reducer;

