'use client';

import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
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
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

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
}: {
  opportunity: Lead | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onStatusChange: (newStatus: Lead['status']) => void;
}) {
  const { user } = useAuth();

  if (!opportunity) return null;

  const canTakeAction =
    user?.role === 'admin' && opportunity.status === 'Proposal Sent';

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
        <DialogFooter className="pt-4 pr-4">
            {canTakeAction && (
                <>
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
                </>
            )}
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function OpportunitiesPage() {
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
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));

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
        console.error('Error fetching leads:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleViewDetails = (opportunity: Lead) => {
    setSelectedOpp(opportunity);
    setIsDetailsOpen(true);
  };

  const handleStatusChange = async (newStatus: Lead['status']) => {
    if (!selectedOpp) return;

    try {
      const leadDocRef = doc(db, 'leads', selectedOpp.id);
      await updateDoc(leadDocRef, { status: newStatus });
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

  if (loading) {
    return <OpportunitiesSkeleton />;
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
            <CardDescription>
              Visualize and manage your sales opportunities.
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="space-y-8">
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
                    {pipeline[stage].map((opp) => (
                      <Card
                        key={opp.id}
                        className="hover:shadow-md transition-shadow flex flex-col"
                      >
                        <CardHeader className="p-4">
                          <CardTitle className="text-base font-medium">
                            {opp.company}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex-grow">
                          <div className="text-muted-foreground">
                            {opp.type}
                          </div>
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
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleViewDetails(opp)}
                          >
                            View Details
                          </Button>
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
      </div>

      <OpportunityDetailsDialog
        opportunity={selectedOpp}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}

function OpportunitiesSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      </Card>
      <div className="space-y-8">
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
