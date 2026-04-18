import { useState, useEffect } from 'react';
import type { Expense, ExpenseCategory, CreateExpenseData } from '../../../types';
import * as expensesService from '../../../services/expenses.service';
import { ErrorNotification } from '../../common/ErrorNotification/ErrorNotification';
import { ConfirmDialog } from '../../common/ConfirmDialog/ConfirmDialog';
import './ExpensesList.scss';

interface ExpensesListProps {
  tripId: string;
  isGroupTrip?: boolean;
}

export const ExpensesList = ({ tripId, isGroupTrip = false }: ExpensesListProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateExpenseData>({
    categoryId: 0,
    amount: 0,
    currency: 'USD',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    isPrivate: false,
  });

  useEffect(() => {
    loadData();
  }, [tripId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesData, categoriesData] = await Promise.all([
        expensesService.getExpenses(tripId),
        expensesService.getExpenseCategories(),
      ]);
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (error: any) {
      console.error('Failed to load expenses:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load expenses. Please try again or contact the administrator if the problem persists.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await expensesService.createExpense(tripId, formData);
      await loadData();
      setShowForm(false);
      setFormData({
        categoryId: 0,
        amount: 0,
        currency: 'USD',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
        isPrivate: false,
      });
    } catch (error: any) {
      console.error('Failed to create expense:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create expense. Please try again or contact the administrator if the problem persists.';
      setError(errorMessage);
    }
  };

  const handleDeleteClick = (expenseId: string) => {
    setConfirmDelete(expenseId);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await expensesService.deleteExpense(tripId, confirmDelete);
      setConfirmDelete(null);
      await loadData();
    } catch (error: any) {
      console.error('Failed to delete expense:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete expense. Please try again or contact the administrator if the problem persists.';
      setError(errorMessage);
      setConfirmDelete(null);
    }
  };

  const totals = expensesService.calculateTotalExpenses(expenses);

  if (loading) {
    return <div className="expenses-list__loading">Loading expenses...</div>;
  }

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
        message="Are you sure you want to delete this expense?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />
      <div className="expenses-list">
        <div className="expenses-list__header">
          <h3>Expenses</h3>
        <button className="expenses-list__add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Expense'}
        </button>
      </div>

      {showForm && (
        <form className="expenses-list__form" onSubmit={handleSubmit}>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
            required
          >
            <option value={0}>Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            required
          />

          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="PLN">PLN</option>
          </select>

          <input
            type="date"
            value={formData.expenseDate}
            onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {isGroupTrip && (
            <label className="expenses-list__form-private">
              <input
                type="checkbox"
                checked={formData.isPrivate ?? false}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              />
              Private
            </label>
          )}

          <button type="submit">Add Expense</button>
        </form>
      )}

      <div className="expenses-list__totals">
        {Object.entries(totals).map(([currency, amount]) => (
          <div key={currency} className="expenses-list__total">
            <strong>Total {currency}:</strong> {amount.toFixed(2)}
          </div>
        ))}
      </div>

      <div className="expenses-list__items">
        {expenses.length === 0 ? (
          <p className="expenses-list__empty">No expenses yet</p>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className={`expense-item${expense.isPrivate ? ' expense-item--private' : ''}`}>
              <span className="expense-item__icon">{expense.categoryIcon}</span>
              <div className="expense-item__info">
                <span className="expense-item__category">{expense.categoryName}</span>
                <span className="expense-item__description">{expense.description}</span>
                <span className="expense-item__date">{expense.expenseDate}</span>
              </div>
              <div className="expense-item__amount">
                {expense.isPrivate && <span className="expense-item__private-badge" title="Private">🔒</span>}
                {expense.amount.toFixed(2)} {expense.currency}
              </div>
              <button
                className="expense-item__delete"
                onClick={() => handleDeleteClick(expense.id)}
              >
                <img src="/delete.png" alt="Delete" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
};

export default ExpensesList;
