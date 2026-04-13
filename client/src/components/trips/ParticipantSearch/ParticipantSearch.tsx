import { useState } from 'react';
import api from '@services/api';
import './ParticipantSearch.scss';

interface ParticipantUser {
  id: number;
  email: string;
  name: string;
  surname: string;
}

interface ParticipantSearchProps {
  participants: ParticipantUser[];
  onSave: (participants: ParticipantUser[]) => void;
  onCancel: () => void;
}

export const ParticipantSearch = ({ participants: initialParticipants, onSave, onCancel }: ParticipantSearchProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [localParticipants, setLocalParticipants] = useState<ParticipantUser[]>(initialParticipants);

  const handleAddParticipant = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    // Check if already added
    if (localParticipants.some(p => p.email.toLowerCase() === email.trim().toLowerCase())) {
      setError('This user is already added');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response: any = await api.post('/users/check-email', { email: email.trim() });
      
      if (response.success && response.data) {
        setLocalParticipants(prev => [...prev, response.data]);
        setEmail('');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'User does not exist';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = (userId: number) => {
    setLocalParticipants(prev => prev.filter(p => p.id !== userId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddParticipant();
    }
  };

  return (
    <div className="participant-search-overlay">
      <div className="participant-search">
        <h3 className="participant-search__title">Add Participants</h3>
        
        <div className="participant-search__input-row">
          <input
            type="email"
            className="participant-search__input"
            placeholder="Enter user email..."
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="participant-search__btn participant-search__btn--add"
            onClick={handleAddParticipant}
            disabled={loading || !email.trim()}
          >
            {loading ? 'Checking...' : 'Add participant'}
          </button>
          <button
            className="participant-search__btn participant-search__btn--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>

        {error && (
          <p className="participant-search__error">{error}</p>
        )}

        {localParticipants.length > 0 && (
          <div className="participant-search__list">
            <h4 className="participant-search__list-title">
              Participants ({localParticipants.length})
            </h4>
            {localParticipants.map((user) => (
              <div key={user.id} className="participant-search__item">
                <div className="participant-search__item-info">
                  <span className="participant-search__item-name">
                    {user.name} {user.surname}
                  </span>
                  <span className="participant-search__item-email">
                    {user.email}
                  </span>
                </div>
                <button
                  className="participant-search__item-remove"
                  onClick={() => handleRemoveParticipant(user.id)}
                  title="Remove participant"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="participant-search__actions">
          <button
            className="participant-search__btn participant-search__btn--save"
            onClick={() => onSave(localParticipants)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
