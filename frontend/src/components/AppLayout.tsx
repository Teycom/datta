import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, Settings, ShieldCheck, BarChart3, Cloud, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { firebaseAuth } from "app"; // For logout
import { toast } from "sonner";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: "Dashboard", href: "/DashboardPage", icon: Home },
  { name: "Campanhas", href: "/CampaignManagementPage", icon: ShieldCheck }, // Placeholder until page is created
  { name: "Config. Cloudflare", href: "/CloudflareConfigPage", icon: Cloud },
  { name: "Métricas", href: "/MetricsPage", icon: BarChart3 }, // Placeholder
  { name: "Configurações Gerais", href: "/SettingsPage", icon: Settings }, // Placeholder
];

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await firebaseAuth.signOut();
      toast.success("Logout realizado com sucesso!");
      navigate("/LoginPage"); // Redirect to login page after logout
    } catch (error) {
      console.error("Erro ao fazer logout: ", error);
      toast.error("Falha ao fazer logout. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900 text-gray-100">
      {/* Mobile Sidebar Toggle */} 
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white hover:bg-gray-700">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Sidebar */} 
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 shadow-lg transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:inset-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="p-5 border-b border-gray-700">
          <Link to="/DashboardPage" className="flex items-center space-x-2">
            {/* Replace with your logo if you have one */}
            <ShieldCheck className="h-10 w-10 text-cyan-400" />
            <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">PhantomShield</h1>
          </Link>
        </div>
        <nav className="mt-5 flex-grow">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsSidebarOpen(false)} // Close sidebar on mobile after click
              className={`flex items-center py-3 px-5 text-gray-300 hover:bg-cyan-600 hover:text-white transition-colors duration-200 rounded-md mx-2 my-1 ${location.pathname === item.href ? "bg-cyan-500 text-white shadow-lg" : ""}`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-5 mt-auto border-t border-gray-700">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full flex items-center justify-start text-red-400 hover:bg-red-500/20 hover:text-red-300 py-3 px-3"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content Area */} 
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto">
         {/* Padding top for mobile to account for fixed toggle button */}
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
