import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className={`form-group ${error ? 'has-error' : ''}`}>
        {label && <label className="form-label" htmlFor={props.id}>{label}</label>}
        <input
          ref={ref}
          className={`form-input ${className}`}
          {...props}
        />
        {error && <div className="form-error">{error}</div>}
        {hint && !error && <div className="form-hint">{hint}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';