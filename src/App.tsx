import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Companies from "@/pages/Companies";
import CompanyDetail from "@/pages/CompanyDetail";
import CompanySkills from "@/pages/CompanySkills";
import CompanyProcess from "@/pages/CompanyProcess";
import CompanyInnovX from "@/pages/CompanyInnovX";
import HiringSkillSets from "@/pages/HiringSkillSets";
import HiringProcess from "@/pages/HiringProcess";
import InnovX from "@/pages/InnovX";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:companyId" element={<CompanyDetail />} />
              <Route path="/companies/:companyId/skills" element={<CompanySkills />} />
              <Route path="/companies/:companyId/process" element={<CompanyProcess />} />
              <Route path="/companies/:companyId/innovx" element={<CompanyInnovX />} />
              <Route path="/hiring-skillsets" element={<HiringSkillSets />} />
              <Route path="/hiring-process" element={<HiringProcess />} />
              <Route path="/innovx" element={<InnovX />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
