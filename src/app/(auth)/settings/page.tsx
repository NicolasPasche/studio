"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storage, db, auth } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";


export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isPushLoading, setIsPushLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const syncPermissions = useCallback(() => {
    if (!('Notification' in window)) {
        setIsPushLoading(false);
        return;
    }
    const currentPermission = Notification.permission;
    setPushPermission(currentPermission);
    setIsPushEnabled(currentPermission === 'granted');
    setIsPushLoading(false);
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !auth.currentUser) return;

    // Validate file type
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please select a PNG or JPG image.",
        });
        return;
    }

    setIsUploading(true);
    try {
        const avatarRef = storageRef(storage, `avatars/${auth.currentUser.uid}`);
        const snapshot = await uploadBytes(avatarRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Update user's auth profile
        await updateProfile(auth.currentUser, { photoURL: downloadURL });
        
        // Update user's document in Firestore
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, { avatar: downloadURL });

        // Update local state via context to reflect change immediately
        updateUser({ avatar: downloadURL });

        toast({
            title: "Profile Photo Updated",
            description: "Your new photo has been saved.",
        });
    } catch (error) {
        console.error("Error uploading photo:", error);
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "There was an error updating your photo. Please try again.",
        });
    } finally {
        setIsUploading(false);
    }
  };


  useEffect(() => {
    syncPermissions();

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            syncPermissions();
        }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncPermissions]);

  const handlePushToggle = async (checked: boolean) => {
    if (isPushLoading) return;

    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        toast({
            variant: "destructive",
            title: "Unsupported Browser",
            description: "This browser does not support push notifications.",
        });
        return;
    }

    if (checked) {
        const permission = await Notification.requestPermission();
        setPushPermission(permission);
        if (permission === 'granted') {
            setIsPushEnabled(true);
            toast({
                title: "Notifications Enabled!",
                description: "You'll now receive updates on this device.",
            });
            // In a full implementation, you'd register a service worker
            // and save the push subscription to your database here.
        } else {
            setIsPushEnabled(false);
            if (permission === 'denied') {
              toast({
                  variant: "destructive",
                  title: "Permission Denied",
                  description: "To get notifications, please enable them in your browser settings.",
              });
            }
        }
    } else {
        // In a full implementation, you would unsubscribe the user here.
        setIsPushEnabled(false);
        toast({
            title: "Notifications Disabled",
            description: "You will no longer receive push notifications on this device.",
        });
    }
  };
  
  if (!user) {
    return (
       <div className="grid gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
        </Card>
        <Skeleton className="h-96 w-full" />
       </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your account settings and preferences.</CardDescription>
        </CardHeader>
      </Card>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg"
                  disabled={isUploading}
                />
                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    'Change Photo'
                  )}
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} disabled />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                  <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                    <span>Email Notifications</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Receive notifications about new leads and tasks via email.
                    </span>
                  </Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                  <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                    <span>Push Notifications</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Get real-time alerts on your devices.
                    </span>
                  </Label>
                  <Switch 
                    id="push-notifications"
                    checked={isPushEnabled}
                    onCheckedChange={handlePushToggle}
                    disabled={isPushLoading || pushPermission === 'denied'}
                  />
                </div>
                 {pushPermission === 'denied' && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Notifications Blocked</AlertTitle>
                    <AlertDescription>
                      You have blocked push notifications. To use this feature, you must enable them in your browser settings.
                    </AlertDescription>
                  </Alert>
                )}
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Manage your language and region settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (Default)</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
