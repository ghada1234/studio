/**
 * @fileOverview Shared Zod schemas for AI flows.
 */

import {z} from 'genkit';

export const FoodAnalysisOutputSchema = z.object({
  foodItems: z
    .array(z.string())
    .describe('A list of food items identified in the image or dish name.'),
  estimatedCalories: z.number().describe('Estimation of calories in the meal'),
  // Macronutrients (in grams)
  protein: z.number().describe('Estimated protein in grams.'),
  carbs: z.number().describe('Estimated carbohydrates in grams.'),
  fat: z.number().describe('Estimated fat in grams.'),
  fiber: z.number().describe('Estimated fiber in grams.'),
  sugar: z.number().describe('Estimated sugar in grams.'),
  // Key Micronutrients
  sodium: z.number().describe('Estimated sodium in milligrams (mg).'),
  potassium: z.number().describe('Estimated potassium in milligrams (mg).'),
  calcium: z.number().describe('Estimated calcium in milligrams (mg).'),
  iron: z.number().describe('Estimated iron in milligrams (mg).'),
  vitaminA: z
    .number()
    .describe('Estimated Vitamin A in micrograms (mcg) RAE.'),
  vitaminC: z.number().describe('Estimated Vitamin C in milligrams (mg).'),
  vitaminD: z.number().describe('Estimated Vitamin D in micrograms (mcg).'),
});
