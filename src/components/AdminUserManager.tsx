import React, { useState, useEffect } from "react";
import { getUsersFromStorage, UserDetails, updateUserPassword, deleteUser } from "@/services/authService";
import { 
  getUserProfile, 
  getAllProfiles, 
  updateProfileStatus, 
  updateProjectStatus,
  getUserDocuments,
  ProfileStatus,
  ProjectStatus,
  DocumentData,
  UserDocuments,
  deleteDocument
} from "@/services/profileService";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Key, 
  Trash, 
  CheckCircle, 
  X, 
  FileText, 
  RefreshCw,
  Calendar,
  MapPin,
  Phone,
  Download,
  AlertCircle,
  Clock,
  Image,
  FileImage,
  File
} from "lucide-react";

const AdminUserManager = () => {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [documents, setDocuments] = useState<Record<string, UserDocuments>>({});
  const [activeTab, setActiveTab] = useState<"users" | "verification">("users");
  const [previewDocument, setPreviewDocument] = useState<{ url: string; type: string; name: string } | null>(null);

  // Load users from storage
  useEffect(() => {
    const loadData = () => {
      const usersData = getUsersFromStorage();
      setUsers(usersData);
      
      // Load profiles
      const profilesData = getAllProfiles();
      setProfiles(profilesData);
      
      // Load documents for each user
      const docs: Record<string, UserDocuments> = {};
      usersData.forEach(user => {
        const userDocs = getUserDocuments(user.id);
        if (userDocs) {
          docs[user.id] = userDocs;
        }
      });
      setDocuments(docs);
    };
    
    loadData();

    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000);
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
  const handleUpdateProfileStatus = async (userId: string, status: ProfileStatus) => {
    const success = await updateProfileStatus(userId, status);
    if (success) {
      // Refresh profiles
      const profilesData = getAllProfiles();
      setProfiles(profilesData);
      
      const statusMessages = {
        approved: "Profil bestätigt",
        rejected: "Profil zur Bearbeitung freigegeben",
        reviewing: "Profil wird überprüft",
        submitted: "Profil als eingereicht markiert",
        incomplete: "Profil als unvollständig markiert"
      };
      
      toast({
        title: statusMessages[status],
        description: "Der Status wurde erfolgreich aktualisiert.",
      });
    }
  };

  // Update project status
  const handleUpdateProjectStatus = async (userId: string, status: ProjectStatus) => {
    const success = await updateProjectStatus(userId, status);
    if (success) {
      // Refresh profiles
      const profilesData = getAllProfiles();
      setProfiles(profilesData);
      
      toast({
        title: "Projektstatus aktualisiert",
        description: "Der Projektstatus wurde erfolgreich aktualisiert.",
      });
    }
  };

  // Preview a document
  const handlePreviewDocument = (document: DocumentData) => {
    setPreviewDocument({
      url: document.dataUrl,
      type: document.fileType,
      name: document.fileName
    });
  };

  // Close document preview
  const closePreview = () => {
    setPreviewDocument(null);
  };

  // Download a document
  const handleDownloadDocument = (document: DocumentData) => {
    const link = document.createElement('a');
    link.href = document.dataUrl;
    link.download = document.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete a document
  const handleDeleteDocument = async (
    userId: string, 
    documentType: 'idDocuments' | 'cardDocuments' | 'bankDocuments',
    documentIndex: number
  ) => {
    if (window.confirm("Möchten Sie dieses Dokument wirklich löschen?")) {
      const success = await deleteDocument(userId, documentType, documentIndex);
      
      if (success) {
        // Refresh documents
        const userDocs = getUserDocuments(userId);
        if (userDocs) {
          setDocuments(prev => ({
            ...prev,
            [userId]: userDocs
          }));
        }
        
        toast({
          title: "Dokument gelöscht",
          description: "Das Dokument wurde erfolgreich gelöscht.",
        });
      } else {
        toast({
          title: "Fehler beim Löschen",
          description: "Das Dokument konnte nicht gelöscht werden.",
          variant: "destructive",
        });
      }
    }
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FileImage className="h-4 w-4" />;
    } else if (fileType === 'application/pdf') {
      return <File className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get document cards
  const getDocumentCards = (userId: string) => {
    if (!documents[userId]) return null;
    
    const renderDocumentList = (
      docs: DocumentData[], 
      title: string, 
      type: 'idDocuments' | 'cardDocuments' | 'bankDocuments'
    ) => {
      if (!docs.length) return null;
      
      return (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">{title}</h4>
          <div className="grid gap-2">
            {docs.map((doc, idx) => (
              <Card key={idx} className="bg-white/70 p-0 overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 p-3">
                  <div className="flex items-center justify-center bg-primary/10 w-10 h-10 rounded">
                    {getFileIcon(doc.fileType)}
                  </div>
                  
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.fileSize)} • {new Date(doc.uploadDate).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => handlePreviewDocument(doc)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive" 
                      onClick={() => handleDeleteDocument(userId, type, idx)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    };
    
    return (
      <div className="space-y-4 mt-4">
        <Separator />
        <h3 className="font-medium">Dokumente</h3>
        
        {renderDocumentList(documents[userId].idDocuments, "Ausweisdokumente", "idDocuments")}
        {renderDocumentList(documents[userId].cardDocuments, "Zahlungskarten", "cardDocuments")}
        {renderDocumentList(documents[userId].bankDocuments, "Bankdokumente", "bankDocuments")}
        
        {(!documents[userId].idDocuments.length && 
          !documents[userId].cardDocuments.length && 
          !documents[userId].bankDocuments.length) && (
          <p className="text-sm text-muted-foreground py-2">Keine Dokumente vorhanden.</p>
        )}
      </div>
    );
  };

  // Get status badge component
  const getStatusBadge = (status?: ProfileStatus) => {
    if (!status) return null;
    
    const statusConfig = {
      incomplete: { icon: AlertCircle, color: "bg-yellow-500/10 text-yellow-500", label: "Nicht vollständig" },
      submitted: { icon: Clock, color: "bg-blue-500/10 text-blue-500", label: "Eingereicht" },
      reviewing: { icon: Clock, color: "bg-purple-500/10 text-purple-500", label: "Wird überprüft" },
      approved: { icon: CheckCircle, color: "bg-green-500/10 text-green-500", label: "Bestätigt" },
      rejected: { icon: X, color: "bg-red-500/10 text-red-500", label: "Abgelehnt" }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </div>
    );
  };

  const pendingVerificationUsers = users.filter(user => 
    profiles[user.id] && 
    (profiles[user.id].status === "submitted" || profiles[user.id].status === "reviewing")
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="users" onValueChange={(value) => setActiveTab(value as "users" | "verification")}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-white/50">
            <TabsTrigger value="users" className="data-[state=active]:bg-white">
              Alle Nutzer ({users.length})
            </TabsTrigger>
            <TabsTrigger value="verification" className="data-[state=active]:bg-white">
              Verifizierungen ({pendingVerificationUsers.length})
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="users" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <Card key={user.id} className={`glass-morphism transition-all duration-200 ${selectedUser === user.id ? "border-primary shadow-md" : "hover:shadow-sm"}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {user.isAdmin ? "Admin" : "Benutzer"}
                    </div>
                    {profiles[user.id]?.status && getStatusBadge(profiles[user.id].status)}
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
                    
                    {profiles[user.id] && profiles[user.id].projectStatus && (
                      <div className="flex justify-between items-center">
                        <Label>Projektstatus:</Label>
                        <span className="text-sm font-medium text-primary">
                          {profiles[user.id].projectStatus === 'contact' && 'Kontaktaufnahme'}
                          {profiles[user.id].projectStatus === 'preparation' && 'Vorbereitung'}
                          {profiles[user.id].projectStatus === 'registration' && 'Registrierung'}
                          {profiles[user.id].projectStatus === 'verification' && 'Verifizierung'}
                          {profiles[user.id].projectStatus === 'betting' && 'Wetten'}
                          {profiles[user.id].projectStatus === 'payout' && 'Auszahlung'}
                          {profiles[user.id].projectStatus === 'completed' && 'Abgeschlossen'}
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
                              className="pr-10 bg-white/50"
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
                      
                      {profiles[user.id] && (
                        <>
                          <div className="space-y-2">
                            <Label>Profilstatus ändern</Label>
                            <Select 
                              onValueChange={(value) => handleUpdateProfileStatus(user.id, value as ProfileStatus)}
                              defaultValue={profiles[user.id].status || "incomplete"}
                            >
                              <SelectTrigger className="bg-white/50">
                                <SelectValue placeholder="Status auswählen" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="incomplete">Nicht vollständig</SelectItem>
                                <SelectItem value="submitted">Eingereicht</SelectItem>
                                <SelectItem value="reviewing">Wird überprüft</SelectItem>
                                <SelectItem value="approved">Bestätigt</SelectItem>
                                <SelectItem value="rejected">Abgelehnt (Bearbeitung erlauben)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Projektstatus ändern</Label>
                            <Select 
                              onValueChange={(value) => handleUpdateProjectStatus(user.id, value as ProjectStatus)}
                              defaultValue={profiles[user.id].projectStatus || "contact"}
                            >
                              <SelectTrigger className="bg-white/50">
                                <SelectValue placeholder="Status auswählen" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="contact">Kontaktaufnahme</SelectItem>
                                <SelectItem value="preparation">Vorbereitung</SelectItem>
                                <SelectItem value="registration">Registrierung</SelectItem>
                                <SelectItem value="verification">Verifizierung</SelectItem>
                                <SelectItem value="betting">Wetten</SelectItem>
                                <SelectItem value="payout">Auszahlung</SelectItem>
                                <SelectItem value="completed">Abgeschlossen</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                      
                      {documents[user.id] && getDocumentCards(user.id)}
                      
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
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Persönliche Daten:</h4>
                        {profiles[user.id].firstName && (
                          <div className="text-sm flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {profiles[user.id].firstName} {profiles[user.id].lastName}
                          </div>
                        )}
                        {profiles[user.id].phone && (
                          <div className="text-sm flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {profiles[user.id].phone}
                          </div>
                        )}
                        {profiles[user.id].birthDate && (
                          <div className="text-sm flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(profiles[user.id].birthDate).toLocaleDateString('de-DE')}
                          </div>
                        )}
                        {profiles[user.id].street && (
                          <div className="text-sm flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {profiles[user.id].street} {profiles[user.id].houseNumber}, {profiles[user.id].zipCode} {profiles[user.id].city}
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
                    className="bg-white/70"
                    onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                  >
                    {selectedUser === user.id ? "Details ausblenden" : "Details anzeigen"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Keine Benutzer gefunden.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="verification" className="mt-0">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Ausstehende Verifizierungen ({pendingVerificationUsers.length})</h3>
            
            {pendingVerificationUsers.length === 0 ? (
              <div className="text-center py-10 bg-white/50 rounded-lg">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Keine ausstehenden Verifizierungen.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingVerificationUsers.map(user => (
                  <Card key={user.id} className="glass-morphism hover:shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <CardTitle className="text-base">{profiles[user.id].firstName} {profiles[user.id].lastName}</CardTitle>
                        {getStatusBadge(profiles[user.id].status)}
                      </div>
                      <CardDescription>{user.email}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-2 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Telefon:</p>
                          <p>{profiles[user.id].phone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Geburtsdatum:</p>
                          <p>{new Date(profiles[user.id].birthDate).toLocaleDateString('de-DE')}</p>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <p className="text-muted-foreground">Adresse:</p>
                        <p>{profiles[user.id].street} {profiles[user.id].houseNumber}</p>
                        <p>{profiles[user.id].zipCode} {profiles[user.id].city}</p>
                      </div>
                      
                      {documents[user.id] && (
                        <div className="space-y-2 pt-1 mt-2">
                          <Separator className="mb-2" />
                          <p className="text-sm font-medium">Dokumente:</p>
                          
                          {documents[user.id].idDocuments.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Ausweisdokumente:</p>
                              <div className="flex flex-wrap gap-2">
                                {documents[user.id].idDocuments.map((doc, idx) => (
                                  <Button 
                                    key={idx} 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handlePreviewDocument(doc)}
                                    className="flex items-center gap-1 bg-white/70 text-xs"
                                  >
                                    {getFileIcon(doc.fileType)}
                                    <span className="max-w-[100px] truncate">{doc.fileName}</span>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {documents[user.id].cardDocuments.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Zahlungskarten:</p>
                              <div className="flex flex-wrap gap-2">
                                {documents[user.id].cardDocuments.map((doc, idx) => (
                                  <Button 
                                    key={idx} 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handlePreviewDocument(doc)}
                                    className="flex items-center gap-1 bg-white/70 text-xs"
                                  >
                                    {getFileIcon(doc.fileType)}
                                    <span className="max-w-[100px] truncate">{doc.fileName}</span>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {documents[user.id].bankDocuments.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Bankdokumente:</p>
                              <div className="flex flex-wrap gap-2">
                                {documents[user.id].bankDocuments.map((doc, idx) => (
                                  <Button 
                                    key={idx} 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handlePreviewDocument(doc)}
                                    className="flex items-center gap-1 bg-white/70 text-xs"
                                  >
                                    {getFileIcon(doc.fileType)}
                                    <span className="max-w-[100px] truncate">{doc.fileName}</span>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        variant="default"
                        onClick={() => handleUpdateProfileStatus(user.id, "approved")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Bestätigen
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleUpdateProfileStatus(user.id, "rejected")}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Ablehnen
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUpdateProfileStatus(user.id, "reviewing")}
                        className="bg-white/70"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!previewDocument} onOpenChange={() => closePreview()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewDocument && getFileIcon(previewDocument.type)}
              <span className="truncate">{previewDocument?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[70vh] overflow-auto bg-gray-50 rounded-md flex items-center justify-center">
            {previewDocument && (
              previewDocument.type.startsWith('image/') ? (
                <img 
                  src={previewDocument.url} 
                  alt={previewDocument.name} 
                  className="max-w-full"
                />
              ) : previewDocument.type === 'application/pdf' ? (
                <iframe 
                  src={previewDocument.url} 
                  title={previewDocument.name}
                  className="w-full h-[60vh]"
                />
              ) : (
                <div className="py-12 px-4 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Vorschau nicht verfügbar</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-4"
                    onClick={() => previewDocument && handleDownloadDocument({
                      fileName: previewDocument.name,
                      fileType: previewDocument.type,
                      fileSize: 0,
                      uploadDate: '',
                      dataUrl: previewDocument.url
                    })}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Herunterladen
                  </Button>
                </div>
              )
            )}
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={closePreview}>
              Schließen
            </Button>
            {previewDocument && (
              <Button 
                variant="default"
                onClick={() => previewDocument && handleDownloadDocument({
                  fileName: previewDocument.name,
                  fileType: previewDocument.type,
                  fileSize: 0,
                  uploadDate: '',
                  dataUrl: previewDocument.url
                })}
              >
                <Download className="h-4 w-4 mr-2" />
                Herunterladen
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManager;
