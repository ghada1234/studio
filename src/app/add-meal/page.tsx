'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

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
import { useDailyLog } from '@/hooks/use-daily-log';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Meal name must be at least 2 characters.',
  }),
  calories: z.coerce.number().min(0, { message: 'Calories must be positive.' }),
  protein: z.coerce.number().min(0, { message: 'Protein must be positive.' }),
  carbs: z.coerce.number().min(0, { message: 'Carbs must be positive.' }),
  fat: z.coerce.number().min(0, { message: 'Fat must be positive.' }),
});

export default function AddMealPage() {
  const router = useRouter();
  const { addMeal } = useDailyLog();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addMeal(values);
    toast({
      title: 'Meal Added!',
      description: `${values.name} has been added to your daily log.`,
    });
    router.push('/');
  }

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <header>
        <h1 className="font-headline text-4xl font-bold">Add Meal Manually</h1>
        <p className="text-muted-foreground">
          Log a meal by entering its nutritional information below.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Meal Details</CardTitle>
          <CardDescription>
            Enter the details for your meal, snack, or recipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Grilled Chicken Salad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories (kcal)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="250" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="carbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbohydrates (g)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat (g)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Add Meal to Log
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
