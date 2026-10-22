// Reads a photo of an Israeli supermarket receipt and returns the food items
// on it as JSON. Runs on Supabase Edge Functions (Deno) so the Claude API key
// never ships inside the app.
//
// Deploy:  supabase functions deploy parse-receipt
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import Anthropic from 'npm:@anthropic-ai/sdk@^1.1';
import { zodOutputFormat } from 'npm:@anthropic-ai/sdk@^1.1/helpers/zod';
import { z } from 'npm:zod@^4';

const CATEGORIES = [
  'dairy', 'meat', 'fish', 'vegetables', 'fruit', 'bread', 'eggs',
  'ready', 'frozen', 'dry', 'drinks', 'sauces', 'other',
] as const;

const ReceiptSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().describe('Short everyday Hebrew product name, e.g. "קוטג׳ 5%" not the full SKU text'),
      quantity: z.number().describe('Number of units bought, or the weight in kg for items sold by weight'),
      unit: z.enum(['unit', 'kg']).describe('"kg" when the line is priced by weight (produce, meat, fish), else "unit"'),
      price: z.number().nullable().describe('Total line price in NIS after discounts, or null if unreadable'),
      category: z.enum(CATEGORIES),
      shelf_life_days: z.number().nullable().describe('Typical days until it should be used, refrigerated where relevant'),
      perishable: z.boolean(),
    }),
  ),
});

const SYSTEM = `You read photos of Israeli supermarket receipts (Shufersal, Rami Levy, Victory, Yochananof, Osher Ad and similar).
Return only food and drink items. Skip bags, deposits (פיקדון), discounts lines, cleaning products, toiletries, totals and payment lines.
Merge a discount line into the price of the item above it.
Product names on receipts are abbreviated; expand them into the short name a person would say at home.
Estimate shelf_life_days from the product type as bought fresh today (e.g. chicken 2-3, cottage 7-10, hard cheese 21, bread 4, canned goods 365).`;

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });
const MODEL = Deno.env.get('RECEIPT_MODEL') ?? 'claude-opus-5-5';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

  const { image, mediaType = 'image/jpeg' } = await req.json();
  if (typeof image !== 'string' || image.length === 0) {
    return Response.json({ error: 'image is required' }, { status: 400, headers: CORS });
  }

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: 'low', format: zodOutputFormat(ReceiptSchema) },
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
            { type: 'text', text: 'List the food items on this receipt.' },
          ],
        },
      ],
    });

    if (response.stop_reason === 'refusal' || !response.parsed_output) {
      return Response.json({ error: 'could not read receipt' }, { status: 422, headers: CORS });
    }
    return Response.json(response.parsed_output, { headers: CORS });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: 'busy, try again' }, { status: 503, headers: CORS });
    }
    console.error(error);
    return Response.json({ error: 'receipt parsing failed' }, { status: 502, headers: CORS });
  }
});
