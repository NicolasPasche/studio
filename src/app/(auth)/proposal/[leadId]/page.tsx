'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Lead } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Building, User, Mail, Phone, Send, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function CreateProposalPage() {
  const params = useParams();
  const leadId = params.leadId as string;
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (leadId) {
      const fetchLead = async () => {
        try {
          const leadDocRef = doc(db, 'leads', leadId);
          const leadDoc = await getDoc(leadDocRef);
          if (leadDoc.exists()) {
            const leadData = { id: leadDoc.id, ...leadDoc.data() } as Lead;
            setLead(leadData);
            setProposal(leadData.proposalContent || '');
          } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Lead not found.' });
          }
        } catch (error) {
          console.error("Error fetching lead:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch lead data.' });
        } finally {
          setLoading(false);
        }
      };
      fetchLead();
    }
  }, [leadId, toast]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const leadDocRef = doc(db, 'leads', leadId);
      await updateDoc(leadDocRef, {
        proposalContent: proposal,
      });
      toast({ title: "Draft Saved!", description: "Your proposal draft has been saved successfully." });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save draft.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitProposal = async () => {
    if (!user || !lead) {
      toast({ variant: "destructive", title: "Error", description: "User or lead data is missing." });
      return;
    }
    setIsSubmitting(true);
    try {
      const leadDocRef = doc(db, 'leads', leadId);
      await updateDoc(leadDocRef, {
        proposalContent: proposal,
        status: 'Proposal Sent',
      });

      await addDoc(collection(db, 'activities'), {
        type: 'Proposal Sent',
        description: `Proposal sent for ${lead.company}.`,
        timestamp: serverTimestamp(),
        userId: user.email,
        userName: user.name,
      });

      toast({ title: "Proposal Submitted!", description: "The proposal has been sent for review." });
      router.push('/opportunities');
    } catch (error) {
      console.error("Error submitting proposal:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit proposal.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <ProposalSkeleton />;
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card>
          <CardHeader>
            <CardTitle>Lead Not Found</CardTitle>
            <CardDescription>The requested lead could not be found.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
            <CardDescription>Details for the proposal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{lead.company}</span>
            </div>
            <Separator />
             <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{lead.contactName}</span>
            </div>
             <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{lead.email}</span>
            </div>
            {lead.phone && (
                 <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{lead.phone}</span>
                </div>
            )}
            <Separator />
             <div>
                <h4 className="font-medium text-sm mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{lead.notes || "No notes provided."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
         <Card>
            <CardHeader>
                <CardTitle>Proposal Generation</CardTitle>
                <CardDescription>Generate and refine the proposal for {lead.company}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="proposal-content">Proposal Content</Label>
                    <Textarea 
                        id="proposal-content"
                        placeholder="Start writing the proposal here..."
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                        rows={15}
                        disabled={isSaving || isSubmitting}
                     />
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                 <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving || isSubmitting}>
                   {isSaving ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Saving...
                     </>
                   ) : (
                     <>
                       <Save className="mr-2 h-4 w-4" />
                       Save Draft
                     </>
                   )}
                 </Button>
                 <Button onClick={handleSubmitProposal} disabled={isSaving || isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Submit Proposal
                        </>
                    )}
                </Button>
            </CardFooter>
         </Card>
      </div>
    </div>
  );
}

function ProposalSkeleton() {
    return (
         <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Separator />
                        <Skeleton className="h-5 w-5/6" />
                        <Skeleton className="h-5 w-4/6" />
                        <Separator />
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
            </div>
             <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Skeleton className="h-10 w-32" />
                    </CardFooter>
                </Card>
            </div>
         </div>
    )
}
