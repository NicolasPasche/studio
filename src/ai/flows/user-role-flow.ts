'use server';
/**
 * @fileOverview A flow to manage user role pre-registration.
 *
 * - preRegisterUserRole - A function that saves a user's intended role before they complete sign-up.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserRole } from '@/lib/auth';

const PreRegisterRoleInputSchema = z.object({
  email: z.string().email(),
  role: z.enum(['sales', 'admin', 'proposal', 'hr', 'dev']),
});

export type PreRegisterRoleInput = z.infer<typeof PreRegisterRoleInputSchema>;

export async function preRegisterUserRole(input: PreRegisterRoleInput): Promise<{success: boolean}> {
    return preRegisterUserRoleFlow(input);
}

const preRegisterUserRoleFlow = ai.defineFlow(
  {
    name: 'preRegisterUserRoleFlow',
    inputSchema: PreRegisterRoleInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async ({ email, role }) => {
    try {
      const roleDocRef = doc(db, 'user_roles', email);
      await setDoc(roleDocRef, { role });
      return { success: true };
    } catch (error) {
      console.error('Error in preRegisterUserRoleFlow:', error);
      // It's important not to expose detailed internal errors to the client.
      throw new Error('Failed to pre-register user role.');
    }
  }
);
