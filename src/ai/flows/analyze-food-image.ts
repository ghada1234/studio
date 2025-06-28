
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
  prompt: `You are an expert nutritionist AI. Your task is to analyze the provided food image and return a detailed nutritional breakdown in a specific JSON format.

**IMPORTANT RULES:**
1.  Your entire response MUST be a single, valid JSON object.
2.  Do NOT include any text, explanation, or markdown formatting (like \`\`\`json) before or after the JSON object.
3.  Your response MUST start with \`{\` and end with \`}\`.
4.  If a nutritional value cannot be reasonably estimated, COMPLETELY OMIT its key. Do not use \`null\` or \`0\`.
5.  If the image does not appear to contain food, you MUST return a JSON object with an empty "foodItems" array: \`{"foodItems": []}\`.

**EXAMPLE OUTPUT FORMAT:**
{
  "foodItems": ["grilled chicken breast", "steamed broccoli", "brown rice"],
  "estimatedCalories": 500,
  "protein": 45,
  "carbs": 40,
  "fat": 15
}

**USER'S REQUEST TO ANALYZE:**
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
    try {
      const {output} = await prompt(input);
      if (!output || !output.foodItems) {
        // If the output is invalid or doesn't contain the required foodItems key,
        // return a minimal, valid object.
        return { foodItems: [] };
      }
      return output;
    } catch (error) {
      console.error("Error in analyzeFoodImageFlow:", error);
      // On any error, return a safe, empty object to prevent crashes.
      return { foodItems: [] };
    }
  }
);
