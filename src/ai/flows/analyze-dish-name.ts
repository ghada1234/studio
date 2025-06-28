
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
  prompt: `You are an expert nutritionist AI. Your task is to analyze the provided dish name and return a detailed nutritional breakdown in a specific JSON format.

**IMPORTANT RULES:**
1.  Your entire response MUST be a single, valid JSON object.
2.  Do NOT include any text, explanation, or markdown formatting (like \`\`\`json) before or after the JSON object.
3.  Your response MUST start with \`{\` and end with \`}\`.
4.  If a nutritional value cannot be reasonably estimated, COMPLETELY OMIT its key. Do not use \`null\` or \`0\`.
5.  If the input does not seem to be a food item, you MUST return a JSON object with an empty "foodItems" array: \`{"foodItems": []}\`.

**EXAMPLE:**
- **Input:** \`{ "dishName": "Avocado Toast", "portionSize": "2 slices" }\`
- **Output:**
{
  "foodItems": ["avocado", "whole wheat toast", "olive oil"],
  "estimatedCalories": 350,
  "protein": 10,
  "carbs": 30,
  "fat": 20,
  "fiber": 12,
  "sugar": 2,
  "sodium": 300
}

**USER'S REQUEST TO ANALYZE:**
- Name: {{{dishName}}}
{{#if portionSize}}
- Portion Size: {{{portionSize}}}
{{/if}}
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
    try {
      const {output} = await prompt(input);
      if (!output || !output.foodItems) {
        // If the output is invalid or doesn't contain the required foodItems key,
        // return a minimal, valid object.
        return { foodItems: [] };
      }
      return output;
    } catch (error) {
      console.error("Error in analyzeDishNameFlow:", error);
      // On any error, return a safe, empty object to prevent crashes.
      return { foodItems: [] };
    }
  }
);
