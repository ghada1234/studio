'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDailyLog } from '@/hooks/use-daily-log';
import { Progress } from '@/components/ui/progress';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronsUpDown } from 'lucide-react';

const chartConfig = {
  calories: {
    label: 'السعرات الحرارية',
    color: 'hsl(var(--chart-1))',
  },
  protein: {
    label: 'بروتين',
    color: 'hsl(var(--chart-2))',
  },
  carbs: {
    label: 'كربوهيدرات',
    color: 'hsl(var(--chart-3))',
  },
  fat: {
    label: 'دهون',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { meals, calorieGoal, setCalorieGoal } = useDailyLog();
  const [goalInput, setGoalInput] = React.useState(calorieGoal.toString());

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);
  const totalFiber = meals.reduce((sum, meal) => sum + (meal.fiber || 0), 0);
  const totalSugar = meals.reduce((sum, meal) => sum + (meal.sugar || 0), 0);
  const totalSodium = meals.reduce((sum, meal) => sum + (meal.sodium || 0), 0);
  const totalPotassium = meals.reduce(
    (sum, meal) => sum + (meal.potassium || 0),
    0
  );
  const totalCalcium = meals.reduce(
    (sum, meal) => sum + (meal.calcium || 0),
    0
  );
  const totalIron = meals.reduce((sum, meal) => sum + (meal.iron || 0), 0);
  const totalVitaminA = meals.reduce(
    (sum, meal) => sum + (meal.vitaminA || 0),
    0
  );
  const totalVitaminC = meals.reduce(
    (sum, meal) => sum + (meal.vitaminC || 0),
    0
  );
  const totalVitaminD = meals.reduce(
    (sum, meal) => sum + (meal.vitaminD || 0),
    0
  );

  const calorieProgress =
    calorieGoal > 0 ? (totalCalories / calorieGoal) * 100 : 0;

  const macroData = [
    { name: 'بروتين', value: totalProtein, fill: 'var(--color-protein)' },
    { name: 'كربوهيدرات', value: totalCarbs, fill: 'var(--color-carbs)' },
    { name: 'دهون', value: totalFat, fill: 'var(--color-fat)' },
  ];

  const handleSetGoal = () => {
    const newGoal = parseInt(goalInput, 10);
    if (!isNaN(newGoal) && newGoal > 0) {
      setCalorieGoal(newGoal);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <header>
        <h1 className="font-headline text-4xl font-bold">لوحة التحكم اليومية</h1>
        <p className="text-muted-foreground">
          إليك ملخصك الغذائي لهذا اليوم.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">هدف السعرات الحرارية</CardTitle>
            <CardDescription>
              حدد هدفك اليومي من السعرات الحرارية وتتبع تقدمك.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="مثال: 2000"
                className="max-w-xs"
              />
              <Button onClick={handleSetGoal}>تحديد الهدف</Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span>{`استهلكت ${Math.round(totalCalories)} سعرة حرارية`}</span>
                <span className="text-muted-foreground">
                  {`الهدف ${calorieGoal} سعرة حرارية`}
                </span>
              </div>
              <Progress
                value={calorieProgress}
                aria-label={`${calorieProgress.toFixed(0)}% من هدف السعرات الحرارية`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">المغذيات الكبرى</CardTitle>
            <CardDescription>إجمالي الجرامات المستهلكة اليوم.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-48 w-full">
              <BarChart
                data={macroData}
                layout="vertical"
                margin={{ right: 10, left: 10 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  width={60}
                  reversed
                />
                <XAxis type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="value" radius={5} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">
              ملخص المغذيات الدقيقة
            </CardTitle>
            <CardDescription>
              إجمالي المغذيات الدقيقة المستهلكة اليوم.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-3 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">ألياف</p>
                <p className="font-medium">{totalFiber.toFixed(1)} غ</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">سكر</p>
                <p className="font-medium">{totalSugar.toFixed(1)} غ</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">صوديوم</p>
                <p className="font-medium">{totalSodium.toFixed(0)} ملغ</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">بوتاسيوم</p>
                <p className="font-medium">{totalPotassium.toFixed(0)} ملغ</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">كالسيوم</p>
                <p className="font-medium">{totalCalcium.toFixed(0)} ملغ</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">حديد</p>
                <p className="font-medium">{totalIron.toFixed(1)} ملغ</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">فيتامين أ</p>
                <p className="font-medium">{totalVitaminA.toFixed(0)} مكغ</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">فيتامين ج</p>
                <p className="font-medium">{totalVitaminC.toFixed(0)} ملغ</p>
              </div>
               <div>
                <p className="text-sm text-muted-foreground">فيتامين د</p>
                <p className="font-medium">{totalVitaminD.toFixed(0)} مكغ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">الوجبات المسجلة</CardTitle>
            <CardDescription>
              جميع وجباتك ووجباتك الخفيفة لهذا اليوم. انقر للتوسيع.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {meals.length > 0 ? (
              <ul className="space-y-4">
                {meals.map((meal) => (
                  <Collapsible asChild key={meal.id}>
                    <li className="rounded-lg border">
                      <div className="flex items-center p-4">
                        <div className="flex-1">
                          <p className="font-semibold">{meal.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {meal.calories} سعرة حرارية &bull; ب: {meal.protein}غ &bull;
                            ك: {meal.carbs}غ &bull; د: {meal.fat}غ
                          </p>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-9 p-0">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">تبديل</span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent>
                        <div className="border-t px-4 py-2">
                           <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                              <span className="text-muted-foreground">ألياف:</span><span className="text-left font-medium">{meal.fiber?.toFixed(1) ?? 'غير متاح'} غ</span>
                              <span className="text-muted-foreground">سكر:</span><span className="text-left font-medium">{meal.sugar?.toFixed(1) ?? 'غير متاح'} غ</span>
                              <span className="text-muted-foreground">صوديوم:</span><span className="text-left font-medium">{meal.sodium?.toFixed(0) ?? 'غير متاح'} ملغ</span>
                              <span className="text-muted-foreground">بوتاسيوم:</span><span className="text-left font-medium">{meal.potassium?.toFixed(0) ?? 'غير متاح'} ملغ</span>
                              <span className="text-muted-foreground">كالسيوم:</span><span className="text-left font-medium">{meal.calcium?.toFixed(0) ?? 'غير متاح'} ملغ</span>
                              <span className="text-muted-foreground">حديد:</span><span className="text-left font-medium">{meal.iron?.toFixed(1) ?? 'غير متاح'} ملغ</span>
                              <span className="text-muted-foreground">فيتامين أ:</span><span className="text-left font-medium">{meal.vitaminA?.toFixed(0) ?? 'غير متاح'} مكغ</span>
                              <span className="text-muted-foreground">فيتامين ج:</span><span className="text-left font-medium">{meal.vitaminC?.toFixed(0) ?? 'غير متاح'} ملغ</span>
                              <span className="text-muted-foreground">فيتامين د:</span><span className="text-left font-medium">{meal.vitaminD?.toFixed(0) ?? 'غير متاح'} ملغ</span>
                           </div>
                        </div>
                      </CollapsibleContent>
                    </li>
                  </Collapsible>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>لم يتم تسجيل أي وجبات بعد.</p>
                <p>أضف وجبة يدويًا أو حلل صورة للبدء!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
