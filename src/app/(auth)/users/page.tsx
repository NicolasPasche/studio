
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
import { UserRole, roleDisplayNames } from '@/lib/auth';
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
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import { UserPlus, Shield, Briefcase, UserCog, Users, Code, MoreHorizontal, Trash2, Lock, Unlock, Copy } from 'lucide-react';

type DisplayUser = {
  id: string; // Firebase Auth UID
  name: string;
  email: string;
  role: UserRole;
  disabled?: boolean;
};

function InviteUserDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({ title: "Link Copied!", description: "The sign-up link has been copied to your clipboard." });
  };
  
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };
  const baseUrl = getBaseUrl();

  const inviteLinks = [
    { role: 'sales', path: '/' },
    { role: 'proposal', path: '/signup/proposal' },
    { role: 'hr', path: '/signup/hr' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Invitation Link</DialogTitle>
          <DialogDescription>
            Copy the appropriate sign-up link and send it to the new user.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {inviteLinks.map(({ role, path }) => {
            const fullLink = `${baseUrl}${path}`;
            return (
              <div key={role} className="space-y-2">
                <Label htmlFor={`link-${role}`}>{roleDisplayNames[role as UserRole]} Sign-up Link</Label>
                <div className="flex items-center space-x-2">
                  <Input id={`link-${role}`} value={fullLink} readOnly />
                  <Button type="button" size="icon" onClick={() => handleCopy(fullLink)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
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
  const [isRestrictAlertOpen, setIsRestrictAlertOpen] = useState(false);
  const [userToRestrict, setUserToRestrict] = useState<DisplayUser | null>(null);

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
  
  const handleRestrictClick = (user: DisplayUser) => {
    setUserToRestrict(user);
    setIsRestrictAlertOpen(true);
  };

  const confirmRestrict = async () => {
    if (!userToRestrict || !realUser) {
        toast({ variant: "destructive", title: "Error", description: "Cannot update user status. Missing information." });
        setIsRestrictAlertOpen(false);
        return;
    }

    const newDisabledState = !userToRestrict.disabled;
    const actionText = newDisabledState ? 'restricted' : 'unrestricted';

    try {
        const userDocRef = doc(db, "users", userToRestrict.id);
        await updateDoc(userDocRef, { disabled: newDisabledState });

        await addDoc(collection(db, 'activities'), {
            type: 'User Status Change',
            description: `User ${userToRestrict.name} (${userToRestrict.email}) was ${actionText}.`,
            timestamp: serverTimestamp(),
            userId: realUser.email,
            userName: realUser.name,
        });

        toast({
            title: "User Status Updated",
            description: `${userToRestrict.name} has been successfully ${actionText}.`
        });

        setUsers(prevUsers => prevUsers.map(u => u.id === userToRestrict.id ? { ...u, disabled: newDisabledState } : u));
        setUserToRestrict(null);
    } catch (error) {
        console.error(`Error updating user status:`, error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the user's status. Please try again."
        });
    } finally {
        setIsRestrictAlertOpen(false);
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
            {currentUser?.role === 'admin' && <InviteUserDialog />}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[220px]">Role</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                  <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading users...</TableCell>
                  </TableRow>
              ) : users.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">No users found.</TableCell>
                  </TableRow>
              ) : (
                  users.map((user) => {
                    const isCurrentUser = currentUser?.email === user.email;
                    const canAdminRestrict = currentUser?.role === 'admin' && user.role !== 'dev' && !isCurrentUser;
                    return (
                      <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {canAdminRestrict ? (
                                <button
                                    onClick={() => handleRestrictClick(user)}
                                    className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    aria-label={`Change status for ${user.name}`}
                                >
                                    <Badge variant={user.disabled ? "destructive" : "default"} className={cn(!user.disabled && "bg-accent text-accent-foreground", "cursor-pointer")}>
                                        {user.disabled ? "Restricted" : "Active"}
                                    </Badge>
                                </button>
                            ) : (
                                <Badge variant={user.disabled ? "destructive" : "default"} className={!user.disabled ? "bg-accent text-accent-foreground" : ""}>
                                    {user.disabled ? "Restricted" : "Active"}
                                </Badge>
                            )}
                          </TableCell>
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
                                  disabled={isCurrentUser || currentUser?.role !== 'admin'}
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
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" disabled={isCurrentUser}>
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">Toggle menu</span>
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      {currentUser?.role === 'admin' && (
                                        <DropdownMenuItem
                                            onClick={() => handleRestrictClick(user)}
                                            disabled={user.role === 'dev' || isCurrentUser}
                                        >
                                            {user.disabled ? (
                                                <><Unlock className="mr-2 h-4 w-4" /> Unrestrict User</>
                                            ) : (
                                                <><Lock className="mr-2 h-4 w-4" /> Restrict User</>
                                            )}
                                        </DropdownMenuItem>
                                      )}
                                      {currentUser?.role === 'dev' && (
                                          <DropdownMenuItem
                                              className="text-destructive"
                                              onClick={() => handleDeleteClick(user)}
                                              disabled={isCurrentUser || user.role === 'dev'}
                                          >
                                              <Trash2 className="mr-2 h-4 w-4" />
                                              Delete User
                                          </DropdownMenuItem>
                                      )}
                                  </DropdownMenuContent>
                              </DropdownMenu>
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

      <AlertDialog open={isRestrictAlertOpen} onOpenChange={setIsRestrictAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will {userToRestrict?.disabled ? 'restore access for' : 'prevent'} {userToRestrict?.name} from accessing the application.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setUserToRestrict(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={confirmRestrict} 
                      className={buttonVariants({ variant: userToRestrict?.disabled ? 'default' : "destructive" })}
                    >
                        {userToRestrict?.disabled ? 'Unrestrict' : 'Restrict'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
