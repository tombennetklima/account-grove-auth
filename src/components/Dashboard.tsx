
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser, logout, User } from "@/services/authService";
import { getUserProfile } from "@/services/profileService";
import { LogOut, Shield, User as UserIcon, FileText, PieChart, BookOpen, Settings } from "lucide-react";
import AdminUserManager from "./AdminUserManager";
import ProfileForm from "./ProfileForm";
import StatusOverview from "./StatusOverview";
import Guide from "./Guide";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [profileSubmitted, setProfileSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "status" | "guide" | "admin">("profile");

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/");
      return;
    }
    
    setUser(currentUser);
    
    // Check if user has already submitted profile
    const checkProfileStatus = async () => {
      const profile = await getUserProfile(currentUser.id);
      setProfileSubmitted(profile?.isSubmitted || false);
    };
    
    checkProfileStatus();
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
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <header className="sticky top-0 z-10 glass-morphism py-4 px-6">
        <div className="container flex items-center justify-between mx-auto">
          <div className="flex items-center">
            <h1 className="text-xl font-medium">Betclever.de</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center mr-4">
              <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 hover:border-red-200"
            >
              <LogOut className="h-4 w-4 mr-2" /> Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 md:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-3 lg:col-span-2">
            <div className="glass-morphism p-4 sticky top-24 animate-fade-in">
              <nav className="space-y-2">
                <Button 
                  variant={activeTab === "profile" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("profile")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Mein Profil
                </Button>
                
                <Button 
                  variant={activeTab === "status" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("status")}
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  Statusübersicht
                </Button>
                
                <Button 
                  variant={activeTab === "guide" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("guide")}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Leitfaden
                </Button>
                
                {user.isAdmin && (
                  <>
                    <Separator className="my-2" />
                    <Button 
                      variant={activeTab === "admin" ? "default" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => {
                        setActiveTab("admin");
                        setShowAdminPanel(true);
                      }}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Administration
                    </Button>
                  </>
                )}
              </nav>
            </div>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-9 lg:col-span-10">
            <div className="glass-morphism p-6">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsContent value="profile" className="mt-0 pt-0">
                  <ProfileForm />
                </TabsContent>
                
                <TabsContent value="status" className="mt-0 pt-0">
                  <StatusOverview />
                </TabsContent>
                
                <TabsContent value="guide" className="mt-0 pt-0">
                  <Guide />
                </TabsContent>
                
                <TabsContent value="admin" className="mt-0 pt-0">
                  {user.isAdmin && showAdminPanel && <AdminUserManager />}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
