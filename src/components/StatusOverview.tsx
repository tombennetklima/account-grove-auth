
import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '@/services/authService';
import { getUserProfile, UserProfile, ProjectStatus } from '@/services/profileService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const projectSteps: { id: ProjectStatus; label: string; description: string }[] = [
  { 
    id: 'contact', 
    label: 'Kontaktaufnahme', 
    description: 'Wir nehmen Kontakt mit Ihnen auf und besprechen Ihre Anfrage.' 
  },
  { 
    id: 'preparation', 
    label: 'Vorbereitung', 
    description: 'Wir bereiten alles für Sie vor und erstellen einen individuellen Plan.' 
  },
  { 
    id: 'registration', 
    label: 'Registrierung', 
    description: 'Wir registrieren die erforderlichen Konten für Sie.' 
  },
  { 
    id: 'verification', 
    label: 'Verifizierung', 
    description: 'Wir verifizieren Ihre Konten und stellen sicher, dass alles funktioniert.' 
  },
  { 
    id: 'betting', 
    label: 'Wetten', 
    description: 'Wir platzieren die Wetten gemäß dem erstellten Plan.' 
  },
  { 
    id: 'payout', 
    label: 'Auszahlung', 
    description: 'Wir veranlassen die Auszahlung Ihrer Gewinne.' 
  },
  { 
    id: 'completed', 
    label: 'Abgeschlossen', 
    description: 'Ihr Projekt ist abgeschlossen und alle Gewinne wurden ausgezahlt.' 
  }
];

const StatusOverview: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentStep, setCurrentStep] = useState<ProjectStatus>('contact');

  useEffect(() => {
    const loadProfile = async () => {
      const user = getCurrentUser();
      if (user) {
        const userProfile = await getUserProfile(user.id);
        if (userProfile) {
          setProfile(userProfile);
          setCurrentStep(userProfile.projectStatus || 'contact');
        }
      }
    };

    loadProfile();
  }, []);

  const getStepStatus = (stepId: ProjectStatus) => {
    const stepIndex = projectSteps.findIndex(step => step.id === stepId);
    const currentIndex = projectSteps.findIndex(step => step.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  if (!profile) {
    return <div className="flex justify-center py-8">Lädt Statusübersicht...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-medium">Projektstatus</h2>
      
      <Card className="glass-morphism overflow-hidden">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-lg font-medium">Aktueller Status: {projectSteps.find(step => step.id === currentStep)?.label}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-8">
            {projectSteps.map((step, index) => {
              const status = getStepStatus(step.id);
              
              return (
                <div key={step.id} className="relative">
                  {/* Connector line */}
                  {index < projectSteps.length - 1 && (
                    <div 
                      className={cn(
                        "absolute top-7 left-3.5 w-0.5 h-[calc(100%+1rem)] -translate-x-1/2",
                        status === 'completed' ? "bg-primary" : "bg-gray-200"
                      )}
                    />
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
                      status === 'completed' ? "bg-primary text-white" :
                      status === 'current' ? "border-2 border-primary bg-white text-primary" :
                      "border-2 border-gray-200 bg-white text-gray-300"
                    )}>
                      {status === 'completed' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : status === 'current' ? (
                        <Circle className="h-5 w-5 animate-pulse" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className={cn(
                      "flex-1 transition-all duration-200",
                      status === 'completed' ? "opacity-90" : 
                      status === 'current' ? "opacity-100" : 
                      "opacity-60"
                    )}>
                      <h3 className={cn(
                        "font-medium mb-1",
                        status === 'current' && "text-primary"
                      )}>
                        {step.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusOverview;
