import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { loginWithEmail, loginWithGoogle, logout, clearError, setUser, fetchAdminProfile } from '../store/slices/authSlice';
import type { AdminUser } from '../api/types';

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector(selector);

// Auth hook
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  return {
    // State
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    
    // Actions
    loginWithEmail: (email: string, password: string) => 
      dispatch(loginWithEmail({ email, password })),
    loginWithGoogle: (token: string) => 
      dispatch(loginWithGoogle(token)),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
    setUser: (user: AdminUser) => dispatch(setUser(user)),
    fetchAdminProfile: () => dispatch(fetchAdminProfile()),
  };
};

