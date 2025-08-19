import { create } from 'zustand';
import { toast } from '../hooks/use-toast';

// Define the user type
interface User {
  id: string;
  username: string;
  role: 'admin' | 'registered' | 'unregistered';
  // Add other user properties as needed
}

// Define the store state
interface AuthState {
  authUser: User | null;
  isAdmin: boolean | null;
  isRegisteredUser: boolean | null;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  
  // Actions
  identifyAdmin: () => Promise<any>;
  identifyRegisteredUser: () => Promise<any>;
  checkAuth: () => Promise<void>;
  login: (credentials: { email: string; password: string }, userType: 'admin' | 'registered') => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;
}

const BASE_URL = 'http://localhost:8082';

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isAdmin: null,
  isRegisteredUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,

  identifyAdmin: async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/identifyAdmin`, {
        method: 'GET',
        credentials: 'include',
      });
      
      // Handle network errors
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // User is not authenticated
          set({ isAdmin: false });
          return { status: 'false' };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const isAdmin = result.status === 'true';
      set({ isAdmin });
      return result;
    } catch (error) {
      console.error('Error identifying admin:', error);
      // On network error, assume not admin
      set({ isAdmin: false });
      return { status: 'false' }; // Return a default object
    }
  },

  identifyRegisteredUser: async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/identifyRegisteredUser`, {
        method: 'GET',
        credentials: 'include',
      });
      
      // Handle network errors
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // User is not authenticated
          set({ isRegisteredUser: false });
          return { status: 'false' };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const isRegistered = result.status === 'true';
      set({ isRegisteredUser: isRegistered });
      return result;
    } catch (error) {
      console.error('Error identifying registered user:', error);
      // On network error, assume not registered
      set({ isRegisteredUser: false });
      return { status: 'false' };
    }
  },

  checkAuth: async () => {
    try {
      // First check if user is admin
      const isAdminResult = await get().identifyAdmin();
      if (isAdminResult.status === 'true') {
        // Use the admin ID from the response
        set({
          authUser: { id: isAdminResult.admin_user_id || 'admin-id-placeholder', username: 'admin', role: 'admin' },
          isAdmin: true,
          isRegisteredUser: false,
          isCheckingAuth: false
        });
        return;
      }
      
      // If not admin, check if registered user
      const isRegisteredResult = await get().identifyRegisteredUser();
      if (isRegisteredResult.status === 'true') {
        // Use the registered user ID from the response
        set({
          authUser: { id: isRegisteredResult.reg_user_id || 'registered-user-id-placeholder', username: 'Registered User', role: 'registered' },
          isAdmin: false,
          isRegisteredUser: true,
          isCheckingAuth: false
        });
        return;
      }
      
      // If neither admin nor registered user, treat as unregistered
      set({
        authUser: { id: 'unregistered', username: 'Guest', role: 'unregistered' },
        isAdmin: false,
        isRegisteredUser: false,
        isCheckingAuth: false
      });
    } catch (error) {
      console.error('Error checking auth:', error);
      set({
        authUser: { id: 'unregistered', username: 'Guest', role: 'unregistered' },
        isAdmin: false,
        isRegisteredUser: false,
        isCheckingAuth: false
      });
    }
  },

  login: async (credentials, userType) => {
    set({ isLoggingIn: true });
    try {
      let endpoint = '';
      if (userType === 'admin') {
        endpoint = '/auth/loginAdmin';
      } else if (userType === 'registered') {
        endpoint = '/auth/loginRegisteredUser';
      }
      
      const formData = new FormData();
      if (userType === 'admin') {
        formData.append('username', credentials.email);
        formData.append('password', credentials.password);
      } else {
        formData.append('email', credentials.email);
        formData.append('password', credentials.password);
      }
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (response.ok) {
        // Recheck authentication status
        await get().checkAuth();
        toast({
          title: "Login Successful",
          description: userType === 'admin' 
            ? "Welcome to the Admin Panel!" 
            : "Welcome back! You're now logged in."
        });
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: errorData.message || "Invalid credentials"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An error occurred during login"
      });
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        set({
          authUser: null,
          isAdmin: false,
          isRegisteredUser: false,
          isCheckingAuth: false
        });
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Logout Failed",
          description: "Could not log out properly"
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Logout Error",
        description: "An error occurred during logout"
      });
    } finally {
      set({ isLoggingOut: false });
    }
  },

  reset: () => {
    set({
      authUser: { id: 'unregistered', username: 'Guest', role: 'unregistered' },
      isAdmin: false,
      isRegisteredUser: false,
      isCheckingAuth: false
    });
  }
}));