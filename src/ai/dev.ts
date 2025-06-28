import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-meals.ts';
import '@/ai/flows/analyze-food-image.ts';
import '@/ai/flows/analyze-dish-name.ts';
