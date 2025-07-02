
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { UserRole } from "@/lib/auth";
import { roleDisplayNames } from "@/lib/auth";

export type ProfileDialogUser = {
  name: string;
  role: UserRole;
  avatar?: string;
  initials?: string;
  readme?: string;
}

export function UserProfileDialog({ user, isOpen, onOpenChange }: { user: ProfileDialogUser | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="items-center text-center">
                    <Avatar className="h-20 w-20 mb-4">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <DialogTitle className="text-2xl">{user.name}</DialogTitle>
                    <DialogDescription>{roleDisplayNames[user.role]}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Separator />
                    <div className="prose prose-sm dark:prose-invert mx-auto mt-4 text-center text-muted-foreground max-w-none">
                       <p className="whitespace-pre-wrap">{user.readme || "This user hasn't written a readme yet."}</p>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
