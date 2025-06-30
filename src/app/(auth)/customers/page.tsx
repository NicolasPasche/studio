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

type CustomerStatus = 'Active' | 'New' | 'Churned';

type Customer = {
  id: string;
  name: string;
  contact: string;
  email: string;
  status: CustomerStatus;
  segment: string;
};

interface CustomerFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  customer: Customer | null;
  onSubmit: (customerData: Omit<Customer, 'id'> & { id?: string }) => void;
}

function CustomerFormDialog({ isOpen, onOpenChange, customer, onSubmit }: CustomerFormDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        email: '',
        status: 'New' as CustomerStatus,
        segment: 'Tier 3',
    });

    useEffect(() => {
        if (isOpen) {
            if (customer) {
                setFormData(customer);
            } else {
                setFormData({
                    name: '',
                    contact: '',
                    email: '',
                    status: 'New',
                    segment: 'Tier 3',
                });
            }
        }
    }, [isOpen, customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: 'status' | 'segment') => (value: string) => {
        setFormData(prev => ({ ...prev, [id]: value as any }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSubmit: Omit<Customer, 'id'> & { id?: string } = { ...formData };
        if (customer) {
          dataToSubmit.id = customer.id;
        }
        onSubmit(dataToSubmit);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                        <DialogDescription>
                            {customer ? "Update the customer's details." : "Enter the details for the new customer."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="contact" className="text-right">Contact</Label>
                            <Input id="contact" value={formData.contact} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <Select onValueChange={handleSelectChange('status')} value={formData.status}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="New">New</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Churned">Churned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="segment" className="text-right">Segment</Label>
                             <Select onValueChange={handleSelectChange('segment')} value={formData.segment}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select segment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Tier 1">Tier 1</SelectItem>
                                    <SelectItem value="Tier 2">Tier 2</SelectItem>
                                    <SelectItem value="Tier 3">Tier 3</SelectItem>
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


export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        const q = query(collection(db, 'customers'), orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const customersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Customer[];
            setCustomers(customersData);
            setLoading(false);
        }, (error) => {
            console.error("Firebase Error:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch customers."});
            setLoading(false);
        });
        return () => unsubscribe();
    }, [toast]);

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return customers;
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm]);
    
    const handleAddClick = () => {
        setEditingCustomer(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsFormOpen(true);
    };
    
    const handleDeleteClick = (customer: Customer) => {
        setCustomerToDelete(customer);
        setIsDeleteAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (customerToDelete && user) {
            try {
                await deleteDoc(doc(db, 'customers', customerToDelete.id));

                await addDoc(collection(db, 'activities'), {
                    type: 'Customer Deleted',
                    description: `Customer ${customerToDelete.name} was removed.`,
                    timestamp: serverTimestamp(),
                    userId: user.email,
                    userName: user.name,
                });

                toast({ title: "Customer Deleted", description: `${customerToDelete.name} has been removed.`});
                setCustomerToDelete(null);
            } catch (error) {
                console.error("Error deleting document: ", error);
                toast({ variant: "destructive", title: "Error", description: "Could not delete customer."});
            }
        }
        setIsDeleteAlertOpen(false);
    };
    
    const handleFormSubmit = async (customerData: Omit<Customer, 'id'> & { id?: string }) => {
        if (!user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in." });
            return;
        }

        try {
            if (customerData.id) {
                const { id, ...dataToUpdate } = customerData;
                await updateDoc(doc(db, 'customers', id), dataToUpdate);

                await addDoc(collection(db, 'activities'), {
                    type: 'Customer Updated',
                    description: `Customer ${customerData.name} was updated.`,
                    timestamp: serverTimestamp(),
                    userId: user.email,
                    userName: user.name,
                });

                toast({ title: "Customer Updated", description: "Customer details have been saved." });
            } else {
                // Explicitly create the object to be added to prevent any issues.
                const dataToAdd = {
                    name: customerData.name,
                    contact: customerData.contact,
                    email: customerData.email,
                    status: customerData.status,
                    segment: customerData.segment,
                };
                await addDoc(collection(db, 'customers'), dataToAdd);

                 await addDoc(collection(db, 'activities'), {
                    type: 'Customer Added',
                    description: `Customer ${customerData.name} was added.`,
                    timestamp: serverTimestamp(),
                    userId: user.email,
                    userName: user.name,
                });

                toast({ title: "Customer Added", description: `${customerData.name} has been added.`});
            }
            setIsFormOpen(false);
            setEditingCustomer(null);
        } catch (error) {
            console.error("Error submitting form: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not save customer details."});
        }
    };

    return (
        <>
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>Customer Management</CardTitle>
                        <CardDescription>View, manage, and segment your customers.</CardDescription>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search customers..." 
                                className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAddClick} className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Customer
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">Loading customers...</TableCell>
                        </TableRow>
                    ) : filteredCustomers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">No customers found.</TableCell>
                        </TableRow>
                    ) : (filteredCustomers.map((customer, index) => (
                    <TableRow 
                        key={customer.id}
                        className="opacity-0 animate-fade-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.contact}</TableCell>
                        <TableCell>
                        <Badge variant={
                            customer.status === 'Active' ? 'default' : 
                            customer.status === 'New' ? 'secondary' : 'destructive'
                        } className={customer.status === 'Active' ? 'bg-accent' : ''}>
                            {customer.status}
                        </Badge>
                        </TableCell>
                        <TableCell>{customer.segment}</TableCell>
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
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(customer)}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteClick(customer)}
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
        
        <CustomerFormDialog
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            customer={editingCustomer}
            onSubmit={handleFormSubmit}
        />

        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the customer
                        and remove their data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setCustomerToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        </>
    )
}
