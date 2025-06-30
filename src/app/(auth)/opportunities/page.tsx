
'use client';

import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  where,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Lead, Pipeline } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building,
  User,
  Mail,
  Phone,
  ThumbsUp,
  ThumbsDown,
  Info,
  FileText,
  Trash2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';

const pipelineStages: (keyof Pipeline)[] = [
  'New Lead',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

function OpportunityDetailsDialog({
  opportunity,
  isOpen,
  onOpenChange,
  onStatusChange,
  onDelete,
}: {
  opportunity: Lead | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onStatusChange: (newStatus: Lead['status']) => void;
  onDelete: (opportunity: Lead) => void;
}) {
  const { user } = useAuth();

  if (!opportunity) return null;

  const canDelete = user?.role === 'admin' || user?.role === 'dev';
  const canQualify = (user?.role === 'admin' || user?.role === 'dev' || user?.role === 'sales') && opportunity.status === 'New Lead';
  const canAcceptOrReject = (user?.role === 'admin' || user?.role === 'dev') && opportunity.status === 'Proposal Sent';
  const canMarkWonOrLost = (user?.role === 'admin' || user?.role === 'dev') && opportunity.status === 'Negotiation';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{opportunity.company}</DialogTitle>
          <DialogDescription>
            Detailed view of the opportunity and proposal.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 pr-6">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Lead Information
              </h4>
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{opportunity.company}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{opportunity.contactName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{opportunity.email}</span>
              </div>
              {opportunity.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{opportunity.phone}</span>
                </div>
              )}
              <Separator />
              <div>
                <h4 className="font-medium text-sm mb-2">Lead Source</h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {opportunity.source}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Lead Type</h4>
                <p className="text-sm text-muted-foreground">
                  {opportunity.type}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">
                  {opportunity.notes || 'No notes provided.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Proposal Content
              </h4>
              <Card className="bg-secondary/50">
                <CardContent className="p-4">
                  {opportunity.proposalContent ? (
                    <p className="text-sm whitespace-pre-wrap">
                      {opportunity.proposalContent}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No proposal has been submitted for this lead yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="pt-4 pr-4 sm:justify-between items-center">
          <div>
            {canDelete && (
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                size="sm"
                onClick={() => onDelete(opportunity)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Opportunity
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canQualify && (
               <Button onClick={() => onStatusChange('Qualified')}>
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Qualify Lead
              </Button>
            )}
            {canAcceptOrReject && (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => onStatusChange('Lost')}
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Reject Proposal
                </Button>
                <Button onClick={() => onStatusChange('Negotiation')}>
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Accept Proposal
                </Button>
              </div>
            )}
            {canMarkWonOrLost && (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => onStatusChange('Lost')}
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Mark as Lost
                </Button>
                <Button onClick={() => onStatusChange('Won')}>
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Mark as Won
                </Button>
              </div>
            )}
             <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormworkPipeline() {
  const [pipeline, setPipeline] = useState<Pipeline>({
    'New Lead': [],
    Qualified: [],
    'Proposal Sent': [],
    Negotiation: [],
    Won: [],
    Lost: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<Lead | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [oppToDelete, setOppToDelete] = useState<Lead | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const q = query(
      collection(db, 'leads'),
      where('type', '==', 'Formwork'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const newPipeline: Pipeline = {
          'New Lead': [],
          Qualified: [],
          'Proposal Sent': [],
          Negotiation: [],
          Won: [],
          Lost: [],
        };

        querySnapshot.forEach((doc) => {
          const lead = { id: doc.id, ...doc.data() } as Lead;
          if (lead.status in newPipeline) {
            newPipeline[lead.status as keyof Pipeline].push(lead);
          }
        });

        setPipeline(newPipeline);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching opportunities:', error);
        if (error.message.includes('requires an index')) {
           const firestoreLinkRegex = /(https?:\/\/[^\s]+)/;
          const match = error.message.match(firestoreLinkRegex);
          if (match) {
            toast({
              variant: 'destructive',
              title: 'Database Index Required',
              description: (
                <span>
                  The Formwork Pipeline requires a database index to function.
                  <a
                    href={match[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold ml-1"
                  >
                    Click here to create it.
                  </a>
                </span>
              ),
              duration: Infinity,
            });
          }
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not fetch opportunities.',
          });
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const handleViewDetails = (opportunity: Lead) => {
    setSelectedOpp(opportunity);
    setIsDetailsOpen(true);
  };

  const handleStatusChange = async (newStatus: Lead['status']) => {
    if (!selectedOpp || !user) return;

    try {
      const leadDocRef = doc(db, 'leads', selectedOpp.id);
      await updateDoc(leadDocRef, { status: newStatus });
      
      await addDoc(collection(db, 'activities'), {
        type: 'Status Change',
        description: `"${selectedOpp.company}" moved to ${newStatus}.`,
        timestamp: serverTimestamp(),
        userId: user.email,
        userName: user.name,
      });

      toast({
        title: 'Status Updated',
        description: `${selectedOpp.company} has been moved to ${newStatus}.`,
      });
      setIsDetailsOpen(false);
      setSelectedOpp(null);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the opportunity status.',
      });
    }
  };

  const handleDeleteClick = (opportunity: Lead) => {
    setOppToDelete(opportunity);
    setIsDetailsOpen(false);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (oppToDelete && user) {
      try {
        await deleteDoc(doc(db, 'leads', oppToDelete.id));
        
        await addDoc(collection(db, 'activities'), {
          type: 'Lead Deleted',
          description: `Lead for ${oppToDelete.company} was deleted.`,
          timestamp: serverTimestamp(),
          userId: user.email,
          userName: user.name,
        });

        toast({
          title: 'Opportunity Deleted',
          description: `The opportunity for ${oppToDelete.company} has been deleted.`,
        });
        setOppToDelete(null);
      } catch (error) {
        console.error('Error deleting opportunity:', error);
        toast({
          variant: 'destructive',
          title: 'Delete Failed',
          description: 'Could not delete the opportunity.',
        });
      }
    }
    setIsDeleteAlertOpen(false);
  };

  if (loading) {
    return <OpportunitiesSkeleton />;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-8 mt-6">
        {pipelineStages.map((stage) => (
          <Card key={stage}>
            <CardHeader>
              <CardTitle className="text-xl flex justify-between items-center">
                <span>{stage}</span>
                <span className="text-lg font-semibold text-muted-foreground bg-secondary rounded-full px-4 py-1">
                  {pipeline[stage].length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pipeline[stage].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pipeline[stage].map((opp, index) => (
                    <Card
                      key={opp.id}
                      className="transition-all duration-300 flex flex-col opacity-0 animate-fade-up hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--accent-glow))]"
                      style={{ animationDelay: `${index * 75}ms` }}
                    >
                      <CardHeader className="p-4">
                        <CardTitle className="text-base font-medium">
                          {opp.company}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex-grow">
                        <div className="text-muted-foreground">{opp.type}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {opp.contactName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {opp.contactName}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        {user?.role === 'proposal' &&
                        opp.status === 'Qualified' ? (
                          <Button asChild size="sm" className="w-full">
                            <Link href={`/proposal/${opp.id}`}>
                              Create Proposal
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleViewDetails(opp)}
                          >
                            View Details
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                  No opportunities in this stage.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <OpportunityDetailsDialog
        opportunity={selectedOpp}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteClick}
      />
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              opportunity for {oppToDelete?.company}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOppToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={buttonVariants({ variant: 'destructive' })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ScaffoldingLeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const q = query(
      collection(db, 'leads'),
      where('type', '==', 'Scaffolding'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const leadsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Lead[];
        setLeads(leadsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching scaffolding leads: ', error);
        if (error.message.includes('requires an index')) {
           const firestoreLinkRegex = /(https?:\/\/[^\s]+)/;
          const match = error.message.match(firestoreLinkRegex);
          if (match) {
            toast({
              variant: 'destructive',
              title: 'Database Index Required',
              description: (
                <span>
                  The Scaffolding Leads table requires a database index to function.
                  <a
                    href={match[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold ml-1"
                  >
                    Click here to create it.
                  </a>
                </span>
              ),
              duration: Infinity,
            });
          }
        } else {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Could not fetch scaffolding leads.',
            });
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const handleDeleteClick = (lead: Lead) => {
    setLeadToDelete(lead);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (leadToDelete && user) {
      try {
        await deleteDoc(doc(db, 'leads', leadToDelete.id));

        await addDoc(collection(db, 'activities'), {
            type: 'Lead Deleted',
            description: `Lead for ${leadToDelete.company} was deleted.`,
            timestamp: serverTimestamp(),
            userId: user.email,
            userName: user.name,
        });

        toast({
          title: 'Lead Deleted',
          description: `The lead for ${leadToDelete.company} has been deleted.`,
        });
        setLeadToDelete(null);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not delete the lead.',
        });
      }
    }
    setIsAlertOpen(false);
  };

  return (
    <>
      <Card className="mt-6">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date Received</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading leads...
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No scaffolding leads found.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead, index) => (
                  <TableRow 
                    key={lead.id}
                    className="opacity-0 animate-fade-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-medium">
                      {lead.company}
                    </TableCell>
                    <TableCell>
                      <div>{lead.contactName}</div>
                      <div className="text-sm text-muted-foreground">
                        {lead.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.createdAt?.seconds
                        ? format(
                            new Date(lead.createdAt.seconds * 1000),
                            'PPP'
                          )
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          lead.status === 'New Lead'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {(user?.role === 'admin' || user?.role === 'dev') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(lead)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              lead for {leadToDelete?.company}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLeadToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={buttonVariants({ variant: 'destructive' })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function OpportunitiesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-8 mt-6">
        {pipelineStages.map((stage) => (
          <Card key={stage}>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(2)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="p-4">
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Skeleton className="h-8 w-1/2" />
                      <div className="flex items-center gap-2 mt-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  const { user } = useAuth();

  if (!user) {
    return <OpportunitiesSkeleton />;
  }
  
  const isProposalEngineer = user.role === 'proposal';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
             {isProposalEngineer ? 'Formwork Opportunities' : 'Sales Opportunities'}
          </CardTitle>
          <CardDescription>
            {isProposalEngineer 
              ? 'Manage all formwork opportunities assigned for proposal creation.'
              : 'Manage all sales opportunities, for both formwork and scaffolding.'}
          </CardDescription>
        </CardHeader>
      </Card>
      
      {isProposalEngineer ? (
        <FormworkPipeline />
      ) : (
        <Tabs defaultValue="formwork" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="formwork">Formwork Pipeline</TabsTrigger>
            <TabsTrigger value="scaffolding">Scaffolding Leads</TabsTrigger>
          </TabsList>
          <TabsContent value="formwork">
            <FormworkPipeline />
          </TabsContent>
          <TabsContent value="scaffolding">
            <ScaffoldingLeadsTable />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
