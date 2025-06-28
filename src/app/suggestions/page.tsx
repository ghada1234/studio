'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { suggestMeals } from '@/ai/flows/suggest-meals';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Loader2, Sparkles, Utensils } from 'lucide-react';
import type { SuggestMealsOutput } from '@/ai/flows/suggest-meals';
import { useDailyLog } from '@/hooks/use-daily-log';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@/hooks/use-translation';

const getFormSchema = (t: (key: string) => string) =>
  z.object({
    dietaryPreferences: z.string().min(2, {
      message: t('suggestions.validation.dietaryPreferences'),
    }),
    nutrientNeeds: z
      .string()
      .min(2, { message: t('suggestions.validation.nutrientNeeds') }),
    dislikedIngredients: z.string().optional(),
    numberOfMeals: z.coerce.number().min(1).max(10),
    useRemainingCalories: z.boolean().default(false),
  });

export default function SuggestionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestMealsOutput | null>(null);
  const { toast } = useToast();
  const { meals, calorieGoal } = useDailyLog();
  const { t } = useTranslation();
  
  React.useEffect(() => {
    document.title = `${t('suggestions.title')} - NutriSnap`;
  }, [t]);

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const remainingCalories = Math.max(0, calorieGoal - totalCalories);
  
  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietaryPreferences: t('suggestions.defaults.dietaryPreferences'),
      nutrientNeeds: t('suggestions.defaults.nutrientNeeds'),
      dislikedIngredients: '',
      numberOfMeals: 3,
      useRemainingCalories: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const suggestionResult = await suggestMeals({
        ...values,
        remainingCalories: values.useRemainingCalories
          ? remainingCalories
          : undefined,
      });
      setResult(suggestionResult);
    } catch (error) {
      console.error('Suggestion failed:', error);
      toast({
        title: t('suggestions.toast.error_title'),
        description: t('suggestions.toast.error_description'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <header>
        <h1 className="font-headline text-4xl font-bold">
          {t('suggestions.header')}
        </h1>
        <p className="text-muted-foreground">{t('suggestions.description')}</p>
      </header>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('suggestions.preferencesCard.title')}</CardTitle>
            <CardDescription>
              {t('suggestions.preferencesCard.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="dietaryPreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('suggestions.form.dietaryPreferences')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('suggestions.form.dietaryPreferences_placeholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nutrientNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('suggestions.form.nutrientNeeds')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('suggestions.form.nutrientNeeds_placeholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dislikedIngredients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('suggestions.form.dislikedIngredients')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('suggestions.form.dislikedIngredients_placeholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('suggestions.form.dislikedIngredients_description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfMeals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('suggestions.form.numberOfSuggestions')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="useRemainingCalories"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 rtl:space-x-reverse space-y-0 rounded-md border bg-muted/20 p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="use-remaining"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel htmlFor="use-remaining">
                          {t('suggestions.form.useRemainingCalories')}
                        </FormLabel>
                        <FormDescription>
                          {t('suggestions.form.useRemainingCalories_description', {calories: remainingCalories.toFixed(0)})}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? t('suggestions.form.button_loading') : t('suggestions.form.button')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('suggestions.resultsCard.title')}</CardTitle>
            <CardDescription>
              {t('suggestions.resultsCard.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-2 pt-10 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>{t('suggestions.resultsCard.loading')}</p>
              </div>
            )}
            {result ? (
              <ul className="space-y-3">
                {result.meals.map((meal, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Utensils className="h-5 w-5 flex-shrink-0 text-accent" />
                    <span>{meal}</span>
                  </li>
                ))}
              </ul>
            ) : (
              !isLoading && (
                <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                  <p>{t('suggestions.resultsCard.placeholder')}</p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
