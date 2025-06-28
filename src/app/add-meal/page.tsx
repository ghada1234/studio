'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { useDailyLog } from '@/hooks/use-daily-log';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'يجب أن يتكون اسم الوجبة من حرفين على الأقل.',
  }),
  calories: z.coerce.number().min(0, { message: 'يجب أن تكون السعرات الحرارية موجبة.' }),
  protein: z.coerce.number().min(0, { message: 'يجب أن يكون البروتين موجبًا.' }),
  carbs: z.coerce.number().min(0, { message: 'يجب أن تكون الكربوهيدرات موجبة.' }),
  fat: z.coerce.number().min(0, { message: 'يجب أن تكون الدهون موجبة.' }),
  fiber: z.coerce.number().min(0).optional(),
  sugar: z.coerce.number().min(0).optional(),
  sodium: z.coerce.number().min(0).optional(),
  potassium: z.coerce.number().min(0).optional(),
  calcium: z.coerce.number().min(0).optional(),
  iron: z.coerce.number().min(0).optional(),
  vitaminA: z.coerce.number().min(0).optional(),
  vitaminC: z.coerce.number().min(0).optional(),
  vitaminD: z.coerce.number().min(0).optional(),
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
      fiber: 0,
      sugar: 0,
      sodium: 0,
      potassium: 0,
      calcium: 0,
      iron: 0,
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addMeal(values);
    toast({
      title: 'تمت إضافة الوجبة!',
      description: `تمت إضافة ${values.name} إلى سجلك اليومي.`,
    });
    router.push('/');
  }

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <header>
        <h1 className="font-headline text-4xl font-bold">إضافة وجبة يدوياً</h1>
        <p className="text-muted-foreground">
          سجل وجبة عن طريق إدخال معلوماتها الغذائية أدناه.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">تفاصيل الوجبة</CardTitle>
          <CardDescription>
            أدخل تفاصيل وجبتك أو وجبتك الخفيفة أو وصفتك.
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
                    <FormLabel>اسم الوجبة</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="مثال: سلطة دجاج مشوي"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="text-lg font-medium leading-none">
                  المغذيات الكبرى
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السعرات الحرارية (kcal)</FormLabel>
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
                        <FormLabel>بروتين (غ)</FormLabel>
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
                        <FormLabel>كربوهيدرات (غ)</FormLabel>
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
                        <FormLabel>دهون (غ)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="15" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fiber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ألياف (غ)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sugar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سكر (غ)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="text-lg font-medium leading-none">
                  المغذيات الدقيقة
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="sodium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>صوديوم (ملغ)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="potassium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>بوتاسيوم (ملغ)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="300" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="calcium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كالسيوم (ملغ)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iron"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حديد (ملغ)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vitaminA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>فيتامين أ (مكغ)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="150" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vitaminC"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>فيتامين ج (ملغ)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vitaminD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>فيتامين د (مكغ)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                إضافة وجبة إلى السجل
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
