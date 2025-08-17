//This file is use to create a Zustand store for managing authentication state in a React application.

import {create} from 'zustand';
import {axiosUsers} from '../lib/axios.js'; // Import the axios instance for API calls
import { useToast } from '../hooks/use-toast';

export const useAuth = create((set/*,get*/) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,


    checkAuth: async () => {
        try {
        const res = await axiosUsers.get("/auth/check");

        set({ authUser: res.data });
        // get().connectSocket();
        } catch (error) {
        console.log("Error in checkAuth:", error);
        set({ authUser: null });
        } finally {
        set({ isCheckingAuth: false });
        }
    },

    signUp : async (data) => {
        set({isSigningUp: true});
        try {
            console.log('Signing up with data:', data);
            const res = await axiosUsers.post('/auth/signup', data);
            // console.log('Sign up response:', res.data);
            set({authUser: res.data});
            toast.success("Account created successfully");
            // get().connectSocket();
        } catch (error) {
            console.error('Error in signUp:', error);
            toast.error(error.response?.data?.message || "Failed to sign up");
        } finally {
            set({isSigningUp: false});
        }
    },
    
    logout : async () => {
        try {
            await axiosUsers.post('/auth/logout');
            set({authUser: null});
            toast.success("Logged out successfully");
        } catch (error) {
            console.error('Error in logout:', error);
            toast.error(error.response?.data?.message || "Failed to log out");
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
        const res = await axiosUsers.post("/auth/login", data);
        set({ authUser: res.data });
        toast.success("Logged in successfully");

        console.log("Before websocket connection");
        // get().connectSocket();// It is use to connect the socket after login
            /* This web socket is use to maintain 2 way communication between
            client and server, in normal http request/response model, 
            the connection is closed after the response is received. */
        console.log("After websocket connection");
        } catch (error) {
        console.error("Error in login:", error);
        toast.error(error.response.data.message);
        } finally {
        set({ isLoggingIn: false });
        }
  },

    updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosUsers.put("/auth/profile-update", data);
      console.log("Profile updated successfully:", res.data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");

    //   console.log("profile updated successfully:", res.data);
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

//     connectSocket: () => {
//     const { authUser } = get();
//     if (!authUser || get().socket?.connected) return;

//     const socket = io(BASE_URL, {
//       query: {
//         userId: authUser._id,
//       },
//     });
//     socket.connect();

//     set({ socket: socket });

//     socket.on("getOnlineUsers", (userIds) => {
//       set({ onlineUsers: userIds });
//     });
//   },
//   disconnectSocket: () => {
//     if (get().socket?.connected) get().socket.disconnect();
//   },
}));