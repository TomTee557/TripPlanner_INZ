import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchTripsRequest } from '@store/slices/tripsSlice';
import { generateSmartPacking } from '@services/ai.service';
import { getPackingCategories, createPackingItem } from '@services/packing.service';
import { getExpenseCategories, createExpense } from '@services/expenses.service';
import { createTodoItem } from '@services/todos.service';
import api from '@services/api';
import type {
  SmartPackFormSnapshot,
  SmartPackContext,
  SmartPackAiPackingItem,
  SmartPackAiTodoItem,
  SmartPackAiExpenseItem,
} from '@types';
import './SmartPackModal.scss';

// ─── Phase types ──────────────────────────────────────────────────────────────
type Phase = 'questions' | 'loading' | 'preview' | 'saving';
type PreviewTab = 'packing' | 'todos' | 'expenses';

// ─── Selectable items in preview ─────────────────────────────────────────────
interface SelectablePackingItem extends SmartPackAiPackingItem { checked: boolean; }
interface SelectableTodoItem extends SmartPackAiTodoItem { checked: boolean; }
interface SelectableExpenseItem extends SmartPackAiExpenseItem { checked: boolean; }

// ─── Props ─────────────────────────────────────────────────────────────────―─
interface SmartPackModalProps {
  tripFormData: SmartPackFormSnapshot;
  onSuccess: () => void;
  onCancel: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ACTIVITY_OPTIONS = [
  'Beach & swimming', 'Hiking & trekking', 'City sightseeing', 'Museums & culture',
  'Skiing & winter sports', 'Cycling', 'Water sports', 'Shopping', 'Nightlife',
  'Wildlife & nature', 'Camping', 'Road trip', 'Relaxation & spa',
];

const ACCOMMODATION_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'hotel', label: 'Hotel / Resort' },
  { value: 'hostel', label: 'Hostel / Shared dorm' },
  { value: 'airbnb', label: 'Airbnb / Apartment' },
  { value: 'camping', label: 'Camping / Tent' },
  { value: 'friend\'s place', label: "Friend's place" },
  { value: 'cruise', label: 'Cruise ship' },
  { value: 'other', label: 'Other' },
];

const TRANSPORT_TO_OPTIONS = [
  'Plane', 'Train', 'Car', 'Bus / Coach', 'Boat / Ferry', 'Motorbike',
];

const TRANSPORT_AROUND_OPTIONS = [
  'Rental car', 'Public transport', 'Taxi / Rideshare', 'Bicycle', 'Walking / On foot', 'Motorbike', 'Boat / Ferry',
];

const PRIORITY_COLORS: Record<string, string> = {
  high: '#c0392b',
  medium: '#e67e22',
  low: '#27ae60',
};

// ─── Currency code → symbol lookup ───────────────────────────────────────────
const CURRENCY_SYMBOL: Record<string, string> = {
  PLN: 'zł', USD: '$', EUR: '€', GBP: '£', CHF: 'CHF',
  JPY: '¥', CAD: 'C$', AUD: 'A$', SEK: 'kr', NOK: 'kr', DKK: 'kr', CZK: 'Kč', HUF: 'Ft',
};

// ─── Component ────────────────────────────────────────────────────────────────
export const SmartPackModal = ({ tripFormData, onSuccess, onCancel }: SmartPackModalProps) => {
  const dispatch = useDispatch();

  // Phase
  const [phase, setPhase] = useState<Phase>('questions');
  const [activeTab, setActiveTab] = useState<PreviewTab>('packing');
  const [error, setError] = useState('');

  // Context form
  const [context, setContext] = useState<SmartPackContext>({
    activities: [],
    customActivity: '',
    city: '',
    accommodation: '',
    transportToDestination: [],
    transportAround: [],
    groupSize: 1,
    specialNeeds: '',
  });

  // Preview data
  const [packingItems, setPackingItems] = useState<SelectablePackingItem[]>([]);
  const [todoItems, setTodoItems]     = useState<SelectableTodoItem[]>([]);
  const [expenses, setExpenses]       = useState<SelectableExpenseItem[]>([]);
  const [note, setNote]               = useState('');

  // Derive count of checked items per tab
  const checkedPacking  = packingItems.filter((i) => i.checked).length;
  const checkedTodos    = todoItems.filter((i) => i.checked).length;
  const checkedExpenses = expenses.filter((i) => i.checked).length;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const toggleActivity = (a: string) => {
    setContext((prev) => ({
      ...prev,
      activities: prev.activities.includes(a)
        ? prev.activities.filter((x) => x !== a)
        : [...prev.activities, a],
    }));
  };

  const toggleTransportTo = (t: string) => {
    setContext((prev) => ({
      ...prev,
      transportToDestination: prev.transportToDestination.includes(t)
        ? prev.transportToDestination.filter((x) => x !== t)
        : [...prev.transportToDestination, t],
    }));
  };

  const toggleTransportAround = (t: string) => {
    setContext((prev) => ({
      ...prev,
      transportAround: prev.transportAround.includes(t)
        ? prev.transportAround.filter((x) => x !== t)
        : [...prev.transportAround, t],
    }));
  };

  const handleGenerate = async () => {
    setError('');
    setPhase('loading');
    try {
      const result = await generateSmartPacking(tripFormData, context);
      setPackingItems(result.packingItems.map((i) => ({ ...i, checked: true })));
      setTodoItems(result.todoItems.map((i) => ({ ...i, checked: true })));
      setExpenses(result.expenses.map((i) => ({ ...i, checked: true })));
      setNote(result.note || '');
      setActiveTab('packing');
      setPhase('preview');
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to generate suggestions.');
      setPhase('questions');
    }
  };

  const handleSave = async () => {
    setError('');
    setPhase('saving');
    try {
      // 1. Create the trip
      const tripResponse: any = await api.post<any>('/trips', {
        title: tripFormData.title,
        country: tripFormData.country,
        dateFrom: tripFormData.dateFrom,
        dateTo: tripFormData.dateTo,
        budget: tripFormData.price
          ? `${CURRENCY_SYMBOL[tripFormData.budgetCurrency] ?? tripFormData.budgetCurrency}${parseFloat(tripFormData.price).toFixed(2)}`
          : undefined,
        tripType: tripFormData.tripType || undefined,
        image: tripFormData.picture || undefined,
        description: note.trim() || tripFormData.description || undefined,
        tags: tripFormData.tags || undefined,
        participants: tripFormData.participantIds,
      });

      const tripId: string = tripResponse.tripId;
      if (!tripId) throw new Error('Server did not return tripId');

      // 2. Fetch categories (parallel)
      const [packingCats, expenseCats] = await Promise.all([
        getPackingCategories(),
        getExpenseCategories(),
      ]);

      const packCatMap = new Map(packingCats.map((c) => [c.name, c.id]));
      const expCatMap  = new Map(expenseCats.map((c) => [c.name, c.id]));

      // 3. Create items in parallel
      const packPromises = packingItems
        .filter((i) => i.checked)
        .map((i) =>
          createPackingItem(tripId, {
            categoryId: packCatMap.get(i.category) ?? packCatMap.get('Other') ?? 8,
            name: i.name,
            quantity: i.quantity,
            priority: i.priority,
          })
        );

      const todoPromises = todoItems
        .filter((i) => i.checked)
        .map((i) =>
          createTodoItem(tripId, {
            title: i.title,
            description: i.description,
            priority: i.priority,
            dueDate: i.dueDate,
          })
        );

      const expPromises = expenses
        .filter((i) => i.checked)
        .map((i) =>
          createExpense(tripId, {
            categoryId: expCatMap.get(i.categoryName) ?? expCatMap.get('Other') ?? 8,
            amount: i.amount,
            currency: i.currency,
            description: i.description,
            expenseDate: i.expenseDate,
          })
        );

      await Promise.all([...packPromises, ...todoPromises, ...expPromises]);

      // 4. Refresh trips
      dispatch(fetchTripsRequest());
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save trip.');
      setPhase('preview');
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const toggleItem = <T extends { checked: boolean }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number
  ) => {
    setter((prev) => prev.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item)));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (phase === 'loading' || phase === 'saving') {
    return (
      <div className="smart-pack-modal__phase smart-pack-modal__phase--loading">
        <div className="smart-pack-modal__spinner" />
        <p className="smart-pack-modal__loading-text">
          {phase === 'loading' ? 'Generating your personalised packing plan…' : 'Creating your trip…'}
        </p>
      </div>
    );
  }

  if (phase === 'questions') {
    return (
      <div className="smart-pack-modal__phase smart-pack-modal__phase--questions">
        <p className="smart-pack-modal__intro">
          Answer a few quick questions and AI will generate a personalised packing list, to-do list, estimated expenses, and a trip note for <strong>{tripFormData.country}</strong>.
        </p>

        {/* Activities */}
        <div className="smart-pack-modal__field">
          <label className="smart-pack-modal__label">Planned activities</label>
          <div className="smart-pack-modal__chips">
            {ACTIVITY_OPTIONS.map((a) => (
              <button
                key={a}
                type="button"
                className={`smart-pack-modal__chip ${context.activities.includes(a) ? 'smart-pack-modal__chip--active' : ''}`}
                onClick={() => toggleActivity(a)}
              >
                {a}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="smart-pack-modal__input smart-pack-modal__input--activity"
            placeholder="Other activity (e.g. paragliding, diving)…"
            value={context.customActivity}
            onChange={(e) => setContext((p) => ({ ...p, customActivity: e.target.value }))}
          />
        </div>

        {/* City + Accommodation */}
        <div className="smart-pack-modal__row">
          <div className="smart-pack-modal__field">
            <label className="smart-pack-modal__label">City / region <span className="smart-pack-modal__optional">(optional — improves AI climate estimate)</span></label>
            <input
              type="text"
              className="smart-pack-modal__input"
              placeholder={`e.g. Tokyo, Tenerife South, Zakopane`}
              value={context.city}
              onChange={(e) => setContext((p) => ({ ...p, city: e.target.value }))}
            />
          </div>

          <div className="smart-pack-modal__field">
            <label className="smart-pack-modal__label">Accommodation</label>
            <select
              className="smart-pack-modal__select"
              value={context.accommodation}
              onChange={(e) => setContext((p) => ({ ...p, accommodation: e.target.value }))}
            >
              {ACCOMMODATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Transport to destination */}
        <div className="smart-pack-modal__field">
          <label className="smart-pack-modal__label">Transport to destination</label>
          <div className="smart-pack-modal__chips">
            {TRANSPORT_TO_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                className={`smart-pack-modal__chip ${context.transportToDestination.includes(t) ? 'smart-pack-modal__chip--active' : ''}`}
                onClick={() => toggleTransportTo(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Transport around */}
        <div className="smart-pack-modal__field">
          <label className="smart-pack-modal__label">Transport around destination</label>
          <div className="smart-pack-modal__chips">
            {TRANSPORT_AROUND_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                className={`smart-pack-modal__chip ${context.transportAround.includes(t) ? 'smart-pack-modal__chip--active' : ''}`}
                onClick={() => toggleTransportAround(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Group size + special needs */}
        <div className="smart-pack-modal__row">
          <div className="smart-pack-modal__field">
            <label className="smart-pack-modal__label">Group size</label>
            <input
              type="number"
              className="smart-pack-modal__input"
              min={1}
              max={50}
              value={context.groupSize}
              onChange={(e) => setContext((p) => ({ ...p, groupSize: Number(e.target.value) || 1 }))}
            />
          </div>

          <div className="smart-pack-modal__field smart-pack-modal__field--grow">
            <label className="smart-pack-modal__label">Special needs (dietary, medical, etc.)</label>
            <input
              type="text"
              className="smart-pack-modal__input"
              placeholder="e.g. vegetarian diet, asthma medication"
              value={context.specialNeeds}
              onChange={(e) => setContext((p) => ({ ...p, specialNeeds: e.target.value }))}
            />
          </div>
        </div>

        {error && <p className="smart-pack-modal__error">{error}</p>}

        <div className="smart-pack-modal__actions">
          <button type="button" className="smart-pack-modal__btn smart-pack-modal__btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="smart-pack-modal__btn smart-pack-modal__btn--primary" onClick={handleGenerate}>
            Generate AI plan ✨
          </button>
        </div>
      </div>
    );
  }

  // ── PREVIEW phase ─────────────────────────────────────────────────────────
  return (
    <div className="smart-pack-modal__phase smart-pack-modal__phase--preview">
      <p className="smart-pack-modal__intro">
        Review AI suggestions for <strong>{tripFormData.country}</strong>. Uncheck items you don't want to add, then click <em>Save &amp; Create Trip</em>.
      </p>

      {/* Note */}
      <div className="smart-pack-modal__note-section">
        <label className="smart-pack-modal__label">Trip note (will be saved as description)</label>
        <textarea
          className="smart-pack-modal__textarea"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="smart-pack-modal__tabs">
        {(['packing', 'todos', 'expenses'] as PreviewTab[]).map((tab) => {
          const count = tab === 'packing' ? checkedPacking : tab === 'todos' ? checkedTodos : checkedExpenses;
          const total = tab === 'packing' ? packingItems.length : tab === 'todos' ? todoItems.length : expenses.length;
          const label = tab === 'packing' ? 'Packing List' : tab === 'todos' ? 'To-Do' : 'Expenses';
          return (
            <button
              key={tab}
              type="button"
              className={`smart-pack-modal__tab ${activeTab === tab ? 'smart-pack-modal__tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {label}
              <span className="smart-pack-modal__tab-badge">{count}/{total}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="smart-pack-modal__tab-content">
        {activeTab === 'packing' && (
          <ul className="smart-pack-modal__list">
            {packingItems.map((item, i) => (
              <li key={i} className={`smart-pack-modal__list-item ${!item.checked ? 'smart-pack-modal__list-item--unchecked' : ''}`}>
                <input
                  type="checkbox"
                  className="smart-pack-modal__checkbox"
                  checked={item.checked}
                  onChange={() => toggleItem(setPackingItems, i)}
                />
                <span className="smart-pack-modal__item-name">{item.name}</span>
                <span className="smart-pack-modal__item-meta">{item.category}</span>
                <span className="smart-pack-modal__item-meta">×{item.quantity}</span>
                <span
                  className="smart-pack-modal__priority-dot"
                  style={{ background: PRIORITY_COLORS[item.priority] }}
                  title={item.priority}
                />
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'todos' && (
          <ul className="smart-pack-modal__list">
            {todoItems.map((item, i) => (
              <li key={i} className={`smart-pack-modal__list-item ${!item.checked ? 'smart-pack-modal__list-item--unchecked' : ''}`}>
                <input
                  type="checkbox"
                  className="smart-pack-modal__checkbox"
                  checked={item.checked}
                  onChange={() => toggleItem(setTodoItems, i)}
                />
                <div className="smart-pack-modal__item-text">
                  <span className="smart-pack-modal__item-name">{item.title}</span>
                  {item.description && <span className="smart-pack-modal__item-desc">{item.description}</span>}
                </div>
                <span className="smart-pack-modal__item-meta">{item.dueDate || ''}</span>
                <span
                  className="smart-pack-modal__priority-dot"
                  style={{ background: PRIORITY_COLORS[item.priority] }}
                  title={item.priority}
                />
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'expenses' && (
          <ul className="smart-pack-modal__list">
            {expenses.map((item, i) => (
              <li key={i} className={`smart-pack-modal__list-item ${!item.checked ? 'smart-pack-modal__list-item--unchecked' : ''}`}>
                <input
                  type="checkbox"
                  className="smart-pack-modal__checkbox"
                  checked={item.checked}
                  onChange={() => toggleItem(setExpenses, i)}
                />
                <div className="smart-pack-modal__item-text">
                  <span className="smart-pack-modal__item-name">{item.description}</span>
                  <span className="smart-pack-modal__item-desc">{item.categoryName}</span>
                </div>
                <span className="smart-pack-modal__item-amount">
                  {item.currency} {item.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="smart-pack-modal__error">{error}</p>}

      <div className="smart-pack-modal__actions">
        <button type="button" className="smart-pack-modal__btn smart-pack-modal__btn--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="smart-pack-modal__btn smart-pack-modal__btn--outline"
          onClick={() => setPhase('questions')}
        >
          ← Regenerate
        </button>
        <button type="button" className="smart-pack-modal__btn smart-pack-modal__btn--primary" onClick={handleSave}>
          Save &amp; Create Trip
        </button>
      </div>
    </div>
  );
};
