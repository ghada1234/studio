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
  foodItems: z
    .array(z.string())
    .describe('A list of food items identified in the image.'),
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
export type AnalyzeFoodImageOutput = z.infer<
  typeof AnalyzeFoodImageOutputSchema
>;

export async function analyzeFoodImage(
  input: AnalyzeFoodImageInput
): Promise<AnalyzeFoodImageOutput> {
  return analyzeFoodImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodImagePrompt',
  input: {schema: AnalyzeFoodImageInputSchema},
  output: {schema: AnalyzeFoodImageOutputSchema},
  prompt: `You are a nutritional expert. Analyze the food image provided.

Photo: {{media url=photoDataUri}}

Identify the food items in the image.
Provide an estimation of the total calories.
Provide an estimation for the following nutrients:
- Macronutrients (in grams): protein, carbohydrates, fat, fiber, sugar.
- Key Micronutrients: sodium (mg), potassium (mg), calcium (mg), iron (mg), Vitamin A (mcg RAE), Vitamin C (mg), Vitamin D (mcg).

Return the data in the specified JSON format.
`,
});

const analyzeFoodImageFlow = ai.defineFlow(
  {
    name: 'analyzeFoodImageFlow',
    inputSchema: AnalyzeFoodImageInputSchema,
    outputSchema: AnalyzeFoodImageOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
