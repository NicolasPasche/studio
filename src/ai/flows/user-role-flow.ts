'use server';
/**
 * @fileOverview Server actions to manage user role pre-registration.
 *
 * - preRegisterUserRole - A function that saves a user's intended role before they complete sign-up.
 */
import { z } from 'zod';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserRole } from '@/lib/auth';

const PreRegisterRoleInputSchema = z.object({
  email: z.string().email(),
  role: z.enum(['sales', 'admin', 'proposal', 'hr', 'dev']),
});

export type PreRegisterRoleInput = z.infer<typeof PreRegisterRoleInputSchema>;

export async function preRegisterUserRole(
  input: PreRegisterRoleInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const validatedInput = PreRegisterRoleInputSchema.parse(input);
    const roleDocRef = doc(db, 'user_roles', validatedInput.email);
    await setDoc(roleDocRef, { role: validatedInput.role });
    return { success: true };
  } catch (error) {
    console.error('Error in preRegisterUserRole action:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input.' };
    }
    // It's important not to expose detailed internal errors to the client.
    return { success: false, error: 'Failed to pre-register user role.' };
  }
}
