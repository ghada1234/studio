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

const formSchema = z.object({
  dietaryPreferences: z.string().min(2, {
    message: 'الرجاء إدخال تفضيلاتك الغذائية.',
  }),
  nutrientNeeds: z
    .string()
    .min(2, { message: 'الرجاء إدخال احتياجاتك الغذائية.' }),
  dislikedIngredients: z.string().optional(),
  numberOfMeals: z.coerce.number().min(1).max(10),
  useRemainingCalories: z.boolean().default(false),
});

export default function SuggestionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestMealsOutput | null>(null);
  const { toast } = useToast();
  const { meals, calorieGoal } = useDailyLog();

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const remainingCalories = Math.max(0, calorieGoal - totalCalories);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietaryPreferences: 'أي شيء',
      nutrientNeeds: 'بروتين عالي',
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
        title: 'فشل الاقتراح',
        description:
          'تعذر الحصول على اقتراحات الوجبات. يرجى المحاولة مرة أخرى لاحقًا.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <header>
        <h1 className="font-headline text-4xl font-bold">اقتراحات وجبات الذكاء الاصطناعي</h1>
        <p className="text-muted-foreground">
          محتار ماذا تأكل؟ احصل على أفكار وجبات مخصصة من طاهينا الذكي.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">تفضيلاتك</CardTitle>
            <CardDescription>
              أخبرنا بما تبحث عنه في الوجبة.
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
                      <FormLabel>التفضيلات الغذائية</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: نباتي، قليل الفودماب"
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
                      <FormLabel>الاحتياجات الغذائية</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: عالي الألياف، قليل الكربوهيدرات"
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
                      <FormLabel>مكونات غير محببة (اختياري)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: كزبرة، فطر"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        قائمة بالمكونات التي يجب تجنبها مفصولة بفواصل.
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
                      <FormLabel>عدد الاقتراحات</FormLabel>
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border bg-muted/20 p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="use-remaining"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel htmlFor="use-remaining">
                          بناءً على السعرات الحرارية المتبقية
                        </FormLabel>
                        <FormDescription>
                          اقترح وجبات تناسب السعرات الحرارية المتبقية{' '}
                          <span className="font-bold text-primary">
                            {remainingCalories.toFixed(0)} سعرة حرارية
                          </span>
                          .
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
                  {isLoading ? 'جاري الإنشاء...' : 'الحصول على اقتراحات'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">أفكار وجبات</CardTitle>
            <CardDescription>
              إليك بعض الاقتراحات من ذكائنا الاصطناعي.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-2 pt-10 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>جاري تحضير بعض الأفكار...</p>
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
                  <p>ستظهر اقتراحات وجباتك هنا.</p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
