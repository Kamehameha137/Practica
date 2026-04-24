import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className={`form-group ${error ? 'has-error' : ''}`}>
        {label && <label className="form-label" htmlFor={props.id}>{label}</label>}
        <textarea
          ref={ref}
          className={`form-textarea ${className}`}
          {...props}
        />
        {error && <div className="form-error">{error}</div>}
        {hint && !error && <div className="form-hint">{hint}</div>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';