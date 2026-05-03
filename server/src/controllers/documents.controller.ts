import { Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

// Document types that get a 6-month warning window; "Other" gets 30 days
const LONG_WARNING_TYPES = ['Passport', 'ID Card', 'Visa', 'Insurance', 'Vaccination Card', 'Driving License'];

/**
 * GET /api/documents/expiring-soon
 * Returns hasExpiring flag — true if any document is expiring within its threshold
 */
export const getExpiringSoon = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const now = new Date();
    const sixMonthsFromNow = new Date(now);
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Check long-warning types (6 months)
    const longWarning = await prisma.userDocument.findFirst({
      where: {
        userId: req.user.id,
        documentType: { in: LONG_WARNING_TYPES },
        expirationDate: { gte: now, lte: sixMonthsFromNow }
      }
    });

    // Check Other (30 days)
    const shortWarning = longWarning
      ? null
      : await prisma.userDocument.findFirst({
          where: {
            userId: req.user.id,
            documentType: { notIn: LONG_WARNING_TYPES },
            expirationDate: { gte: now, lte: thirtyDaysFromNow }
          }
        });

    res.status(200).json({
      success: true,
      data: { hasExpiring: !!(longWarning || shortWarning) }
    });
  } catch (error) {
    console.error('Error checking expiring documents:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to check documents' });
  }
};

/**
 * GET /api/documents
 * Get all documents for current user
 */
export const getDocuments = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const documents = await prisma.userDocument.findMany({
      where: { userId: req.user.id },
      orderBy: { expirationDate: 'asc' }
    });

    const formatted = documents.map((doc: any) => ({
      id: doc.id,
      documentType: doc.documentType,
      description: doc.description,
      expirationDate: doc.expirationDate.toISOString().split('T')[0],
      createdAt: doc.createdAt.toISOString()
    }));

    res.status(200).json({ success: true, data: formatted, count: formatted.length });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to fetch documents' });
  }
};

/**
 * POST /api/documents
 * Create new document
 */
export const createDocument = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const { documentType, description, expirationDate } = req.body;

    if (!documentType || !expirationDate) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Document type and expiration date are required'
      });
      return;
    }

    const doc = await prisma.userDocument.create({
      data: {
        userId: req.user.id,
        documentType: documentType.trim(),
        description: description?.trim() || null,
        expirationDate: new Date(expirationDate)
      }
    });

    res.status(201).json({
      success: true,
      message: 'Document added successfully',
      data: {
        id: doc.id,
        documentType: doc.documentType,
        description: doc.description,
        expirationDate: doc.expirationDate.toISOString().split('T')[0],
        createdAt: doc.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to create document' });
  }
};

/**
 * DELETE /api/documents/:id
 * Delete a document
 */
export const deleteDocument = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const doc = await prisma.userDocument.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!doc) {
      res.status(404).json({ error: 'Not found', message: 'Document not found' });
      return;
    }

    await prisma.userDocument.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to delete document' });
  }
};

/**
 * PUT /api/documents/:id
 * Update an existing document
 */
export const updateDocument = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { documentType, description, expirationDate } = req.body;

    if (!documentType || !expirationDate) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Document type and expiration date are required'
      });
      return;
    }

    const doc = await prisma.userDocument.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!doc) {
      res.status(404).json({ error: 'Not found', message: 'Document not found' });
      return;
    }

    const updated = await prisma.userDocument.update({
      where: { id },
      data: {
        documentType: documentType.trim(),
        description: description?.trim() || null,
        expirationDate: new Date(expirationDate)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: {
        id: updated.id,
        documentType: updated.documentType,
        description: updated.description,
        expirationDate: updated.expirationDate.toISOString().split('T')[0],
        createdAt: updated.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Database error', message: 'Unable to update document' });
  }
};
