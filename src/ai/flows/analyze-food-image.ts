
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
  prompt: `Analyze the nutritional content of the meal in the following image.

Image: {{media url=photoDataUri}}
{{#if portionSize}}
Portion: {{{portionSize}}}
{{/if}}

Your task is to identify the food items and estimate their nutritional content from the image.
- Return ONLY a valid JSON object adhering to the specified schema.
- Identify the individual food items in the image.
- Provide estimates for all available nutritional values. Use the provided portion size if available, otherwise estimate from the image.
- All nutritional values MUST be numbers. Do not include units (e.g., "g" or "kcal").
- If a specific nutritional value cannot be estimated, OMIT the key from the JSON object. Do not use placeholder values like 0, null, or "N/A".
- If the image does not contain food, return a JSON object with an empty "foodItems" array and omit all other fields.

Example of a valid response for an image of a salad:
{
  "foodItems": ["lettuce", "tomato", "cucumber", "chicken breast", "croutons", "caesar dressing"],
  "estimatedCalories": 350,
  "protein": 25,
  "carbs": 15,
  "fat": 20
}
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
