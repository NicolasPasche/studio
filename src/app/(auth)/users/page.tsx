'use client';

import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, UserRole, roleDisplayNames } from '@/lib/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { UserPlus, Shield, Briefcase, UserCog, Users, Code, MoreHorizontal, Trash2 } from 'lucide-react';

type DisplayUser = {
  id: string; // Firebase Auth UID
  name: string;
  email: string;
  role: UserRole;
};

function InviteUserDialog({ onUserInvited }: { onUserInvited: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('sales');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { realUser } = useAuth();

  const handleInvite = async () => {
    if (!email || !role) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please enter an email and select a role.',
      });
      return;
    }

    if (!realUser) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
        return;
    }

    try {
      const userRoleRef = doc(db, 'user_roles', email);
      await setDoc(userRoleRef, { role });

      await addDoc(collection(db, 'activities'), {
        type: 'User Invited',
        description: `${email} was invited as a ${roleDisplayNames[role]}.`,
        timestamp: serverTimestamp(),
        userId: realUser.email,
        userName: realUser.name,
      });
      
      toast({
        title: 'User Invited',
        description: `${email} has been invited as a ${roleDisplayNames[role]}. They can now sign up.`,
      });

      setIsOpen(false);
      setEmail('');
      setRole('sales');
      onUserInvited();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        variant: 'destructive',
        title: 'Invitation Failed',
        description: 'Could not set the user role in the database.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Enter the email and assign a role. The user can then sign up to access the app.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="new.user@example.com"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select onValueChange={(value) => setRole(value as UserRole)} defaultValue={role}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="proposal">Proposal Engineer</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={handleInvite}>Send Invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, realUser } = useAuth();
  const { toast } = useToast();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<DisplayUser | null>(null);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<DisplayUser, 'id'>),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
          variant: "destructive",
          title: "Failed to load users",
          description: "Could not fetch user data. Please check your Firestore security rules."
      });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, email: string, newRole: UserRole) => {
    if (!realUser) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in." });
        return;
    }
    try {
        const userDocRef = doc(db, "users", userId);
        const userRoleDocRef = doc(db, "user_roles", email);

        await updateDoc(userDocRef, { role: newRole });
        await setDoc(userRoleDocRef, { role: newRole });
        
        await addDoc(collection(db, 'activities'), {
            type: 'Role Change',
            description: `Role for ${email} changed to ${roleDisplayNames[newRole]}.`,
            timestamp: serverTimestamp(),
            userId: realUser.email,
            userName: realUser.name,
        });

        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

        toast({
            title: "Role Updated",
            description: `The role for ${email} has been changed to ${roleDisplayNames[newRole]}.`
        });
    } catch (error) {
        console.error("Error updating role:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the user's role. Check permissions."
        });
    }
  };

  const handleDeleteClick = (user: DisplayUser) => {
    setUserToDelete(user);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete || !realUser) {
        toast({ variant: "destructive", title: "Error", description: "Cannot delete user. Missing information." });
        setIsDeleteAlertOpen(false);
        return;
    }

    try {
        const userDocRef = doc(db, "users", userToDelete.id);
        const userRoleDocRef = doc(db, "user_roles", userToDelete.email);

        await deleteDoc(userDocRef);
        await deleteDoc(userRoleDocRef);

        await addDoc(collection(db, 'activities'), {
            type: 'User Deleted',
            description: `User ${userToDelete.name} (${userToDelete.email}) was deleted.`,
            timestamp: serverTimestamp(),
            userId: realUser.email,
            userName: realUser.name,
        });

        toast({
            title: "User Deleted",
            description: `${userToDelete.name} has been successfully deleted.`
        });

        setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
    } catch (error) {
        console.error("Error deleting user:", error);
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: "Could not delete the user. Please try again."
        });
    } finally {
        setIsDeleteAlertOpen(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Invite, view, and manage user roles across the application.
              </CardDescription>
            </div>
            <InviteUserDialog onUserInvited={fetchUsers} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[220px]">Role</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                  <TableRow>
                      <TableCell colSpan={4} className="text-center">Loading users...</TableCell>
                  </TableRow>
              ) : users.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">No users found.</TableCell>
                  </TableRow>
              ) : (
                  users.map((user) => {
                    const isCurrentUser = currentUser?.email === user.email;
                    return (
                      <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                          {user.role === 'dev' ? (
                              <div className="flex items-center">
                                  <Code className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span className="capitalize text-muted-foreground">Developer</span>
                              </div>
                          ) : (
                              <Select
                                  value={user.role}
                                  onValueChange={(newRole) => handleRoleChange(user.id, user.email, newRole as UserRole)}
                                  disabled={isCurrentUser}
                              >
                                  <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="admin"><div className="flex items-center"><Shield className="mr-2 h-4 w-4"/>Admin</div></SelectItem>
                                      <SelectItem value="sales"><div className="flex items-center"><Briefcase className="mr-2 h-4 w-4"/>Sales</div></SelectItem>
                                      <SelectItem value="proposal"><div className="flex items-center"><UserCog className="mr-2 h-4 w-4"/>Proposal Engineer</div></SelectItem>
                                      <SelectItem value="hr"><div className="flex items-center"><Users className="mr-2 h-4 w-4"/>HR</div></SelectItem>
                                  </SelectContent>
                              </Select>
                          )}
                          </TableCell>
                          <TableCell className="text-right">
                              {(realUser?.role === 'admin' || realUser?.role === 'dev') && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => handleDeleteClick(user)}
                                            disabled={realUser?.email === user.email || user.role === 'dev'}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete User
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                          </TableCell>
                      </TableRow>
                    )
                  })
              )}
              </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user record
                        for {userToDelete?.name} and remove their role assignment.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
