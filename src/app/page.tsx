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
import { useTranslation } from '@/hooks/use-translation';

export default function DashboardPage() {
  const { meals, calorieGoal, setCalorieGoal } = useDailyLog();
  const [goalInput, setGoalInput] = React.useState(calorieGoal.toString());
  const { t } = useTranslation();

  React.useEffect(() => {
    document.title = `${t('dashboard.title')} - NutriSnap`;
  }, [t]);

  const chartConfig = {
    calories: {
      label: t('dashboard.nutrients.calories'),
      color: 'hsl(var(--chart-1))',
    },
    protein: {
      label: t('dashboard.nutrients.protein'),
      color: 'hsl(var(--chart-2))',
    },
    carbs: {
      label: t('dashboard.nutrients.carbs'),
      color: 'hsl(var(--chart-3))',
    },
    fat: {
      label: t('dashboard.nutrients.fat'),
      color: 'hsl(var(--chart-4))',
    },
  } satisfies ChartConfig;

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
  const remainingCalories = Math.max(0, calorieGoal - totalCalories);

  const macroData = [
    { name: t('dashboard.nutrients.protein'), value: totalProtein, fill: 'var(--color-protein)' },
    { name: t('dashboard.nutrients.carbs'), value: totalCarbs, fill: 'var(--color-carbs)' },
    { name: t('dashboard.nutrients.fat'), value: totalFat, fill: 'var(--color-fat)' },
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
        <h1 className="font-headline text-4xl font-bold">{t('dashboard.header')}</h1>
        <p className="text-muted-foreground">{t('dashboard.description')}</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">
              {t('dashboard.calorieCard.title')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.calorieCard.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder={t('dashboard.calorieCard.placeholder')}
                className="max-w-xs"
              />
              <Button onClick={handleSetGoal}>{t('dashboard.calorieCard.button')}</Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span>{t('dashboard.calorieCard.consumed', { consumed: Math.round(totalCalories)})}</span>
                <span className="font-bold text-primary">
                  {t('dashboard.calorieCard.remaining', {
                    remaining: Math.round(remainingCalories),
                  })}
                </span>
                <span className="text-muted-foreground">
                  {t('dashboard.calorieCard.goal', {goal: calorieGoal})}
                </span>
              </div>
              <Progress
                value={calorieProgress}
                aria-label={t('dashboard.calorieCard.progressLabel', {progress: calorieProgress.toFixed(0)})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('dashboard.macroCard.title')}</CardTitle>
            <CardDescription>{t('dashboard.macroCard.description')}</CardDescription>
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
                  width={80}
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
              {t('dashboard.microCard.title')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.microCard.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-3 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.nutrients.fiber')}</p>
                <p className="font-medium">{totalFiber.toFixed(1)} {t('dashboard.units.g')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.nutrients.sugar')}</p>
                <p className="font-medium">{totalSugar.toFixed(1)} {t('dashboard.units.g')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.nutrients.sodium')}</p>
                <p className="font-medium">{totalSodium.toFixed(0)} {t('dashboard.units.mg')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.nutrients.potassium')}</p>
                <p className="font-medium">{totalPotassium.toFixed(0)} {t('dashboard.units.mg')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.nutrients.calcium')}</p>
                <p className="font-medium">{totalCalcium.toFixed(0)} {t('dashboard.units.mg')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.nutrients.iron')}</p>
                <p className="font-medium">{totalIron.toFixed(1)} {t('dashboard.units.mg')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.nutrients.vitaminA')}</p>
                <p className="font-medium">{totalVitaminA.toFixed(0)} {t('dashboard.units.mcg')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.nutrients.vitaminC')}</p>
                <p className="font-medium">{totalVitaminC.toFixed(0)} {t('dashboard.units.mg')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.nutrients.vitaminD')}</p>
                <p className="font-medium">{totalVitaminD.toFixed(0)} {t('dashboard.units.mcg')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">{t('dashboard.loggedMealsCard.title')}</CardTitle>
            <CardDescription>
             {t('dashboard.loggedMealsCard.description')}
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
                            {t('dashboard.loggedMealsCard.mealDetails', {calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat})}
                          </p>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-9 p-0">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">{t('dashboard.loggedMealsCard.toggle')}</span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent>
                        <div className="border-t px-4 py-2">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                            <span className="text-muted-foreground">{t('dashboard.nutrients.fiber')}:</span><span className="text-left font-medium rtl:text-right">{meal.fiber?.toFixed(1) ?? t('dashboard.nutrients.not_available')} {t('dashboard.units.g')}</span>
                            <span className="text-muted-foreground">{t('dashboard.nutrients.sugar')}:</span><span className="text-left font-medium rtl:text-right">{meal.sugar?.toFixed(1) ?? t('dashboard.nutrients.not_available')} {t('dashboard.units.g')}</span>
                            <span className="text-muted-foreground">{t('dashboard.nutrients.sodium')}:</span><span className="text-left font-medium rtl:text-right">{meal.sodium?.toFixed(0) ?? t('dashboard.nutrients.not_available')} {t('dashboard.units.mg')}</span>
                            <span className="text-muted-foreground">{t('dashboard.nutrients.potassium')}:</span><span className="text-left font-medium rtl:text-right">{meal.potassium?.toFixed(0) ?? t('dashboard.nutrients.not_available')} {t('dashboard.units.mg')}</span>
                            <span className="text-muted-foreground">{t('dashboard.nutrients.calcium')}:</span><span className="text-left font-medium rtl:text-right">{meal.calcium?.toFixed(0) ?? t('dashboard.nutrients.not_available')} {t('dashboard.units.mg')}</span>
                            <span className="text-muted-foreground">{t('dashboard.nutrients.iron')}:</span><span className="text-left font-medium rtl:text-right">{meal.iron?.toFixed(1) ?? t('dashboard.nutrients.not_available')} {t('dashboard.units.mg')}</span>
                            <span className="text-muted-foreground">{t('dashboard.nutrients.vitaminA')}:</span><span className="text-left font-medium rtl:text-right">{meal.vitaminA?.toFixed(0) ?? t('dashboard.nutrients.not_available')} {t('dashboard.units.mcg')}</span>
                            <span className="text-muted-foreground">{t('dashboard.nutrients.vitaminC')}:</span><span className="text-left font-medium rtl:text-right">{meal.vitaminC?.toFixed(0) ?? t('dashboard.nutrients.not_available')} {t('dashboard.units.mg')}</span>
                            <span className="text-muted-foreground">{t('dashboard.nutrients.vitaminD')}:</span><span className="text-left font-medium rtl:text-right">{meal.vitaminD?.toFixed(0) ?? t('dashboard.nutrients.not_available')} {t('dashboard.units.mcg')}</span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </li>
                  </Collapsible>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>{t('dashboard.loggedMealsCard.empty')}</p>
                <p>{t('dashboard.loggedMealsCard.empty_cta')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
