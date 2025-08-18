import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
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
import NotFound from "./pages/NotFound";
import { RingLoader } from "react-spinners";

const queryClient = new QueryClient();

function App() {
  const {
    authUser,
    isAdmin,
    isRegisteredUser,
    isCheckingAuth,
    checkAuth
  } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading spinner while checking auth
  if (isCheckingAuth) {
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={!authUser || authUser.role === 'unregistered' ? <Auth /> : <Navigate to="/" />} />
            <Route path="/complaint" element={isRegisteredUser ? <Complaint /> : <Navigate to="/auth" />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/profiles" element={isRegisteredUser ? <Profiles /> : <Navigate to="/auth" />} />
            <Route path="/admin/auth" element={!isAdmin ? <AdminAuth /> : <Navigate to="/admin/home" />} />
            <Route path="/admin/home" element={isAdmin ? <AdminHome /> : <Navigate to="/admin/auth" />} />
            <Route path="/admin/complaint/:id" element={isAdmin ? <AdminComplaint /> : <Navigate to="/admin/auth" />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
