import { useState, useEffect } from 'react';
import type { PackingItem, PackingCategory, CreatePackingItemData } from '../../../types';
import * as packingService from '../../../services/packing.service';
import './PackingList.scss';

interface PackingListProps {
  tripId: string;
}

export const PackingList: React.FC<PackingListProps> = ({ tripId }) => {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [categories, setCategories] = useState<PackingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreatePackingItemData>({
    categoryId: 0,
    name: '',
    quantity: 1,
    priority: 'medium',
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
    } catch (error) {
      console.error('Failed to load packing items:', error);
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
      setFormData({ categoryId: 0, name: '', quantity: 1, priority: 'medium' });
    } catch (error) {
      console.error('Failed to create packing item:', error);
    }
  };

  const handleTogglePacked = async (itemId: string, isPacked: boolean) => {
    try {
      await packingService.togglePackedStatus(tripId, itemId, !isPacked);
      await loadData();
    } catch (error) {
      console.error('Failed to toggle packed status:', error);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await packingService.deletePackingItem(tripId, itemId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const progress = packingService.calculatePackingProgress(items);

  if (loading) return <div>Loading...</div>;

  return (
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
          <button type="submit">Add</button>
        </form>
      )}

      <div className="packing-list__items">
        {items.map((item) => (
          <div key={item.id} className={`packing-item ${item.isPacked ? 'packed' : ''}`}>
            <input
              type="checkbox"
              checked={item.isPacked}
              onChange={() => handleTogglePacked(item.id, item.isPacked)}
            />
            <span className="packing-item__icon">{item.categoryIcon}</span>
            <div className="packing-item__info">
              <span className="packing-item__name">{item.name}</span>
              <span className="packing-item__meta">Qty: {item.quantity} | {item.priority}</span>
            </div>
            <button onClick={() => handleDelete(item.id)}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackingList;
