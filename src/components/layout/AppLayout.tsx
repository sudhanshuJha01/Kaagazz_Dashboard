import { Outlet } from "react-router-dom";
import AdminHeader from "../Header"; // Use your existing Header

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#f8f5f2] font-sans">
      <AdminHeader />
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};
export default AppLayout;