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
  prompt: `You are a nutritional expert, skilled at suggesting meals
  based on a user's dietary restrictions and nutrient needs.

  Given the following dietary preferences: {{{dietaryPreferences}}}
  And the following nutrient needs: {{{nutrientNeeds}}}
  And disliked ingredients: {{{dislikedIngredients}}}

  Suggest {{{numberOfMeals}}} meals that satisfy these requirements.

  Return the list of meals as a JSON array of strings.
  `,
});

const suggestMealsFlow = ai.defineFlow(
  {
    name: 'suggestMealsFlow',
    inputSchema: SuggestMealsInputSchema,
    outputSchema: SuggestMealsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
