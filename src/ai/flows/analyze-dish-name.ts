
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
  prompt: `Analyze the nutritional content of the following dish.

Dish: {{{dishName}}}
{{#if portionSize}}
Portion: {{{portionSize}}}
{{/if}}

Your task is to identify the food items and estimate their nutritional content.
- Return ONLY a valid JSON object adhering to the specified schema.
- Identify the individual food items.
- Provide estimates for all available nutritional values.
- All nutritional values MUST be numbers. Do not include units (e.g., "g" or "kcal").
- If a specific nutritional value cannot be estimated, OMIT the key from the JSON object. Do not use placeholder values like 0, null, or "N/A".
- If the input is not a recognizable food, return a JSON object with an empty "foodItems" array and omit all other fields.

Example of a valid response for "A slice of cheese pizza":
{
  "foodItems": ["pizza crust", "tomato sauce", "cheese"],
  "estimatedCalories": 285,
  "protein": 12,
  "carbs": 36,
  "fat": 10
}

Example for an input where only calories and protein can be estimated:
{
  "foodItems": ["mystery meat"],
  "estimatedCalories": 200,
  "protein": 30
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
