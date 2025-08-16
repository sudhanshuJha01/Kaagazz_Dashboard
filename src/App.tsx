import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminHeader from "./components/Header"; // Admin header component
import AdminOrders from "./pages/AdminOrders";
import AllProducts from "./pages/AllProducts"; // All products page
import EditProduct from "./pages/EditProduct"; // Edit product page
import UploadProduct from "./pages/UploadProduct"; // Upload product page
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminHeader />} />
          <Route path ="/orders" element={<AdminOrders />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/admin/edit/:id" element={<EditProduct />} />
          <Route path="/admin/upload" element={<UploadProduct />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
