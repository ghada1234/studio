
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
  prompt: `You are a nutrition analysis expert. Your task is to analyze the provided dish name and portion size and return a valid JSON object that strictly adheres to the provided JSON schema.

**CRITICAL INSTRUCTIONS:**
1.  You MUST output a single, valid JSON object and nothing else. Do not add explanations or markdown formatting.
2.  All nutritional values must be NUMBERS. Do not include units (e.g., "g" or "kcal").
3.  For any nutritional value that cannot be estimated, COMPLETELY OMIT its key from the JSON object. Do not use \`null\` or \`0\` as placeholders.
4.  If the input is not a recognizable food item, return a JSON object where "foodItems" is an empty array (\`[]\`) and all other fields are omitted.

**EXAMPLE:**
Input:
- Name: "2 large eggs with toast"
- Portion Size: "2 slices"

Expected Output:
\`\`\`json
{
  "foodItems": ["eggs", "toast"],
  "estimatedCalories": 300,
  "protein": 18,
  "carbs": 28,
  "fat": 15,
  "sugar": 2
}
\`\`\`

**Dish to Analyze:**
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
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to produce a valid analysis.');
    }
    return output;
  }
);
