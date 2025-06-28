'use client';

import type { Meal } from '@/types';
import React, { createContext, useContext, useState, useMemo } from 'react';

interface DailyLogContextType {
  meals: Meal[];
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  calorieGoal: number;
  setCalorieGoal: (goal: number) => void;
}

const DailyLogContext = createContext<DailyLogContextType | undefined>(
  undefined
);

export function DailyLogProvider({ children }: { children: React.ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);

  const addMeal = (mealData: Omit<Meal, 'id'>) => {
    const newMeal: Meal = {
      ...mealData,
      id: new Date().toISOString() + Math.random(),
    };
    setMeals((prevMeals) => [...prevMeals, newMeal]);
  };

  const contextValue = useMemo(
    () => ({
      meals,
      addMeal,
      calorieGoal,
      setCalorieGoal,
    }),
    [meals, calorieGoal]
  );

  return React.createElement(DailyLogContext.Provider, { value: contextValue }, children);
}

export const useDailyLog = () => {
  const context = useContext(DailyLogContext);
  if (context === undefined) {
    throw new Error('useDailyLog must be used within a DailyLogProvider');
  }
  return context;
};
