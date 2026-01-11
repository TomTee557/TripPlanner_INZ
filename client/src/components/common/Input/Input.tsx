import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import './Input.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
    const containerClasses = [
      'input-container',
      fullWidth && 'input-container--full-width',
      error && 'input-container--error'
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses}>
        {label && (
          <label className="input-container__label" htmlFor={props.id}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`input-container__input ${className}`}
          {...props}
        />
        {error && (
          <span className="input-container__error">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
