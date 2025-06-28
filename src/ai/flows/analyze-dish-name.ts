
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
  portionSize: z
    .string()
    .optional()
    .describe('The estimated portion size of the meal, e.g., "1 cup", "100g", "a small plate".'),
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
  prompt: `You are an expert nutritionist API. Your only function is to analyze a dish name and return a JSON object with nutritional information.

**Input Dish Name:**
{{{dishName}}}

{{#if portionSize}}
**User-provided Portion Size:**
{{{portionSize}}}
{{/if}}

**Your Task:**
1.  Analyze the dish name to identify its ingredients.
2.  Estimate the nutritional content for the dish. If a portion size is provided, base your estimates on that. Otherwise, assume a standard single serving.
3.  If the input is not a food item, you MUST return a JSON object with "foodItems": [] and all other numeric values set to 0.
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

const analyzeDishNameFlow = ai.defineFlow(
  {
    name: 'analyzeDishNameFlow',
    inputSchema: AnalyzeDishNameInputSchema,
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

