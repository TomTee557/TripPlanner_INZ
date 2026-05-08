import api from './api';
import type { SmartPackContext, SmartPackFormSnapshot, SmartPackAiResponse, ApiSuccessResponse } from '../types';

export const generateSmartPacking = async (
  tripData: SmartPackFormSnapshot,
  context: SmartPackContext
): Promise<SmartPackAiResponse> => {
  const allActivities = context.customActivity.trim()
    ? [...context.activities, context.customActivity.trim()]
    : context.activities;

  const response = await api.post<ApiSuccessResponse<SmartPackAiResponse>>('/ai/smart-packing', {
    title: tripData.title,
    country: tripData.country,
    dateFrom: tripData.dateFrom,
    dateTo: tripData.dateTo,
    tripType: tripData.tripType ? [tripData.tripType] : undefined,
    budget: tripData.price && tripData.budgetCurrency
      ? `${tripData.budgetCurrency}${tripData.price}`
      : undefined,
    description: tripData.description?.trim() || undefined,
    activities: allActivities,
    city: context.city || undefined,
    accommodation: context.accommodation,
    transportToDestination: context.transportToDestination,
    transportAround: context.transportAround,
    groupSize: context.groupSize,
    specialNeeds: context.specialNeeds || undefined,
    language: 'en',
  });

  if (!response.data) {
    throw new Error('AI returned no data');
  }
  return response.data;
};
