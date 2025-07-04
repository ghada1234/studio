'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { Loader2 } from 'lucide-react';

const getFormSchema = (t: (key: string) => string) =>
  z
    .object({
      email: z.string().email({ message: t('register.validation.email') }),
      password: z
        .string()
        .min(8, { message: t('register.validation.password') }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('register.validation.confirmPassword'),
      path: ['confirmPassword'],
    });

export default function RegisterPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    document.title = `${t('register.title')} - NutriSnap`;
  }, [t]);

  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await signup(values.email, values.password);
      toast({
        title: t('register.toast.success_title'),
        description: t('register.toast.success_description'),
      });
      router.push('/');
    } catch (error: any) {
      console.error('Registration failed:', error);
      let errorMessage = t('register.toast.error_description_generic');
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = t('register.toast.error_email_in_use');
      }
      toast({
        title: t('register.toast.error_title'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            {t('register.card.title')}
          </CardTitle>
          <CardDescription>{t('register.card.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.form.email')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('register.form.email_placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.form.password')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.form.confirmPassword')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('register.form.button')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
