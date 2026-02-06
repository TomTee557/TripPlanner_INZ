import { useState, useEffect } from 'react';
import type { TodoItem, CreateTodoItemData } from '../../../types';
import * as todoService from '../../../services/todos.service';
import { ErrorNotification } from '../../common/ErrorNotification/ErrorNotification';
import { ConfirmDialog } from '../../common/ConfirmDialog/ConfirmDialog';
import './TodoList.scss';

interface TodoListProps {
  tripId: string;
}

export const TodoList: React.FC<TodoListProps> = ({ tripId }) => {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateTodoItemData>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: undefined,
  });

  useEffect(() => {
    loadItems();
  }, [tripId]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await todoService.getTodoItems(tripId);
      setItems(data);
    } catch (error) {
      console.error('Failed to load todo items:', error);      alert('Failed to load todo list. Please try again or contact the administrator if the problem persists.');    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await todoService.createTodoItem(tripId, formData);
      await loadItems();
      setShowForm(false);
      setFormData({ title: '', description: '', priority: 'medium', dueDate: undefined });
    } catch (error) {
      console.error('Failed to create todo:', error);
      setError('Failed to create todo item. Please try again or contact the administrator if the problem persists.');
    }
  };

  const handleToggleCompleted = async (itemId: string, isCompleted: boolean) => {
    try {
      await todoService.toggleCompletedStatus(tripId, itemId, !isCompleted);
      await loadItems();
    } catch (error) {
      console.error('Failed to toggle completed:', error);
      setError('Failed to update todo status. Please try again or contact the administrator if the problem persists.');
    }
  };

  const handleDeleteClick = (itemId: string) => {
    setConfirmDelete(itemId);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await todoService.deleteTodoItem(tripId, confirmDelete);
      setConfirmDelete(null);
      await loadItems();
    } catch (error) {
      console.error('Failed to delete todo:', error);
      setError('Failed to delete todo. Please try again or contact the administrator if the problem persists.');
      setConfirmDelete(null);
    }
  };

  const progress = todoService.calculateTodoProgress(items);
  const overdue = todoService.getOverdueTodos(items);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {error && <ErrorNotification message={error} onClose={() => setError(null)} />}
      <ConfirmDialog 
        isOpen={!!confirmDelete}
        message="Are you sure you want to delete this todo?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />
      <div className="todo-list">
      <div className="todo-list__header">
        <h3>To-Do List</h3>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Task'}
        </button>
      </div>

      <div className="todo-list__stats">
        <div className="stat">
          <span className="stat__value">{progress.completed} / {progress.total}</span>
          <span className="stat__label">Completed</span>
        </div>
        {overdue.length > 0 && (
          <div className="stat stat--overdue">
            <span className="stat__value">{overdue.length}</span>
            <span className="stat__label">Overdue</span>
          </div>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="todo-list__form">
          <input
            type="text"
            placeholder="Task title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <input
            type="date"
            value={formData.dueDate || ''}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value || undefined })}
          />
          <button type="submit">Add Task</button>
        </form>
      )}

      <div className="todo-list__items">
        {items.map((item) => {
          const isOverdue = overdue.some(o => o.id === item.id);
          return (
            <div key={item.id} className={`todo-item ${item.isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
              <input
                type="checkbox"
                checked={item.isCompleted}
                onChange={() => handleToggleCompleted(item.id, item.isCompleted)}
              />
              <div className="todo-item__content">
                <div className="todo-item__header">
                  <span className="todo-item__title">{item.title}</span>
                  <span className={`todo-item__priority priority-${item.priority}`}>
                    {item.priority}
                  </span>
                </div>
                {item.description && (
                  <p className="todo-item__description">{item.description}</p>
                )}
                {item.dueDate && (
                  <span className="todo-item__due">
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <button onClick={() => handleDeleteClick(item.id)}>
                <img src="/delete.png" alt="Delete" />
              </button>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="todo-list__empty">No tasks yet. Add one to get started!</div>
      )}
    </div>
    </>
  );
};

export default TodoList;
