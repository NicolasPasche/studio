'use client';

import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Lead } from '@/lib/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { RecentActivities } from '@/components/recent-activities';

export default function ProposalDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(
      collection(db, 'leads'),
      where('type', '==', 'Formwork'),
      where('status', '==', 'Qualified')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const leadsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Lead[];
        setLeads(leadsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching leads:', error);
        // Check if the error is a permission denied error about an index
        if (
          error.message.includes('requires an index') ||
          error.message.includes('permission-denied')
        ) {
          const firestoreLinkRegex = /(https?:\/\/[^\s]+)/;
          const match = error.message.match(firestoreLinkRegex);
          if (match) {
            toast({
              variant: 'destructive',
              title: 'Database Index Required',
              description: (
                <span>
                  Please create a composite index in Firestore to view this
                  page.
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
            description: 'Could not fetch leads.',
          });
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Proposal Engineering Dashboard</CardTitle>
          <CardDescription>
            Qualified leads that are ready for proposal creation.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Assigned Formwork Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <p>Loading leads...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No qualified formwork leads assigned.
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.company}
                      </TableCell>
                      <TableCell>{lead.contactName}</TableCell>
                      <TableCell>
                        {lead.createdAt
                          ? formatDistanceToNow(
                              lead.createdAt.toDate(),
                              { addSuffix: true }
                            )
                          : 'Recently'}
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
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/proposal/${lead.id}`}>
                            Create Proposal
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <RecentActivities />
      </div>
    </div>
  );
}
