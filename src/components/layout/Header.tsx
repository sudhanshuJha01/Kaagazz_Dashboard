import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, ClipboardList, Users, LayoutDashboard } from "lucide-react";

const AdminHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/products", label: "Products", icon: Package },
    { href: "/orders", label: "Orders", icon: ClipboardList },
    { href: "/customers", label: "Customers", icon: Users },
  ];

  return (
    <header className="fixed top-0 left-0 w-full py-2 px-8 md:px-16 flex justify-between items-center bg-[url('/bg3.png')] bg-cover bg-center bg-no-repeat z-50 border-b border-gray-200">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center py-2">
          <img src="/admin-logo.png" alt="Admin Logo" className="h-8 max-w-40" />
        </Link>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden lg:flex items-center space-x-10 relative">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="text-sm text-[#3d3121] hover:text-green-700 transition-colors flex items-center gap-2"
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Mobile Nav Toggle */}
      <div className="lg:hidden">
        <button className="p-3" onClick={toggleMobileMenu}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div className={`absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-md lg:hidden z-50 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"}`}>
        <div className="flex flex-col p-4 space-y-4">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} className="text-[#3d3121]" onClick={toggleMobileMenu}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;