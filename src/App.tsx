import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import PostPage from "./pages/PostPage";
import ProfessionalsHub from "./pages/ProfessionalsHub";
import MainLayout from "./components/templates/MainLayout";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import Training from "./pages/Training.tsx";
import Nutrition from "./pages/Nutrition";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/index" element={<MainLayout><Index /></MainLayout>} />
          <Route path="/profile/:id" element={<MainLayout><Profile /></MainLayout>} />
          <Route path="/post/:id" element={<MainLayout><PostPage /></MainLayout>} />
          <Route path="/hub" element={<MainLayout><ProfessionalsHub /></MainLayout>} />
          <Route path="/profissional/:id" element={<MainLayout><ProfessionalProfile /></MainLayout>} />
          <Route path="/training" element={<MainLayout><Training /></MainLayout>} />
          <Route path="/nutrition" element={<MainLayout><Nutrition /></MainLayout>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;