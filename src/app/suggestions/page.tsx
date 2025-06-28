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

const formSchema = z.object({
  dietaryPreferences: z.string().min(2, {
    message: 'Please enter your dietary preferences.',
  }),
  nutrientNeeds: z
    .string()
    .min(2, { message: 'Please enter your nutrient needs.' }),
  dislikedIngredients: z.string().optional(),
  numberOfMeals: z.coerce.number().min(1).max(10),
});

export default function SuggestionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestMealsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietaryPreferences: 'Anything',
      nutrientNeeds: 'High protein',
      dislikedIngredients: '',
      numberOfMeals: 3,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const suggestionResult = await suggestMeals(values);
      setResult(suggestionResult);
    } catch (error) {
      console.error('Suggestion failed:', error);
      toast({
        title: 'Suggestion Failed',
        description:
          'Could not get meal suggestions. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <header>
        <h1 className="font-headline text-4xl font-bold">AI Meal Suggestions</h1>
        <p className="text-muted-foreground">
          Stuck on what to eat? Get personalized meal ideas from our AI chef.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Your Preferences</CardTitle>
            <CardDescription>
              Tell us what you&apos;re looking for in a meal.
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
                      <FormLabel>Dietary Preferences</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Vegetarian, Low-FODMAP" {...field} />
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
                      <FormLabel>Nutrient Needs</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., High fiber, Low carb" {...field} />
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
                      <FormLabel>Disliked Ingredients (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cilantro, Mushrooms" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of ingredients to avoid.
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
                      <FormLabel>Number of Suggestions</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Generating...' : 'Get Suggestions'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Meal Ideas</CardTitle>
            <CardDescription>
              Here are some suggestions from our AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-2 pt-10 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Cooking up some ideas...</p>
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
                  <p>Your meal suggestions will appear here.</p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
