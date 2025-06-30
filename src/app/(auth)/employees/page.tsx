'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, PlusCircle, Search } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';


type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated';
type Department = 'Sales' | 'Engineering' | 'HR' | 'Management';

type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: EmployeeStatus;
  department: Department;
};

interface EmployeeFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  employee: Employee | null;
  onSubmit: (employeeData: Omit<Employee, 'id'> & { id?: string }) => void;
}

function EmployeeFormDialog({ isOpen, onOpenChange, employee, onSubmit }: EmployeeFormDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        status: 'Active' as EmployeeStatus,
        department: 'Sales' as Department,
    });

    useEffect(() => {
        if (isOpen) {
            if (employee) {
                setFormData(employee);
            } else {
                // Reset for new employee
                const { id, ...newEmployeeForm } = {
                    id: '',
                    name: '',
                    email: '',
                    role: 'New Hire',
                    status: 'Active' as EmployeeStatus,
                    department: 'Sales' as Department,
                };
                setFormData(newEmployeeForm);
            }
        }
    }, [isOpen, employee]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: 'status' | 'department') => (value: string) => {
        setFormData(prev => ({ ...prev, [id]: value as any }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSubmit: Omit<Employee, 'id'> & { id?: string } = { ...formData };
        if (employee) {
          dataToSubmit.id = employee.id;
        }
        onSubmit(dataToSubmit);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                        <DialogDescription>
                            {employee ? "Update the employee's details." : "Enter the details for the new employee."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Role</Label>
                            <Input id="role" value={formData.role} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="department" className="text-right">Department</Label>
                            <Select onValueChange={handleSelectChange('department')} value={formData.department}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sales">Sales</SelectItem>
                                    <SelectItem value="Engineering">Engineering</SelectItem>
                                    <SelectItem value="HR">HR</SelectItem>
                                    <SelectItem value="Management">Management</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <Select onValueChange={handleSelectChange('status')} value={formData.status}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="On Leave">On Leave</SelectItem>
                                    <SelectItem value="Terminated">Terminated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const { toast } = useToast();
    const { user } = useAuth();
    
    useEffect(() => {
        const q = query(collection(db, 'employees'), orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const employeesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Employee[];
            setEmployees(employeesData);
            setLoading(false);
        }, (error) => {
            console.error("Firebase Error:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch employees."});
            setLoading(false);
        });
        return () => unsubscribe();
    }, [toast]);

    const filteredEmployees = useMemo(() => {
        if (!searchTerm) return employees;
        return employees.filter(employee =>
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);
    
    const handleAddClick = () => {
        setEditingEmployee(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsFormOpen(true);
    };
    
    const handleDeleteClick = (employee: Employee) => {
        setEmployeeToDelete(employee);
        setIsDeleteAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (employeeToDelete && user) {
            try {
                await deleteDoc(doc(db, 'employees', employeeToDelete.id));

                await addDoc(collection(db, 'activities'), {
                    type: 'Employee Deleted',
                    description: `Employee ${employeeToDelete.name} was removed.`,
                    timestamp: serverTimestamp(),
                    userId: user.email,
                    userName: user.name,
                });

                toast({ title: "Employee Deleted", description: `${employeeToDelete.name} has been removed.`});
                setEmployeeToDelete(null);
            } catch (error) {
                console.error("Error deleting document: ", error);
                toast({ variant: "destructive", title: "Error", description: "Could not delete employee."});
            }
        }
        setIsDeleteAlertOpen(false);
    };
    
    const handleFormSubmit = async (employeeData: Omit<Employee, 'id'> & { id?: string }) => {
        if (!user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in." });
            return;
        }

        try {
            if (employeeData.id) {
                const { id, ...dataToUpdate } = employeeData;
                await updateDoc(doc(db, 'employees', id), dataToUpdate);
                
                await addDoc(collection(db, 'activities'), {
                    type: 'Employee Updated',
                    description: `Details for ${employeeData.name} were updated.`,
                    timestamp: serverTimestamp(),
                    userId: user.email,
                    userName: user.name,
                });

                toast({ title: "Employee Updated", description: "Employee details have been saved." });
            } else {
                const { id, ...dataToAdd } = employeeData;
                await addDoc(collection(db, 'employees'), dataToAdd);

                await addDoc(collection(db, 'activities'), {
                    type: 'Employee Added',
                    description: `Employee ${employeeData.name} was added.`,
                    timestamp: serverTimestamp(),
                    userId: user.email,
                    userName: user.name,
                });

                toast({ title: "Employee Added", description: `${employeeData.name} has been added.`});
            }
            setIsFormOpen(false);
            setEditingEmployee(null);
        } catch (error) {
            console.error("Error submitting form: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not save employee details."});
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Employee Management</CardTitle>
                            <CardDescription>View, manage, and search company employees.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search employees..." 
                                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleAddClick}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Employee
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">Loading employees...</TableCell>
                            </TableRow>
                        ) : filteredEmployees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">No employees found.</TableCell>
                            </TableRow>
                        ) : (
                        filteredEmployees.map(employee => (
                        <TableRow key={employee.id}>
                            <TableCell className="font-medium">{employee.name}<div className="text-sm text-muted-foreground">{employee.email}</div></TableCell>
                            <TableCell>{employee.role}</TableCell>
                            <TableCell>{employee.department}</TableCell>
                             <TableCell>
                                <Badge variant={
                                    employee.status === 'Active' ? 'default' : 
                                    employee.status === 'On Leave' ? 'secondary' : 'destructive'
                                } className={employee.status === 'Active' ? 'bg-accent' : ''}>
                                    {employee.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditClick(employee)}>Edit</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDeleteClick(employee)}
                                >
                                    Delete
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        )))}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <EmployeeFormDialog
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                employee={editingEmployee}
                onSubmit={handleFormSubmit}
            />

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the employee's record.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setEmployeeToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
