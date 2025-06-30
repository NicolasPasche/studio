'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Lead, Pipeline } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const pipelineStages: (keyof Pipeline)[] = [
  'New Lead',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
];

export default function OpportunitiesPage() {
  const [pipeline, setPipeline] = useState<Pipeline>({
    'New Lead': [],
    Qualified: [],
    'Proposal Sent': [],
    Negotiation: [],
    Won: [],
  });
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <OpportunitiesSkeleton />;
  }

  return (
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
