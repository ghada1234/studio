
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
  prompt: `You are a nutrition analysis expert. Your task is to analyze the provided meal image and portion size and return a valid JSON object that strictly adheres to the provided JSON schema.

**CRITICAL INSTRUCTIONS:**
1.  You MUST output a single, valid JSON object and nothing else. Do not add explanations or markdown formatting.
2.  All nutritional values must be NUMBERS. Do not include units (e.g., "g" or "kcal").
3.  For any nutritional value that cannot be estimated, COMPLETELY OMIT its key from the JSON object. Do not use \`null\` or \`0\` as placeholders.
4.  If the image does not appear to contain food, return a JSON object where "foodItems" is an empty array (\`[]\`) and all other fields are omitted.

**EXAMPLE (for an image of a bowl of oatmeal with berries):**
Input:
- Image: [Image data]
- Portion Size: "1 bowl"

Expected Output:
\`\`\`json
{
  "foodItems": ["oatmeal", "blueberries", "strawberries"],
  "estimatedCalories": 250,
  "protein": 6,
  "carbs": 50,
  "fat": 4,
  "fiber": 8,
  "sugar": 15
}
\`\`\`

**Image to Analyze:**
{{media url=photoDataUri}}
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
