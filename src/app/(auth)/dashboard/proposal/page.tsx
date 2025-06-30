'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
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

export default function ProposalDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'leads'),
      where('type', '==', 'Formwork')
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
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Proposal Team Dashboard</CardTitle>
          <CardDescription>
            Leads assigned for proposal creation.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
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
                    No formwork leads assigned.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.company}</TableCell>
                    <TableCell>{lead.contactName}</TableCell>
                    <TableCell>
                      {lead.createdAt?.seconds
                        ? formatDistanceToNow(
                            new Date(lead.createdAt.seconds * 1000),
                            { addSuffix: true }
                          )
                        : 'Recently'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          lead.status === 'New Lead' ? 'destructive' : 'default'
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
    </div>
  );
}
