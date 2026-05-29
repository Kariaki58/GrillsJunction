'use server';
/**
 * @fileOverview An AI-powered tool that acts as a flavor sommelier for grillsJunction.
 *
 * - personalizedBBQRecommendations - A function that recommends personalized BBQ pairings and spice levels.
 * - PersonalizedBBQRecommendationsInput - The input type for the personalizedBBQRecommendations function.
 * - PersonalizedBBQRecommendationsOutput - The return type for the personalizedBBQRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedBBQRecommendationsInputSchema = z.object({
  orderHistory: z
    .array(z.string())
    .optional()
    .describe('A list of the user\'s past ordered items.'),
  currentCravings: z
    .string()
    .optional()
    .describe('A description of the user\'s current food preferences or cravings.'),
});
export type PersonalizedBBQRecommendationsInput = z.infer<
  typeof PersonalizedBBQRecommendationsInputSchema
>;

const PersonalizedBBQRecommendationsOutputSchema = z.object({
  recommendedMeal: z
    .string()
    .describe('The name of the recommended BBQ dish from grillsJunction.'),
  recommendedSpiceLevel: z
    .enum(['Mild', 'Medium', 'Hot', 'Junction Spicy'])
    .describe('The recommended spice level for the dish.'),
  pairingSuggestion: z
    .string()
    .describe('A suggestion for a drink or side dish that pairs well with the recommended meal.'),
  reasoning: z
    .string()
    .describe('An explanation for why this particular recommendation was made.'),
});
export type PersonalizedBBQRecommendationsOutput = z.infer<
  typeof PersonalizedBBQRecommendationsOutputSchema
>;

export async function personalizedBBQRecommendations(
  input: PersonalizedBBQRecommendationsInput
): Promise<PersonalizedBBQRecommendationsOutput> {
  return personalizedBBQRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedBBQRecommendationsPrompt',
  input: {schema: PersonalizedBBQRecommendationsInputSchema},
  output: {schema: PersonalizedBBQRecommendationsOutputSchema},
  prompt:
    `You are the grillsJunction AI Taste Tool, a flavor sommelier for grillsJunction, a premium Lagos-based barbecue restaurant. ` +
    `Your task is to recommend a personalized BBQ pairing, including a main dish, a spice level, and a drink or side pairing, based on the user's provided information.

` +
    `Consider the following specialties from grillsJunction:
` +
    `- Asun (Spicy grilled goat meat)
` +
    `- BBQ Chicken
` +
    `- Goat Meat BBQ
` +
    `- Turkey BBQ
` +
    `- Croaker BBQ
` +
    `- Catfish BBQ
` +
    `- Beef BBQ

` +
    `Based on the user's order history and current cravings, provide a tailored recommendation.
` +
    `If no specific information is provided, make a general recommendation that embodies the grillsJunction vibe of Lagos luxury.

` +
    `Order History: {{#each orderHistory}}{{{this}}}, {{/each}}
` +
    `Current Cravings: {{{currentCravings}}}`,
});

const personalizedBBQRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedBBQRecommendationsFlow',
    inputSchema: PersonalizedBBQRecommendationsInputSchema,
    outputSchema: PersonalizedBBQRecommendationsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
