import prisma from '../config/database';

/**
 * Verify that a user has access to a trip — either as owner or accepted participant.
 */
export const canAccessTrip = async (tripId: string, userId: number): Promise<boolean> => {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      OR: [
        { userId },
        { participants: { some: { userId, status: 'ACCEPTED' } } }
      ]
    }
  });
  return trip !== null;
};
