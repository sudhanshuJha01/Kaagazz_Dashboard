import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import AllProducts from "./pages/AllProducts";
import AdminOrders from "./pages/AdminOrders";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails"; // IMPORT
import UploadProduct from "./pages/UploadProduct";
import EditProduct from "./pages/EditProduct";
import { Toaster as Sonner } from "sonner";

const App = () => (
  <>
    <Sonner richColors position="top-right" />
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetails />} /> {/* ADDED ROUTE */}
          <Route path="/upload" element={<UploadProduct />} />
          <Route path="/products/edit/:id" element={<EditProduct />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </>
);
export default App;