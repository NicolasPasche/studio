'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const leadSchema = z.object({
  contactName: z.string().min(2, { message: 'Contact name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  company: z.string().min(1, { message: 'Company name is required.' }),
  phone: z.string().optional(),
  source: z.string().min(1, { message: 'Please select a lead source.' }),
  notes: z.string().optional(),
  type: z.enum(['Scaffolding', 'Formwork']),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function LeadCapturePage() {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Lead Capture</CardTitle>
        <CardDescription>
          Enter details for a new sales lead. Scaffolding leads are routed to
          Admin, Formwork leads to Proposal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scaffolding" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scaffolding">Scaffolding Lead</TabsTrigger>
            <TabsTrigger value="formwork">Formwork Lead</TabsTrigger>
          </TabsList>
          <TabsContent value="scaffolding">
            <LeadForm type="Scaffolding" />
          </TabsContent>
          <TabsContent value="formwork">
            <LeadForm type="Formwork" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function LeadForm({ type }: { type: 'Scaffolding' | 'Formwork' }) {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      contactName: '',
      email: '',
      company: '',
      phone: '',
      source: '',
      notes: '',
      type: type,
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LeadFormValues) {
    try {
      await addDoc(collection(db, 'leads'), {
        ...values,
        status: 'New Lead', // Initial status
        createdAt: new Date(),
      });
      toast({
        title: 'Lead Submitted!',
        description: `The ${type} lead for ${values.company} has been created.`,
      });
      router.push('/opportunities');
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not save the lead. Please try again.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john.doe@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="Innovate Corp." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="(123) 456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Source</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="cold-call">Cold Call</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <Label>Lead Type</Label>
            <Input value={type} disabled />
          </div>
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any relevant notes about the lead..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Lead'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
