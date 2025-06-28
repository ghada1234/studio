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
  prompt: `You are an expert nutritionist. Your task is to analyze the provided food image and return nutritional information in JSON format.

Image: {{media url=photoDataUri}}

{{#if portionSize}}
The user has specified a portion size of: {{{portionSize}}}.
{{/if}}

Instructions:
1.  Identify all food items in the image.
2.  Estimate the portion size from the image, unless a portion size is provided by the user.
3.  Based on the identified items and portion size, estimate the total calories.
4.  Estimate macronutrients (protein, carbs, fat, fiber, sugar) in grams.
5.  Estimate key micronutrients (sodium, potassium, calcium, iron, Vitamin A, Vitamin C, Vitamin D) in standard units (mg or mcg).
6.  If the image does not appear to contain food, you MUST return a JSON object with an empty 'foodItems' array and 0 for all nutrient values.
7.  Return ONLY the JSON object that matches the output schema. Do not add any extra text, commentary, or markdown formatting like \`json\` before the object.
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const analyzeFoodImageFlow = ai.defineFlow(
  {
    name: 'analyzeFoodImageFlow',
    inputSchema: AnalyzeFoodImageInputSchema,
    outputSchema: FoodAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to produce a valid analysis.');
    }
    return output;
  }
);
