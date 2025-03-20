
import { toast } from "@/components/ui/use-toast";

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface UserDetails {
  id: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: string;
}

// Simulating a database with localStorage
const USERS_KEY = 'betclever_users';

export const getUsersFromStorage = (): UserDetails[] => {
  const usersData = localStorage.getItem(USERS_KEY);
  const users = usersData ? JSON.parse(usersData) : [];
  
  // Initialize with admin if storage is empty
  if (!usersData || users.length === 0) {
    const adminUser = {
      id: '1',
      email: 'admin@betclever.de',
      password: 'Ver4Wittert!Ver4Wittert!',
      isAdmin: true,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(USERS_KEY, JSON.stringify([adminUser]));
    return [adminUser];
  }
  
  return users;
};

export const saveUsersToStorage = (users: UserDetails[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Authentication functions
export const login = (email: string, password: string): User | null => {
  try {
    const users = getUsersFromStorage();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!user) {
      toast({
        title: "Login fehlgeschlagen",
        description: "E-Mail oder Passwort ist falsch.",
        variant: "destructive",
      });
      return null;
    }
    
    // Create session
    const sessionUser: User = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    };
    
    localStorage.setItem('betclever_currentUser', JSON.stringify(sessionUser));
    
    toast({
      title: "Erfolgreich angemeldet",
      description: `Willkommen zurück, ${user.email}!`,
    });
    
    return sessionUser;
  } catch (error) {
    console.error("Login error:", error);
    toast({
      title: "Ein Fehler ist aufgetreten",
      description: "Bitte versuchen Sie es später erneut.",
      variant: "destructive",
    });
    return null;
  }
};

export const register = (email: string, password: string, agbAccepted: boolean): User | null => {
  try {
    if (!agbAccepted) {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: "Sie müssen die AGBs akzeptieren, um sich zu registrieren.",
        variant: "destructive",
      });
      return null;
    }
    
    const users = getUsersFromStorage();
    
    // Check if user already exists
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: "Diese E-Mail-Adresse ist bereits registriert.",
        variant: "destructive",
      });
      return null;
    }
    
    // Create new user
    const newUser: UserDetails = {
      id: Date.now().toString(),
      email,
      password,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsersToStorage(users);
    
    // Create session
    const sessionUser: User = {
      id: newUser.id,
      email: newUser.email,
      isAdmin: newUser.isAdmin
    };
    
    localStorage.setItem('betclever_currentUser', JSON.stringify(sessionUser));
    
    toast({
      title: "Registrierung erfolgreich",
      description: "Ihr Account wurde erfolgreich erstellt.",
    });
    
    return sessionUser;
  } catch (error) {
    console.error("Registration error:", error);
    toast({
      title: "Ein Fehler ist aufgetreten",
      description: "Bitte versuchen Sie es später erneut.",
      variant: "destructive",
    });
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem('betclever_currentUser');
  toast({
    title: "Abgemeldet",
    description: "Sie wurden erfolgreich abgemeldet.",
  });
};

export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem('betclever_currentUser');
  return userData ? JSON.parse(userData) : null;
};

export const updateUserPassword = (userId: string, newPassword: string): boolean => {
  try {
    const users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return false;
    
    users[userIndex].password = newPassword;
    saveUsersToStorage(users);
    
    toast({
      title: "Passwort aktualisiert",
      description: "Das Passwort wurde erfolgreich aktualisiert.",
    });
    
    return true;
  } catch (error) {
    console.error("Update password error:", error);
    toast({
      title: "Ein Fehler ist aufgetreten",
      description: "Das Passwort konnte nicht aktualisiert werden.",
      variant: "destructive",
    });
    return false;
  }
};

export const deleteUser = (userId: string): boolean => {
  try {
    const users = getUsersFromStorage();
    const filteredUsers = users.filter(user => user.id !== userId);
    
    if (filteredUsers.length === users.length) return false;
    
    saveUsersToStorage(filteredUsers);
    
    toast({
      title: "Account gelöscht",
      description: "Der Account wurde erfolgreich gelöscht.",
    });
    
    return true;
  } catch (error) {
    console.error("Delete user error:", error);
    toast({
      title: "Ein Fehler ist aufgetreten",
      description: "Der Account konnte nicht gelöscht werden.",
      variant: "destructive",
    });
    return false;
  }
};
