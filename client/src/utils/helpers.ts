// Utility functions for Trip Planner App

/**
 * Format date to display string (DD/MM/YYYY)
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Format date to input value (YYYY-MM-DD)
 */
export const formatDateToInput = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

/**
 * Get current date in YYYY-MM-DD format
 */
export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get current time in HH:MM format
 */
export const getCurrentTime = (): string => {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Get current date with weekday
 */
export const getCurrentDateWithWeekday = (): string => {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Calculate number of days between two dates
 */
export const calculateDaysBetween = (dateFrom: string, dateTo: string): number => {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  const diffTime = Math.abs(to.getTime() - from.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Format currency value
 */
export const formatCurrency = (value: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(value);
};

/**
 * Parse tags string to array
 */
export const parseTags = (tagsString: string | string[]): string[] => {
  if (!tagsString) return [];
  if (Array.isArray(tagsString)) return tagsString;
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
};

/**
 * Format tags array to string
 */
export const formatTagsToString = (tags: string[]): string => {
  return tags.join(', ');
};

/**
 * Debounce function for search/filter operations
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength (min 6 characters)
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Get error message from API error
 */
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Local storage helpers
 */
export const storage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to remove from localStorage:', e);
    }
  },
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }
  }
};
