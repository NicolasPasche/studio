'use client';

import React, { useState, useMemo, useEffect } from 'react';
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

type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated';
type Department = 'Sales' | 'Engineering' | 'HR' | 'Management';

type Employee = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: EmployeeStatus;
  department: Department;
};

const initialEmployees: Employee[] = [
  { id: 1, name: 'Alex Johnson', email: 'alex.j@apex.com', role: 'Sales Lead', status: 'Active', department: 'Sales' },
  { id: 2, name: 'Maria Garcia', email: 'maria.g@apex.com', role: 'System Administrator', status: 'Active', department: 'Management' },
  { id: 3, name: 'David Chen', email: 'david.c@apex.com', role: 'Proposal Engineer', status: 'Active', department: 'Engineering' },
  { id: 4, name: 'Sarah Lee', email: 'sarah.l@apex.com', role: 'HR Manager', status: 'On Leave', department: 'HR' },
  { id: 5, name: 'Tom Wilson', email: 'tom.w@apex.com', role: 'Junior Engineer', status: 'Active', department: 'Engineering' },
  { id: 6, name: 'Jessica Brown', email: 'jessica.b@apex.com', role: 'Sales Associate', status: 'Terminated', department: 'Sales' },
];

interface EmployeeFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  employee: Employee | null;
  onSubmit: (employeeData: Omit<Employee, 'id'> & { id?: number }) => void;
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
                setFormData({
                    name: '',
                    email: '',
                    role: 'New Hire',
                    status: 'Active',
                    department: 'Sales',
                });
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
        const dataToSubmit: Omit<Employee, 'id'> & { id?: number } = { ...formData };
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
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

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

    const confirmDelete = () => {
        if (employeeToDelete) {
            setEmployees(employees.filter(e => e.id !== employeeToDelete.id));
            setEmployeeToDelete(null);
        }
        setIsDeleteAlertOpen(false);
    };
    
    const handleFormSubmit = (employeeData: Omit<Employee, 'id'> & { id?: number }) => {
        if (employeeData.id) {
            setEmployees(employees.map(e => e.id === employeeData.id ? { ...e, ...employeeData, id: e.id } : e));
        } else {
            const newEmployee: Employee = {
                id: Math.max(...employees.map(e => e.id), 0) + 1,
                name: employeeData.name,
                email: employeeData.email,
                role: employeeData.role,
                status: employeeData.status,
                department: employeeData.department,
            };
            setEmployees([...employees, newEmployee]);
        }
        setIsFormOpen(false);
        setEditingEmployee(null);
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
                        {filteredEmployees.map(employee => (
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
                        ))}
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

    