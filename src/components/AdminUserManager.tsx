
import React, { useState, useEffect } from "react";
import { getUsersFromStorage, UserDetails, updateUserPassword, deleteUser } from "@/services/authService";
import { getUserProfile, getAllProfiles, updateProfileStatus } from "@/services/profileService";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, User, Mail, Key, Trash, Check, X, FileText, RefreshCw } from "lucide-react";

const AdminUserManager = () => {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  // Load users from storage
  useEffect(() => {
    const loadUsers = () => {
      const usersData = getUsersFromStorage();
      setUsers(usersData);
      
      // Load profiles
      const profilesData = getAllProfiles();
      setProfiles(profilesData);
    };
    
    loadUsers();

    // Refresh data every 5 seconds
    const interval = setInterval(loadUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle password change
  const handlePasswordChange = (userId: string) => {
    if (newPassword.length < 8) {
      toast({
        title: "Passwort zu kurz",
        description: "Das Passwort muss mindestens 8 Zeichen lang sein.",
        variant: "destructive",
      });
      return;
    }
    
    const success = updateUserPassword(userId, newPassword);
    if (success) {
      setNewPassword("");
      toast({
        title: "Passwort geändert",
        description: "Das Passwort wurde erfolgreich geändert.",
      });
      
      // Refresh user list
      setUsers(getUsersFromStorage());
    }
  };

  // Handle user deletion
  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Sind Sie sicher, dass Sie diesen Account löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.")) {
      const success = deleteUser(userId);
      if (success) {
        toast({
          title: "Account gelöscht",
          description: "Der Account wurde erfolgreich gelöscht.",
        });
        
        // Refresh user list
        setUsers(getUsersFromStorage());
      }
    }
  };

  // Toggle profile status (approved/needs changes)
  const handleToggleProfileStatus = async (userId: string, currentStatus: boolean) => {
    const success = await updateProfileStatus(userId, !currentStatus);
    if (success) {
      // Refresh profiles
      const profilesData = getAllProfiles();
      setProfiles(profilesData);
      
      toast({
        title: currentStatus ? "Freigabe zurückgezogen" : "Profil freigegeben",
        description: currentStatus 
          ? "Der Nutzer kann seine Daten jetzt wieder bearbeiten." 
          : "Das Profil wurde freigegeben.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Benutzerverwaltung</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className={selectedUser === user.id ? "border-primary" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {user.isAdmin ? "Admin" : "Benutzer"}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Account erstellt:</Label>
                  <span className="text-sm">{new Date(user.createdAt).toLocaleDateString('de-DE')}</span>
                </div>
                
                {profiles[user.id] && (
                  <div className="flex justify-between items-center">
                    <Label>Profil-Status:</Label>
                    <span className={`text-sm ${profiles[user.id].isSubmitted ? "text-green-500" : "text-yellow-500"}`}>
                      {profiles[user.id].isSubmitted ? "Eingereicht" : "Nicht vollständig"}
                    </span>
                  </div>
                )}
              </div>
              
              {selectedUser === user.id && (
                <div className="mt-4 space-y-4">
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor={`password-${user.id}`}>Neues Passwort</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={`password-${user.id}`}
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePasswordChange(user.id)}
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Ändern
                      </Button>
                    </div>
                  </div>
                  
                  {profiles[user.id] && profiles[user.id].isSubmitted && (
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleToggleProfileStatus(user.id, profiles[user.id].isSubmitted)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Erneute Bearbeitung erlauben
                      </Button>
                    </div>
                  )}
                  
                  {!user.isAdmin && (
                    <div className="pt-2">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Account löschen
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {profiles[user.id] && (
                <div className="mt-4">
                  <Separator className="my-3" />
                  <div className="flex flex-col gap-2">
                    <h4 className="font-medium text-sm">Persönliche Daten:</h4>
                    {profiles[user.id].firstName && (
                      <div className="text-sm">
                        Name: {profiles[user.id].firstName} {profiles[user.id].lastName}
                      </div>
                    )}
                    {profiles[user.id].phone && (
                      <div className="text-sm">
                        Telefon: {profiles[user.id].phone}
                      </div>
                    )}
                    {profiles[user.id].birthDate && (
                      <div className="text-sm">
                        Geburtsdatum: {new Date(profiles[user.id].birthDate).toLocaleDateString('de-DE')}
                      </div>
                    )}
                    {profiles[user.id].street && (
                      <div className="text-sm">
                        Adresse: {profiles[user.id].street} {profiles[user.id].houseNumber}, {profiles[user.id].zipCode} {profiles[user.id].city}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
              >
                {selectedUser === user.id ? "Details ausblenden" : "Details anzeigen"}
              </Button>
              
              {profiles[user.id] && !profiles[user.id].isSubmitted && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-500"
                  onClick={() => handleToggleProfileStatus(user.id, profiles[user.id].isSubmitted)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Freigeben
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Keine Benutzer gefunden.</p>
        </div>
      )}
    </div>
  );
};

export default AdminUserManager;
