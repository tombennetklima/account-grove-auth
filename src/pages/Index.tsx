
import LoginForm from "@/components/LoginForm";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/services/authService";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const user = getCurrentUser();
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Betclever.de</h1>
        <p className="text-muted-foreground">Melden Sie sich an oder erstellen Sie einen Account</p>
      </div>
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
