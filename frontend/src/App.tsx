import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "next-themes";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "./store/useAuthStore";

import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Complaint from "./pages/Complaint";
import FAQ from "./pages/FAQ";
import Contacts from "./pages/Contacts";
import Profiles from "./pages/Profiles";
import AdminAuth from "./pages/AdminAuth";
import AdminHome from "./pages/AdminHome";
import AdminComplaint from "./pages/AdminComplaint";
import Logout from "./pages/Logout";
import NotFound from "./pages/NotFound";
import { RingLoader } from "react-spinners";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();


function App() {
  const {
    authUser,
    isAdmin,
    isRegisteredUser,
    isCheckingAuth,
    checkAuth
  } = useAuthStore();
  
  const [authCheckTimeout, setAuthCheckTimeout] = useState(false);

  useEffect(() => {
    checkAuth();
    
    // Set a timeout to prevent indefinite loading
    const timer = setTimeout(() => {
      setAuthCheckTimeout(true);
    }, 5000); // 5 seconds timeout
    
    // Set up periodic auth check every 15 minutes
    const interval = setInterval(() => {
      checkAuth();
    }, 15 * 60 * 1000); // 15 minutes
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [checkAuth]);

  // Show loading spinner while checking auth
  if (isCheckingAuth && !authCheckTimeout) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RingLoader
          color="#0de5be"
          loading={true}
          size={80}
          speedMultiplier={1}
        />
      </div>
    );
  }
  
  // If timeout occurred but still checking, set default state
  if (isCheckingAuth && authCheckTimeout) {
    // Reset to default state
    useAuthStore.getState().reset();
    // Return loading state one more time to allow state to update
    return (
      <div className="flex items-center justify-center h-screen">
        <RingLoader
          color="#0de5be"
          loading={true}
          size={80}
          speedMultiplier={1}
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Navbar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={!authUser || authUser.role === 'unregistered' ? <Auth /> : <Navigate to="/" />} />
                <Route path="/logout" element={authUser ? <Logout /> : <Navigate to="/auth" />} />
                <Route
                  path="/complaint"
                  element={
                    isCheckingAuth ?
                      <div className="flex items-center justify-center h-screen">
                        <RingLoader color="#0de5be" loading={true} size={60} />
                      </div> :
                    isRegisteredUser ?
                      <Complaint /> :
                      <Navigate to="/auth" replace />
                  }
                />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route
                  path="/profiles"
                  element={
                    isCheckingAuth ?
                      <div className="flex items-center justify-center h-screen">
                        <RingLoader color="#0de5be" loading={true} size={60} />
                      </div> :
                    isRegisteredUser ?
                      <Profiles /> :
                      <Navigate to="/auth" replace />
                  }
                />
                <Route path="/admin/auth" element={!isAdmin ? <AdminAuth /> : <Navigate to="/admin/home" />} />
                <Route path="/admin/home" element={isAdmin ? <AdminHome /> : <Navigate to="/admin/auth" />} />
                <Route path="/admin/complaint/:id" element={isAdmin ? <AdminComplaint /> : <Navigate to="/admin/auth" />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
