'use server';

/**
 * @fileOverview Analyzes a dish name to identify food items and estimate its nutritional content.
 *
 * - analyzeDishName - A function that handles the dish name analysis process.
 * - AnalyzeDishNameInput - The input type for the analyzeDishName function.
 * - AnalyzeDishNameOutput - The return type for the analyzeDishName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { FoodAnalysisOutputSchema } from '../schemas';

const AnalyzeDishNameInputSchema = z.object({
  dishName: z
    .string()
    .describe(
      "The name of a meal, e.g., 'Chicken Caesar Salad' or 'Spaghetti Bolognese'."
    ),
});
export type AnalyzeDishNameInput = z.infer<typeof AnalyzeDishNameInputSchema>;

export type AnalyzeDishNameOutput = z.infer<typeof FoodAnalysisOutputSchema>;

export async function analyzeDishName(
  input: AnalyzeDishNameInput
): Promise<AnalyzeDishNameOutput> {
  return analyzeDishNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDishNamePrompt',
  input: {schema: AnalyzeDishNameInputSchema},
  output: {schema: FoodAnalysisOutputSchema},
  prompt: `You are a nutritional expert with a vast knowledge of international cuisine, including dishes from all over the world such as the Middle East (Iraq, Lebanon, Syria, Yemen, UAE, etc.), Asia, Europe, Africa, and the Americas. Analyze the dish name provided: {{{dishName}}}.

Based on a typical preparation of this dish, provide an estimation of the total calories and the following nutrients:
- Macronutrients (in grams): protein, carbohydrates, fat, fiber, sugar.
- Key Micronutrients: sodium (mg), potassium (mg), calcium (mg), iron (mg), Vitamin A (mcg RAE), Vitamin C (mg), Vitamin D (mcg).

For the 'foodItems' field, list the typical ingredients for this dish.

Return the data in the specified JSON format.
`,
});

const analyzeDishNameFlow = ai.defineFlow(
  {
    name: 'analyzeDishNameFlow',
    inputSchema: AnalyzeDishNameInputSchema,
    outputSchema: FoodAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
