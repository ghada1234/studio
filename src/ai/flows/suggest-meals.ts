'use server';

/**
 * @fileOverview AI agent that suggests meals based on dietary preferences and nutrient needs.
 *
 * - suggestMeals - A function that suggests meals based on user preferences and needs.
 * - SuggestMealsInput - The input type for the suggestMeals function.
 * - SuggestMealsOutput - The return type for the suggestMeals function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMealsInputSchema = z.object({
  dietaryPreferences: z
    .string()
    .describe('The dietary preferences of the user (e.g., vegetarian, vegan, gluten-free).'),
  nutrientNeeds: z
    .string()
    .describe('The specific nutrient needs of the user (e.g., high protein, low carb).'),
  dislikedIngredients: z
    .string()
    .optional()
    .describe('Ingredients that the user dislikes, comma separated (e.g. broccoli, beans)'),
  numberOfMeals: z.number().describe('The number of meals to suggest.'),
  remainingCalories: z
    .number()
    .optional()
    .describe('The remaining calories for the day to fit the meals into.'),
});
export type SuggestMealsInput = z.infer<typeof SuggestMealsInputSchema>;

const SuggestMealsOutputSchema = z.object({
  meals: z
    .array(z.string())
    .describe('An array of meal suggestions based on the user input.'),
});
export type SuggestMealsOutput = z.infer<typeof SuggestMealsOutputSchema>;

export async function suggestMeals(input: SuggestMealsInput): Promise<SuggestMealsOutput> {
  return suggestMealsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMealsPrompt',
  input: {schema: SuggestMealsInputSchema},
  output: {schema: SuggestMealsOutputSchema},
  prompt: `You are a nutritional expert, skilled at suggesting meals based on a user's dietary restrictions and nutrient needs.

**CRITICAL INSTRUCTIONS:**
1. You MUST output a single, valid JSON object and nothing else. Do not add explanations or markdown formatting. The JSON object must conform to the provided JSON schema.
2. If you cannot generate suggestions for any reason, return a JSON object with an empty "meals" array: \`{"meals": []}\`.

**User's Requirements:**
- Dietary Preferences: {{{dietaryPreferences}}}
- Nutrient Needs: {{{nutrientNeeds}}}
{{#if dislikedIngredients}}
- Disliked Ingredients: {{{dislikedIngredients}}}
{{/if}}
{{#if remainingCalories}}
- Remaining Calorie Budget: {{{remainingCalories}}} kcal for all suggested meals combined.
{{/if}}

**Task:**
- Suggest exactly {{{numberOfMeals}}} meals that satisfy these requirements.
{{#if remainingCalories}}
- The total calories of all suggested meals MUST NOT exceed the remaining calorie budget.
- Each meal suggestion MUST include an estimated calorie count. For example: "Grilled Salmon with Asparagus (~450 calories)".
{{/if}}
  `,
});

const suggestMealsFlow = ai.defineFlow(
  {
    name: 'suggestMealsFlow',
    inputSchema: SuggestMealsInputSchema,
    outputSchema: SuggestMealsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      // Return an empty list of meals if the model fails.
      return {meals: []};
    }
    return output;
  }
);
