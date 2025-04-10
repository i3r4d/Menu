
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Index from "./pages/Index";
import TypePage from "./pages/TypePage";
import CategoryPage from "./pages/CategoryPage";
import FlavorDetailPage from "./pages/FlavorDetailPage";
import NewFlavorsPage from "./pages/NewFlavorsPage";
import DealsPage from "./pages/DealsPage";
import SearchPage from "./pages/SearchPage";
import FavoritesPage from "./pages/FavoritesPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFlavorForm from "./pages/admin/AdminFlavorForm";
import AdminLineOfMonth from "./pages/admin/AdminLineOfMonth";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/type/:type" element={<TypePage />} />
              <Route path="/type/:type/category/:category" element={<CategoryPage />} />
              <Route path="/flavor/:id" element={<FlavorDetailPage />} />
              <Route path="/new" element={<NewFlavorsPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin-portal" element={<AdminLoginPage />} />
              <Route path="/admin-portal/dashboard" element={<AdminDashboard />} />
              <Route path="/admin-portal/flavors/add" element={<AdminFlavorForm />} />
              <Route path="/admin-portal/flavors/edit/:id" element={<AdminFlavorForm />} />
              <Route path="/admin-portal/line-of-month" element={<AdminLineOfMonth />} />
              <Route path="/admin-portal/settings" element={<AdminSettings />} />
              
              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </FavoritesProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
