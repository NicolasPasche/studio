
'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
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
                <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20 flex-shrink-0">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold leading-none tracking-tight">{user.name}</h2>
                        <p className="text-sm text-muted-foreground">{roleDisplayNames[user.role]}</p>
                    </div>
                </div>

                <div className="pt-2">
                    <Separator />
                    <div className="prose prose-sm dark:prose-invert mt-4 text-muted-foreground max-w-none">
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
