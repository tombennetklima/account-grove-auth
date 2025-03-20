
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

// Document data structure
export interface DocumentData {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  dataUrl: string;
}

// Document collection
export interface UserDocuments {
  idDocuments: DocumentData[];
  cardDocuments: DocumentData[];
  bankDocuments: DocumentData[];
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
  documents: UserDocuments;
}

// Key for storing profiles in localStorage
const PROFILES_KEY = 'betclever_profiles';
const DOCUMENTS_KEY = 'betclever_documents';

// Get all profiles from localStorage
export const getAllProfiles = (): Record<string, UserProfile> => {
  const profilesData = localStorage.getItem(PROFILES_KEY);
  return profilesData ? JSON.parse(profilesData) : {};
};

// Save all profiles to localStorage
export const saveAllProfiles = (profiles: Record<string, UserProfile>) => {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

// Get all documents from localStorage
export const getAllDocuments = (): Record<string, UserDocuments> => {
  const documentsData = localStorage.getItem(DOCUMENTS_KEY);
  return documentsData ? JSON.parse(documentsData) : {};
};

// Save all documents to localStorage
export const saveAllDocuments = (documents: Record<string, UserDocuments>) => {
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
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

// Process file into document data
const processFileToDocumentData = async (file: File): Promise<DocumentData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        dataUrl: reader.result as string
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Save documents with proper metadata
export const saveDocuments = async (
  userId: string,
  idDocs: File[],
  cardDocs: File[],
  bankDocs: File[]
): Promise<boolean> => {
  try {
    // Create document data with metadata for each file
    const idDocPromises = idDocs.map(doc => processFileToDocumentData(doc));
    const cardDocPromises = cardDocs.map(doc => processFileToDocumentData(doc));
    const bankDocPromises = bankDocs.map(doc => processFileToDocumentData(doc));
    
    const [idDocData, cardDocData, bankDocData] = await Promise.all([
      Promise.all(idDocPromises),
      Promise.all(cardDocPromises),
      Promise.all(bankDocPromises)
    ]);
    
    // Get existing documents or create empty collection
    const allDocuments = getAllDocuments();
    
    // Update documents for this user
    allDocuments[userId] = {
      idDocuments: idDocData,
      cardDocuments: cardDocData,
      bankDocuments: bankDocData
    };
    
    // Save to localStorage
    saveAllDocuments(allDocuments);
    
    return true;
  } catch (error) {
    console.error("Save documents error:", error);
    return false;
  }
};

// Get documents for a user
export const getUserDocuments = (userId: string): UserDocuments | null => {
  try {
    const allDocuments = getAllDocuments();
    return allDocuments[userId] || null;
  } catch (error) {
    console.error("Get documents error:", error);
    return null;
  }
};

// Delete a document from a specific collection
export const deleteDocument = async (
  userId: string, 
  documentType: 'idDocuments' | 'cardDocuments' | 'bankDocuments',
  documentIndex: number
): Promise<boolean> => {
  try {
    const allDocuments = getAllDocuments();
    
    if (!allDocuments[userId] || !allDocuments[userId][documentType]) {
      return false;
    }
    
    // Remove the document at the specified index
    allDocuments[userId][documentType].splice(documentIndex, 1);
    
    // Save updated documents
    saveAllDocuments(allDocuments);
    
    return true;
  } catch (error) {
    console.error("Delete document error:", error);
    return false;
  }
};
