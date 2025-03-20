
import { toast } from "@/components/ui/use-toast";

// Types for profile data
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: Date | string;
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  isSubmitted?: boolean;
  status?: ProfileStatus;
  projectStatus?: ProjectStatus;
}

// Profile status
export type ProfileStatus = 
  | "incomplete" 
  | "submitted" 
  | "reviewing" 
  | "approved" 
  | "rejected";

// Project status
export type ProjectStatus = 
  | "contact" 
  | "preparation" 
  | "registration" 
  | "verification" 
  | "betting" 
  | "payout" 
  | "completed";

// Profile data with documents
export interface ProfileWithDocuments extends UserProfile {
  idDocuments: string[];
  cardDocuments: string[];
  bankDocuments: string[];
}

// Key for storing profiles in localStorage
const PROFILES_KEY = 'betclever_profiles';

// Get all profiles from localStorage
export const getAllProfiles = (): Record<string, UserProfile> => {
  const profilesData = localStorage.getItem(PROFILES_KEY);
  return profilesData ? JSON.parse(profilesData) : {};
};

// Save all profiles to localStorage
export const saveAllProfiles = (profiles: Record<string, UserProfile>) => {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

// Save user profile
export const saveUserProfile = async (userId: string, profileData: UserProfile): Promise<boolean> => {
  try {
    const profiles = getAllProfiles();
    
    // Update profile
    profiles[userId] = {
      ...profileData,
      // Convert Date object to string for storage
      birthDate: profileData.birthDate instanceof Date 
        ? profileData.birthDate.toISOString() 
        : profileData.birthDate,
    };
    
    saveAllProfiles(profiles);
    
    return true;
  } catch (error) {
    console.error("Save profile error:", error);
    toast({
      title: "Fehler beim Speichern",
      description: "Ihre Profildaten konnten nicht gespeichert werden.",
      variant: "destructive",
    });
    return false;
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const profiles = getAllProfiles();
    return profiles[userId] || null;
  } catch (error) {
    console.error("Get profile error:", error);
    return null;
  }
};

// Update profile submission status
export const updateProfileStatus = async (userId: string, status: ProfileStatus): Promise<boolean> => {
  try {
    const profiles = getAllProfiles();
    
    if (!profiles[userId]) {
      return false;
    }
    
    profiles[userId] = {
      ...profiles[userId],
      status,
      // If status is rejected, allow editing again
      isSubmitted: status !== "rejected"
    };
    
    saveAllProfiles(profiles);
    
    return true;
  } catch (error) {
    console.error("Update profile status error:", error);
    return false;
  }
};

// Update project status
export const updateProjectStatus = async (userId: string, projectStatus: ProjectStatus): Promise<boolean> => {
  try {
    const profiles = getAllProfiles();
    
    if (!profiles[userId]) {
      return false;
    }
    
    profiles[userId] = {
      ...profiles[userId],
      projectStatus
    };
    
    saveAllProfiles(profiles);
    
    return true;
  } catch (error) {
    console.error("Update project status error:", error);
    return false;
  }
};

// Upload document (simulated)
export const uploadDocument = async (userId: string, file: File): Promise<string> => {
  // In a real application, this would upload to a server/storage
  // For now, we'll simulate by converting to a data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // In a real app, this would return a URL to the uploaded file
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};

// Save documents (simulated for localStorage)
export const saveDocuments = async (
  userId: string,
  idDocs: File[],
  cardDocs: File[],
  bankDocs: File[]
): Promise<boolean> => {
  try {
    // In a real application, these would be stored in a database or file storage
    const idDocPromises = idDocs.map(doc => uploadDocument(userId, doc));
    const cardDocPromises = cardDocs.map(doc => uploadDocument(userId, doc));
    const bankDocPromises = bankDocs.map(doc => uploadDocument(userId, doc));
    
    const [idDocUrls, cardDocUrls, bankDocUrls] = await Promise.all([
      Promise.all(idDocPromises),
      Promise.all(cardDocPromises),
      Promise.all(bankDocPromises)
    ]);
    
    localStorage.setItem(`betclever_documents_${userId}`, JSON.stringify({
      idDocuments: idDocUrls,
      cardDocuments: cardDocUrls,
      bankDocuments: bankDocUrls,
    }));
    
    return true;
  } catch (error) {
    console.error("Save documents error:", error);
    return false;
  }
};

// Get documents for a user (simulated)
export const getUserDocuments = (userId: string) => {
  const docsData = localStorage.getItem(`betclever_documents_${userId}`);
  if (!docsData) return null;
  
  return JSON.parse(docsData);
};
