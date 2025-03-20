
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser, logout, User } from "@/services/authService";
import { LogOut, Shield, User as UserIcon } from "lucide-react";
import AdminPanel from "./AdminPanel";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/");
      return;
    }
    
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="glass-morphism sticky top-0 z-10 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold tracking-tight">Betclever.de Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center mr-4">
            <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="transition-all duration-200">
            <LogOut className="h-4 w-4 mr-2" /> Abmelden
          </Button>
        </div>
      </header>

      <main className="container py-10 px-4 md:px-6">
        <div className="glass-morphism p-8 rounded-lg shadow-sm mb-8 animate-slide-in-top">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Willkommen{user.isAdmin ? ", Administrator" : ""}</h2>
              <p className="text-muted-foreground mt-2">
                Ihr persönlicher Bereich bei Betclever.de
              </p>
            </div>
            {user.isAdmin && (
              <Button 
                onClick={() => setShowAdminPanel(!showAdminPanel)} 
                variant={showAdminPanel ? "default" : "outline"}
                className="transition-all duration-200"
              >
                <Shield className="h-4 w-4 mr-2" /> 
                {showAdminPanel ? "Admin-Panel ausblenden" : "Admin-Panel anzeigen"}
              </Button>
            )}
          </div>
          
          {user.isAdmin && showAdminPanel && (
            <div className="mt-8 animate-fade-in">
              <Separator className="my-4" />
              <h3 className="text-xl font-semibold mb-4">Admin-Bereich</h3>
              <AdminPanel />
            </div>
          )}
        </div>

        <div className="glass-morphism p-8 rounded-lg shadow-sm animate-slide-in-bottom">
          <h3 className="text-xl font-semibold mb-4">Dashboard-Inhalt</h3>
          <p className="text-muted-foreground">
            Dieser Bereich ist derzeit leer. Zukünftige Inhalte werden hier angezeigt.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
