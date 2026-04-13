import { useState, useEffect } from 'react';
import type { UserDocument, CreateDocumentData } from '@types';
import { getDocuments, createDocument, deleteDocument } from '@services/account.service';

const DOCUMENT_TYPES = [
  'Passport',
  'ID Card',
  'Visa',
  'Insurance',
  'Vaccination Card',
  'Driving License',
  'Other',
];

export const DocumentsTab = () => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0]);
  const [description, setDescription] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await getDocuments();
      setDocuments(res.data || []);
    } catch {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expirationDate) {
      setError('Expiration date is required');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const data: CreateDocumentData = {
        documentType,
        description: description.trim() || undefined,
        expirationDate,
      };
      await createDocument(data);
      setSuccessMsg('Document added successfully');
      setDescription('');
      setExpirationDate('');
      setDocumentType(DOCUMENT_TYPES[0]);
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError('');
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setSuccessMsg('Document deleted');
    } catch {
      setError('Failed to delete document');
    }
  };

  const isExpired = (date: string) => new Date(date) < new Date();
  const isExpiringSoon = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // 30 days
  };

  return (
    <div className="documents-tab">
      <form className="documents-tab__form" onSubmit={handleSubmit}>
        <h3 className="documents-tab__form-title">Add New Document</h3>
        <div className="documents-tab__form-row">
          <div className="documents-tab__field">
            <label className="documents-tab__label">Document Type</label>
            <select
              className="documents-tab__select"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="documents-tab__field">
            <label className="documents-tab__label">Expiration Date</label>
            <input
              className="documents-tab__input"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="documents-tab__field">
          <label className="documents-tab__label">Description (optional)</label>
          <textarea
            className="documents-tab__textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. passport number, notes..."
            rows={2}
          />
        </div>
        <button className="documents-tab__submit" type="submit" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Document'}
        </button>
      </form>

      {error && <div className="documents-tab__error">{error}</div>}
      {successMsg && <div className="documents-tab__success">{successMsg}</div>}

      <div className="documents-tab__list">
        <h3 className="documents-tab__list-title">Your Documents ({documents.length})</h3>
        {loading ? (
          <p className="documents-tab__loading">Loading...</p>
        ) : documents.length === 0 ? (
          <p className="documents-tab__empty">No documents added yet.</p>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="documents-tab__item">
              <div className="documents-tab__item-main">
                <span className="documents-tab__item-type">{doc.documentType}</span>
                <span
                  className={`documents-tab__item-date ${
                    isExpired(doc.expirationDate)
                      ? 'documents-tab__item-date--expired'
                      : isExpiringSoon(doc.expirationDate)
                      ? 'documents-tab__item-date--soon'
                      : ''
                  }`}
                >
                  {isExpired(doc.expirationDate) && '⚠️ '}
                  Expires: {doc.expirationDate}
                </span>
              </div>
              {doc.description && (
                <p className="documents-tab__item-desc">{doc.description}</p>
              )}
              <button
                className="documents-tab__item-delete"
                onClick={() => handleDelete(doc.id)}
                title="Delete document"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
