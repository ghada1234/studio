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

const AnalyzeFoodImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeFoodImageInput = z.infer<typeof AnalyzeFoodImageInputSchema>;

const AnalyzeFoodImageOutputSchema = z.object({
  foodItems: z.array(z.string()).describe('A list of food items identified in the image.'),
  estimatedNutritionalContent: z
    .string()
    .describe('An estimation of the nutritional content of the meal.'),
  estimatedCalories: z.number().describe('Estimation of calories in the meal'),
});
export type AnalyzeFoodImageOutput = z.infer<typeof AnalyzeFoodImageOutputSchema>;

export async function analyzeFoodImage(input: AnalyzeFoodImageInput): Promise<AnalyzeFoodImageOutput> {
  return analyzeFoodImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodImagePrompt',
  input: {schema: AnalyzeFoodImageInputSchema},
  output: {schema: AnalyzeFoodImageOutputSchema},
  prompt: `You are a nutritional expert. Analyze the food image provided to identify the food items and estimate its nutritional content.

  Photo: {{media url=photoDataUri}}

  Identify the food items, provide an estimation of the macro and micro nutrient content, and provide an estimate of the total calories in the meal.
  Output the food items as a list of strings in the foodItems field.
  Output the nutritional content as a string in the estimatedNutritionalContent field.  Include both macro and micro nutrients.
  Output the estimated calories as a number in the estimatedCalories field.
  `,
});

const analyzeFoodImageFlow = ai.defineFlow(
  {
    name: 'analyzeFoodImageFlow',
    inputSchema: AnalyzeFoodImageInputSchema,
    outputSchema: AnalyzeFoodImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
