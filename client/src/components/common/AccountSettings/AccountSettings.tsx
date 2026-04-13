import { useState } from 'react';
import { DocumentsTab } from './tabs/DocumentsTab';
import { AboutMeTab } from './tabs/AboutMeTab';
import { SettingsTab } from './tabs/SettingsTab';
import { InvitationsTab } from './tabs/InvitationsTab';
import './AccountSettings.scss';

type TabKey = 'documents' | 'about' | 'settings' | 'invitations';

interface AccountSettingsProps {
  notificationCount: number;
  onNotificationChange: () => void;
  onTripListChange: () => void;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: 'documents', label: 'My Documents' },
  { key: 'about', label: 'About Me' },
  { key: 'settings', label: 'Settings' },
  { key: 'invitations', label: 'Invitations' },
];

export const AccountSettings = ({ notificationCount, onNotificationChange, onTripListChange }: AccountSettingsProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('documents');

  return (
    <div className="account-settings">
      <nav className="account-settings__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`account-settings__tab ${activeTab === tab.key ? 'account-settings__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key === 'invitations' && notificationCount > 0 && (
              <span className="account-settings__tab-badge">{notificationCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="account-settings__content">
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'about' && <AboutMeTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'invitations' && <InvitationsTab onNotificationChange={onNotificationChange} onTripListChange={onTripListChange} />}
      </div>
    </div>
  );
};
