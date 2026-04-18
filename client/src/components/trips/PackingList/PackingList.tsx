import { useState, useEffect } from 'react';
import type { PackingItem, PackingCategory, CreatePackingItemData } from '../../../types';
import * as packingService from '../../../services/packing.service';
import { ErrorNotification } from '../../common/ErrorNotification/ErrorNotification';
import { ConfirmDialog } from '../../common/ConfirmDialog/ConfirmDialog';
import './PackingList.scss';

interface PackingListProps {
  tripId: string;
  isGroupTrip?: boolean;
}

export const PackingList = ({ tripId, isGroupTrip = false }: PackingListProps) => {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [categories, setCategories] = useState<PackingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePackingItemData>({
    categoryId: 0,
    name: '',
    quantity: 1,
    priority: 'medium',
    isPrivate: false,
  });

  useEffect(() => {
    loadData();
  }, [tripId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        packingService.getPackingItems(tripId),
        packingService.getPackingCategories(),
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (error: any) {
      console.error('Failed to load packing items:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load packing list. Please try again or contact the administrator if the problem persists.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await packingService.createPackingItem(tripId, formData);
      await loadData();
      setShowForm(false);
      setFormData({ categoryId: 0, name: '', quantity: 1, priority: 'medium', isPrivate: false });
    } catch (error: any) {
      console.error('Failed to create packing item:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create packing item. Please try again or contact the administrator if the problem persists.';
      setError(errorMessage);
    }
  };

  const handleTogglePacked = async (itemId: string, isPacked: boolean) => {
    try {
      await packingService.togglePackedStatus(tripId, itemId, !isPacked);
      await loadData();
    } catch (error: any) {
      console.error('Failed to toggle packed status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update packing status. Please try again or contact the administrator if the problem persists.';
      setError(errorMessage);
    }
  };

  const handleDeleteClick = (itemId: string) => {
    setConfirmDelete(itemId);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await packingService.deletePackingItem(tripId, confirmDelete);
      setConfirmDelete(null);
      await loadData();
    } catch (error: any) {
      console.error('Failed to delete packing item:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete packing item. Please try again or contact the administrator if the problem persists.';
      setError(errorMessage);
      setConfirmDelete(null);
    }
  };

  const progress = packingService.calculatePackingProgress(items);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {error && (
        <ErrorNotification
          message={error}
          onClose={() => setError(null)}
        />
      )}
      <ConfirmDialog 
        isOpen={!!confirmDelete}
        message="Are you sure you want to delete this item?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />
      <div className="packing-list">
        <div className="packing-list__header">
        <h3>Packing List</h3>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      <div className="packing-list__progress">
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${progress.percentage}%` }}></div>
        </div>
        <span>{progress.packed} / {progress.total} packed ({progress.percentage}%)</span>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="packing-list__form">
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
            required
          >
            <option value={0}>Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Item name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
          />
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {isGroupTrip && (
            <label className="packing-list__form-private">
              <input
                type="checkbox"
                checked={formData.isPrivate ?? false}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              />
              Private
            </label>
          )}
          <button type="submit">Add</button>
        </form>
      )}

      <div className="packing-list__items">
        {items.map((item) => (
          <div key={item.id} className={`packing-item ${item.isPacked ? 'packed' : ''}${item.isPrivate ? ' packing-item--private' : ''}`}>
            <input
              type="checkbox"
              checked={item.isPacked}
              onChange={() => handleTogglePacked(item.id, item.isPacked)}
            />
            <span className="packing-item__icon">{item.categoryIcon}</span>
            <div className="packing-item__info">
              <span className="packing-item__name">
                {item.isPrivate && <span title="Private">🔒 </span>}{item.name}
              </span>
              <span className="packing-item__meta">Qty: {item.quantity} | {item.priority}</span>
            </div>
            <button onClick={() => handleDeleteClick(item.id)}>
              <img src="/delete.png" alt="Delete" />
            </button>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default PackingList;
