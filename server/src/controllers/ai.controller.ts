import { Response } from 'express';
import OpenAI from 'openai';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/database';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Types returned to the client ────────────────────────────────────────────

export interface AiPackingItem {
  name: string;
  category: string; // must match a PackingCategory name in DB
  quantity: number;
  priority: 'low' | 'medium' | 'high';
}

export interface AiTodoItem {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string; // ISO date string, optional
}

export interface AiExpenseItem {
  description: string;
  categoryName: string; // must match an ExpenseCategory name in DB
  amount: number;
  currency: string;
  expenseDate: string; // ISO date string
}

export interface SmartPackingResponse {
  packingItems: AiPackingItem[];
  todoItems: AiTodoItem[];
  expenses: AiExpenseItem[];
  note: string;
}

// ─── Allowed values (must stay in sync with DB seed data) ────────────────────

const PACKING_CATEGORIES = [
  'Clothing',
  'Toiletries',
  'Electronics',
  'Documents',
  'Medicine',
  'Accessories',
  'Sports & Recreation',
  'Other',
] as const;

const EXPENSE_CATEGORIES = [
  'Accommodation',
  'Transportation',
  'Food & Dining',
  'Activities',
  'Shopping',
  'Healthcare',
  'Entertainment',
  'Other',
] as const;

// ─── Controller ───────────────────────────────────────────────────────────────

/**
 * POST /api/ai/smart-packing
 * Generate a personalised packing list, todo list, planned expenses and a trip
 * note using OpenAI based on trip details and user-provided context.
 *
 * Requires authentication + SMART_PACKING permission.
 */
export const generateSmartPacking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user?.id) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Verify permission
    const permission = await prisma.userPermission.findUnique({
      where: { userId_permission: { userId: user.id, permission: 'SMART_PACKING' } }
    });
    if (!permission) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to the Smart Packing feature.'
      });
      return;
    }

    // ── Request body ──────────────────────────────────────────────────────────
    const {
      title,
      country,
      dateFrom,
      dateTo,
      tripType,
      budget,
      description,              // string — optional user notes/description
      activities,              // string[]
      city,                    // string — optional city/region for climate inference
      accommodation,           // string
      transportToDestination,  // string[]
      transportAround,         // string[]
      groupSize,               // number
      specialNeeds,            // string
      language,                // "pl" | "en"
    } = req.body;

    if (!country || !dateFrom || !dateTo) {
      res.status(400).json({
        error: 'Missing fields',
        message: 'country, dateFrom and dateTo are required.'
      });
      return;
    }

    const responseLanguage = language === 'pl' ? 'Polish' : 'English';
    const nights = Math.ceil(
      (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Fetch traveller nationality for visa/document advice
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { nationality: true }
    });
    const nationality = dbUser?.nationality || 'unknown';

    const destination = city ? `${city}, ${country}` : country;

    const systemPrompt = `You are a professional travel planning assistant.
Your task is to generate a practical, information-rich travel plan.
Always respond ONLY with valid JSON matching the exact schema provided. Do not include any text outside the JSON.
Use ${responseLanguage} for all string values (item names, descriptions, notes).`;

    const userPrompt = `Create a practical travel plan for the trip below and return ONLY a JSON object.

Traveller details:
- Nationality: ${nationality}

Trip details:
- Title: ${title || 'Trip'}
- Destination: ${destination}
- Dates: ${dateFrom} to ${dateTo} (${nights} night${nights !== 1 ? 's' : ''})
- Trip types: ${tripType ? JSON.stringify(tripType) : 'not specified'}
- Budget: ${budget || 'not specified'}
- User notes / description: ${description || 'none'}
- Planned activities: ${activities?.join(', ') || 'not specified'}
- Accommodation: ${accommodation || 'not specified'}
- Transport to destination: ${transportToDestination?.join(', ') || 'not specified'}
- Transport around destination: ${transportAround?.join(', ') || 'not specified'}
- Group size: ${groupSize || 1}
- Special needs / dietary restrictions: ${specialNeeds || 'none'}

Return this exact JSON structure:
{
  "packingItems": [
    {
      "name": "string",
      "category": "one of: ${PACKING_CATEGORIES.join(', ')}",
      "quantity": 1,
      "priority": "low|medium|high"
    }
  ],
  "todoItems": [
    {
      "title": "string",
      "description": "string or empty string",
      "priority": "low|medium|high",
      "dueDate": "YYYY-MM-DD or null"
    }
  ],
  "expenses": [
    {
      "description": "string",
      "categoryName": "one of: ${EXPENSE_CATEGORIES.join(', ')}",
      "amount": 0,
      "currency": "USD|EUR|PLN|GBP|etc",
      "expenseDate": "YYYY-MM-DD"
    }
  ],
  "note": "string"
}

Instructions for each section:

packingItems (10–25 items):
- Include Documents category with passport, travel insurance, and relevant visa documents based on traveller nationality (${nationality}) travelling to ${country}
- Include weather-appropriate clothing based on typical climate in ${destination} during ${dateFrom}–${dateTo} (infer climate from location and season)
- Include items relevant to the specific activities: ${activities?.join(', ') || 'general travel'}
- If transport includes ${transportToDestination?.includes?.('Plane') ? 'Plane' : ''} add liquids bag, travel pillow etc.
- If accommodation is camping add tent, sleeping bag etc.

todoItems (5–10 practical pre-trip tasks):
- Check visa requirements for ${nationality} citizens travelling to ${country} — specify if visa is needed
- Check vaccination/health requirements for ${country}
- Travel insurance purchase
- Accommodation booking
- Transport booking
- Currency exchange to local currency of ${country}
- Check if ${nationality} passport is valid for 6+ months beyond ${dateTo}
- Any destination-specific tasks (e.g. national park reservations, car rental)

expenses (4–10 realistic estimated costs):
- Include transport to destination (${transportToDestination?.join(', ') || 'unspecified'})
- Include accommodation costs
- Include daily food & dining estimates
- Include activities costs matching: ${activities?.join(', ') || 'general'}
- If transport around is "Rental car" or "Motorbike" include rental + fuel cost
- Base amounts on typical prices for ${country} and budget: ${budget || 'medium'}

note (3–5 sentences, PRACTICAL travel planning advice ONLY — no marketing/poetic language):
- State the inferred climate/weather for ${destination} in ${dateFrom}–${dateTo} and what that means for packing
- Mention visa/entry requirements for ${nationality} citizens in ${country}
- If special needs "${specialNeeds}" include relevant warnings (e.g. dietary: note if vegan/vegetarian diet may be challenging in destination, medication availability)
- Mention 2–3 must-see attractions or practical tips specific to ${destination}
- Note any health/vaccination recommendations for ${country}

All category values MUST exactly match one of the allowed values.
dueDate for todos should be before ${dateFrom}.
expenseDate for expenses should be within ${dateFrom} to ${dateTo}.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 3000,
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      res.status(500).json({ error: 'AI returned empty response' });
      return;
    }

    let parsed: SmartPackingResponse;
    try {
      parsed = JSON.parse(rawContent) as SmartPackingResponse;
    } catch {
      res.status(500).json({ error: 'AI response is not valid JSON' });
      return;
    }

    // ── Sanitise AI output ────────────────────────────────────────────────────
    parsed.packingItems = (parsed.packingItems || []).map((item) => ({
      name: String(item.name || '').slice(0, 255),
      category: PACKING_CATEGORIES.includes(item.category as any) ? item.category : 'Other',
      quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)),
      priority: ['low', 'medium', 'high'].includes(item.priority) ? item.priority : 'medium',
    }));

    parsed.todoItems = (parsed.todoItems || []).map((item) => ({
      title: String(item.title || '').slice(0, 255),
      description: item.description ? String(item.description).slice(0, 1000) : undefined,
      priority: ['low', 'medium', 'high'].includes(item.priority) ? item.priority : 'medium',
      dueDate: item.dueDate && item.dueDate !== 'null' ? item.dueDate : undefined,
    }));

    parsed.expenses = (parsed.expenses || []).map((item) => ({
      description: String(item.description || '').slice(0, 1000),
      categoryName: EXPENSE_CATEGORIES.includes(item.categoryName as any) ? item.categoryName : 'Other',
      amount: Math.max(0, Number(item.amount) || 0),
      currency: String(item.currency || 'USD').toUpperCase().slice(0, 3),
      expenseDate: item.expenseDate || dateFrom,
    }));

    parsed.note = String(parsed.note || '').slice(0, 2000);

    res.status(200).json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Smart packing AI error:', error);
    if (error?.status === 401) {
      res.status(500).json({ error: 'AI service configuration error' });
    } else if (error?.status === 429) {
      res.status(429).json({ error: 'AI rate limit exceeded. Please try again in a moment.' });
    } else {
      res.status(500).json({ error: 'Unable to generate smart packing suggestions.' });
    }
  }
};
