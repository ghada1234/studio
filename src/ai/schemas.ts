/**
 * @fileOverview Shared Zod schemas for AI flows.
 */

import {z} from 'genkit';

export const FoodAnalysisOutputSchema = z.object({
  foodItems: z
    .array(z.string())
    .describe('A list of food items identified in the image or dish name.'),
  estimatedCalories: z
    .number()
    .optional()
    .describe('Estimation of calories in the meal'),
  // Macronutrients (in grams)
  protein: z.number().optional().describe('Estimated protein in grams.'),
  carbs: z.number().optional().describe('Estimated carbohydrates in grams.'),
  fat: z.number().optional().describe('Estimated fat in grams.'),
  fiber: z.number().optional().describe('Estimated fiber in grams.'),
  sugar: z.number().optional().describe('Estimated sugar in grams.'),
  // Key Micronutrients
  sodium: z.number().optional().describe('Estimated sodium in milligrams (mg).'),
  potassium: z
    .number()
    .optional()
    .describe('Estimated potassium in milligrams (mg).'),
  calcium: z
    .number()
    .optional()
    .describe('Estimated calcium in milligrams (mg).'),
  iron: z.number().optional().describe('Estimated iron in milligrams (mg).'),
  vitaminA: z
    .number()
    .optional()
    .describe('Estimated Vitamin A in micrograms (mcg) RAE.'),
  vitaminC: z
    .number()
    .optional()
    .describe('Estimated Vitamin C in milligrams (mg).'),
  vitaminD: z
    .number()
    .optional()
    .describe('Estimated Vitamin D in micrograms (mcg).'),
});
