
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Users, Calendar, BrainCircuit, Shield } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Nova Análise", url: "/nova-analise", icon: BrainCircuit },
  { title: "Partidas", url: "/partidas", icon: Calendar },
  { title: "Elenco", url: "/elenco", icon: Users },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-corinthians-dark text-corinthians-light">
      <aside className="w-64 bg-black border-r border-corinthians-gray p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-10 p-2">
           <Shield className="w-10 h-10 text-corinthians-light" />
          <div>
            <h2 className="font-bold text-lg text-corinthians-light">Corinthians AI</h2>
            <p className="text-xs text-corinthians-gold">Prediction System</p>
          </div>
        </div>
        
        <nav className="space-y-2 flex-grow">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active 
                    ? 'bg-corinthians-gray text-corinthians-light font-semibold' 
                    : 'text-gray-400 hover:bg-corinthians-gray/50 hover:text-corinthians-light'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-corinthians-gold' : ''}`} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
        <footer className="text-center p-4 text-xs text-gray-500">
          <p>Version 1.0.0</p>
          <p>&copy; 2024. All rights reserved.</p>
        </footer>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
