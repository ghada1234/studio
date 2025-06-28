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
    label: 'Calories',
    color: 'hsl(var(--chart-1))',
  },
  protein: {
    label: 'Protein',
    color: 'hsl(var(--chart-2))',
  },
  carbs: {
    label: 'Carbs',
    color: 'hsl(var(--chart-3))',
  },
  fat: {
    label: 'Fat',
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
    { name: 'Protein', value: totalProtein, fill: 'var(--color-protein)' },
    { name: 'Carbs', value: totalCarbs, fill: 'var(--color-carbs)' },
    { name: 'Fat', value: totalFat, fill: 'var(--color-fat)' },
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
        <h1 className="font-headline text-4xl font-bold">Daily Dashboard</h1>
        <p className="text-muted-foreground">
          Here&apos;s your nutritional summary for today.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Calorie Goal</CardTitle>
            <CardDescription>
              Set your daily calorie target and track your progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g., 2000"
                className="max-w-xs"
              />
              <Button onClick={handleSetGoal}>Set Goal</Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span>{Math.round(totalCalories)} kcal consumed</span>
                <span className="text-muted-foreground">
                  {calorieGoal} kcal goal
                </span>
              </div>
              <Progress
                value={calorieProgress}
                aria-label={`${calorieProgress.toFixed(0)}% of calorie goal`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Macronutrients</CardTitle>
            <CardDescription>Total grams consumed today.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-48 w-full">
              <BarChart
                data={macroData}
                layout="vertical"
                margin={{ left: 10, right: 10 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  width={50}
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
              Micronutrient Summary
            </CardTitle>
            <CardDescription>
              Total micronutrients consumed today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-3 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Fiber</p>
                <p className="font-medium">{totalFiber.toFixed(1)} g</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sugar</p>
                <p className="font-medium">{totalSugar.toFixed(1)} g</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sodium</p>
                <p className="font-medium">{totalSodium.toFixed(0)} mg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Potassium</p>
                <p className="font-medium">{totalPotassium.toFixed(0)} mg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Calcium</p>
                <p className="font-medium">{totalCalcium.toFixed(0)} mg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Iron</p>
                <p className="font-medium">{totalIron.toFixed(1)} mg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vitamin A</p>
                <p className="font-medium">{totalVitaminA.toFixed(0)} mcg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vitamin C</p>
                <p className="font-medium">{totalVitaminC.toFixed(0)} mg</p>
              </div>
               <div>
                <p className="text-sm text-muted-foreground">Vitamin D</p>
                <p className="font-medium">{totalVitaminD.toFixed(0)} mcg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Logged Meals</CardTitle>
            <CardDescription>
              All your meals and snacks for today. Click to expand.
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
                            {meal.calories} kcal &bull; P: {meal.protein}g &bull;
                            C: {meal.carbs}g &bull; F: {meal.fat}g
                          </p>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-9 p-0">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent>
                        <div className="border-t px-4 py-2">
                           <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                              <span className="text-muted-foreground">Fiber:</span><span className="text-right">{meal.fiber?.toFixed(1) ?? 'N/A'} g</span>
                              <span className="text-muted-foreground">Sugar:</span><span className="text-right">{meal.sugar?.toFixed(1) ?? 'N/A'} g</span>
                              <span className="text-muted-foreground">Sodium:</span><span className="text-right">{meal.sodium?.toFixed(0) ?? 'N/A'} mg</span>
                              <span className="text-muted-foreground">Potassium:</span><span className="text-right">{meal.potassium?.toFixed(0) ?? 'N/A'} mg</span>
                              <span className="text-muted-foreground">Calcium:</span><span className="text-right">{meal.calcium?.toFixed(0) ?? 'N/A'} mg</span>
                              <span className="text-muted-foreground">Iron:</span><span className="text-right">{meal.iron?.toFixed(1) ?? 'N/A'} mg</span>
                              <span className="text-muted-foreground">Vitamin A:</span><span className="text-right">{meal.vitaminA?.toFixed(0) ?? 'N/A'} mcg</span>
                              <span className="text-muted-foreground">Vitamin C:</span><span className="text-right">{meal.vitaminC?.toFixed(0) ?? 'N/A'} mg</span>
                              <span className="text-muted-foreground">Vitamin D:</span><span className="text-right">{meal.vitaminD?.toFixed(0) ?? 'N/A'} mcg</span>
                           </div>
                        </div>
                      </CollapsibleContent>
                    </li>
                  </Collapsible>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>No meals logged yet.</p>
                <p>Add a meal manually or analyze a photo to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
