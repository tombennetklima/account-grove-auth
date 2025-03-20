
import { useState, useEffect } from "react";
import { 
  getUsersFromStorage, 
  UserDetails, 
  updateUserPassword, 
  deleteUser 
} from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Edit, Trash2, User } from "lucide-react";

const AdminPanel = () => {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getUsersFromStorage();
    setUsers(allUsers);
  };

  const handleEditUser = (user: UserDetails) => {
    setSelectedUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: UserDetails) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmEdit = () => {
    if (!selectedUser) return;
    
    if (newPassword !== confirmPassword) {
      alert("Die Passwörter stimmen nicht überein!");
      return;
    }
    
    if (updateUserPassword(selectedUser.id, newPassword)) {
      setIsEditDialogOpen(false);
      loadUsers();
    }
  };

  const confirmDelete = () => {
    if (!selectedUser) return;
    
    if (deleteUser(selectedUser.id)) {
      setIsDeleteDialogOpen(false);
      loadUsers();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Ungültiges Datum';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/50 rounded-md p-4 shadow-sm border border-border">
        <h4 className="text-lg font-medium mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" /> 
          Benutzer verwalten
        </h4>
        
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> Erstellt am
                </TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="transition-colors hover:bg-muted/20">
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.isAdmin ? "Ja" : "Nein"}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditUser(user)}
                        className="h-8 transition-all duration-200 hover:bg-primary hover:text-white"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" /> Passwort
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteUser(user)}
                        className="h-8 transition-all duration-200 hover:bg-destructive hover:text-white"
                        disabled={user.isAdmin} // Prevent admin deletion
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Löschen
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Keine Benutzer gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Password Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md glass-morphism">
          <DialogHeader>
            <DialogTitle>Passwort ändern</DialogTitle>
            <DialogDescription>
              Ändern Sie das Passwort für {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Neues Passwort</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Passwort bestätigen</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="transition-all duration-200"
            >
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              onClick={confirmEdit}
              disabled={!newPassword || !confirmPassword}
              className="transition-all duration-200"
            >
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="glass-morphism">
          <AlertDialogHeader>
            <AlertDialogTitle>Benutzer löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Benutzer <span className="font-medium">{selectedUser?.email}</span> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="transition-all duration-200">Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 transition-all duration-200"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;
