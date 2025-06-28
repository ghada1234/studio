'use server';

/**
 * @fileOverview Analyzes an image of a meal to identify food items and estimate its nutritional content.
 *
 * - analyzeFoodImage - A function that handles the food image analysis process.
 * - AnalyzeFoodImageInput - The input type for the analyzeFoodImage function.
 * - AnalyzeFoodImageOutput - The return type for the analyzeFoodImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { FoodAnalysisOutputSchema } from '../schemas';

const AnalyzeFoodImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  portionSize: z
    .string()
    .optional()
    .describe('The estimated portion size of the meal, e.g., "1 cup", "100g", "a small plate".'),
});
export type AnalyzeFoodImageInput = z.infer<typeof AnalyzeFoodImageInputSchema>;


export type AnalyzeFoodImageOutput = z.infer<
  typeof FoodAnalysisOutputSchema
>;

export async function analyzeFoodImage(
  input: AnalyzeFoodImageInput
): Promise<AnalyzeFoodImageOutput> {
  return analyzeFoodImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodImagePrompt',
  input: {schema: AnalyzeFoodImageInputSchema},
  output: {schema: FoodAnalysisOutputSchema},
  prompt: `You are a nutritional expert. Analyze the food image provided.

Photo: {{media url=photoDataUri}}

Identify the food items in the image. If you cannot identify a food item, state that it is an "unidentified food item".

{{#if portionSize}}
The user has specified a portion size of: {{{portionSize}}}. Please adjust the nutritional information to match this portion size.
{{else}}
Visually estimate the portion size from the image, using common objects for scale if visible (like a fork or a hand), and base your nutritional analysis on that estimation. If no scale is available, assume a standard, single serving portion.
{{/if}}

Provide an estimation of the total calories.
Provide an estimation for the following nutrients:
- Macronutrients (in grams): protein, carbohydrates, fat, fiber, sugar.
- Key Micronutrients: sodium (mg), potassium (mg), calcium (mg), iron (mg), Vitamin A (mcg RAE), Vitamin C (mg), Vitamin D (mcg).

Return the data in the specified JSON format. If the image does not contain food, return an empty list for 'foodItems' and 0 for all nutrient values.
`,
});

const analyzeFoodImageFlow = ai.defineFlow(
  {
    name: 'analyzeFoodImageFlow',
    inputSchema: AnalyzeFoodImageInputSchema,
    outputSchema: FoodAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
