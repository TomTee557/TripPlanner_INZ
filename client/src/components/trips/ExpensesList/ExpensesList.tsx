import { useState, useEffect } from 'react';
import type { Expense, ExpenseCategory, CreateExpenseData } from '../../../types';
import * as expensesService from '../../../services/expenses.service';
import './ExpensesList.scss';

interface ExpensesListProps {
  tripId: string;
}

export const ExpensesList: React.FC<ExpensesListProps> = ({ tripId }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateExpenseData>({
    categoryId: 0,
    amount: 0,
    currency: 'USD',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
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
    } catch (error) {
      console.error('Failed to load expenses:', error);
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
      });
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expensesService.deleteExpense(tripId, expenseId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const totals = expensesService.calculateTotalExpenses(expenses);

  if (loading) {
    return <div className="expenses-list__loading">Loading expenses...</div>;
  }

  return (
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
            <div key={expense.id} className="expense-item">
              <span className="expense-item__icon">{expense.categoryIcon}</span>
              <div className="expense-item__info">
                <span className="expense-item__category">{expense.categoryName}</span>
                <span className="expense-item__description">{expense.description}</span>
                <span className="expense-item__date">{expense.expenseDate}</span>
              </div>
              <div className="expense-item__amount">
                {expense.amount.toFixed(2)} {expense.currency}
              </div>
              <button
                className="expense-item__delete"
                onClick={() => handleDelete(expense.id)}
              >
                <img src="/delete.png" alt="Delete" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpensesList;
