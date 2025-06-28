'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();

  React.useEffect(() => {
    document.title = `${t('profile.title')} - NutriSnap`;
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router, t]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: t('profile.toast.logout_success_title'),
        description: t('profile.toast.logout_success_description'),
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: t('profile.toast.logout_error_title'),
        description: t('profile.toast.logout_error_description'),
        variant: 'destructive',
      });
    }
  };
  
  if (loading || !user) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8 items-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t('profile.card.title')}</CardTitle>
          <CardDescription>{t('profile.card.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{t('profile.form.email')}</p>
            <p>{user.email}</p>
          </div>
           <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{t('profile.form.uid')}</p>
            <p className="text-xs">{user.uid}</p>
          </div>
          <Button onClick={handleLogout} className="w-full" variant="destructive">
            {t('profile.form.logout_button')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
