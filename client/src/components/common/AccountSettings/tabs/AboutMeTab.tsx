import { useState, useEffect } from 'react';
import type { UserProfile } from '@types';
import { getProfile, updateProfile } from '@services/account.service';

export const AboutMeTab = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [birthday, setBirthday] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProfile();
        if (res.data) {
          setProfile(res.data);
          setBirthday(res.data.birthday || '');
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSaveBirthday = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await updateProfile({ birthday: birthday || null });
      setSuccessMsg('Birthday updated successfully');
      if (profile) {
        setProfile({ ...profile, birthday: birthday || null });
      }
    } catch {
      setError('Failed to update birthday');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="about-tab__loading">Loading profile...</p>;
  if (!profile) return <p className="about-tab__error">Could not load profile</p>;

  const initials = `${profile.name.charAt(0)}${profile.surname.charAt(0)}`.toUpperCase();

  return (
    <div className="about-tab">
      <div className="about-tab__header">
        <div className="about-tab__avatar">{initials}</div>
        <div className="about-tab__name-block">
          <h3 className="about-tab__fullname">{profile.name} {profile.surname}</h3>
          <span className="about-tab__role">{profile.role}</span>
        </div>
      </div>

      <div className="about-tab__info">
        <div className="about-tab__row">
          <span className="about-tab__label">Email</span>
          <span className="about-tab__value">{profile.email}</span>
        </div>
        <div className="about-tab__row">
          <span className="about-tab__label">Account created</span>
          <span className="about-tab__value">
            {new Date(profile.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="about-tab__row about-tab__row--editable">
          <span className="about-tab__label">Birthday</span>
          <div className="about-tab__birthday-edit">
            <input
              className="about-tab__input"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
            <button
              className="about-tab__save-btn"
              onClick={handleSaveBirthday}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="about-tab__msg about-tab__msg--error">{error}</div>}
      {successMsg && <div className="about-tab__msg about-tab__msg--success">{successMsg}</div>}
    </div>
  );
};
