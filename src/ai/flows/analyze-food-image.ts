
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
  prompt: `You are an expert nutritionist API. Your only function is to analyze a food image and return a JSON object with nutritional information.

**Input Image:**
{{media url=photoDataUri}}

{{#if portionSize}}
**User-provided Portion Size:**
{{{portionSize}}}
{{/if}}

**Your Task:**
1.  Analyze the image to identify all food items.
2.  Estimate the nutritional content for the meal. If a portion size is provided by the user, base your estimates on that. Otherwise, estimate from the image.
3.  If the image does not contain food, you MUST return a JSON object with "foodItems": [] and all other numeric values set to 0.
4.  **You MUST respond with ONLY a valid JSON object** that strictly adheres to the following structure. Do not include any introductory text, explanations, or markdown formatting.

**JSON Output Structure:**
{
  "foodItems": ["string"],
  "estimatedCalories": "number (optional)",
  "protein": "number (optional, in grams)",
  "carbs": "number (optional, in grams)",
  "fat": "number (optional, in grams)",
  "fiber": "number (optional, in grams)",
  "sugar": "number (optional, in grams)",
  "sodium": "number (optional, in mg)",
  "potassium": "number (optional, in mg)",
  "calcium": "number (optional, in mg)",
  "iron": "number (optional, in mg)",
  "vitaminA": "number (optional, in mcg RAE)",
  "vitaminC": "number (optional, in mg)",
  "vitaminD": "number (optional, in mcg)"
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

