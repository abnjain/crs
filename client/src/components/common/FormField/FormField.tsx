/**
 * ============================================================
 * FormField - reusable input with label, error, and info
 * ============================================================
 */

import { useId, type ChangeEvent } from 'react';

export type FormFieldType =
  | 'text'
  | 'password'
  | 'email'
  | 'url'
  | 'tel'
  | 'search'
  | 'checkbox'
  | 'radio'
  | 'range'
  | 'date'
  | 'time'
  | 'datetime'
  | 'datetime-local'
  | 'file'
  | 'select'
  | 'number'
  | 'address';

export type FormFieldOption = { label: string; value: string };

export interface FormFieldProps {
  name: string;
  label: string;
  type?: FormFieldType;
  value?: string | number | boolean;
  onChange?: (value: string | number | boolean | FileList | null) => void;
  placeholder?: string;
  options?: FormFieldOption[];
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  info?: string;
  className?: string;
  id?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  rows?: number;
  accept?: string;
  multiple?: boolean;
}

function isFilledValue(type: FormFieldType, value?: string | number | boolean): boolean {
  if (type === 'checkbox') return Boolean(value);
  if (type === 'radio') return value !== undefined && value !== '';
  if (type === 'range') return value !== undefined && value !== '' && value !== null;
  if (type === 'number') return value !== undefined && value !== '' && value !== null;
  return typeof value === 'string' ? value.trim().length > 0 : value !== undefined && value !== null;
}

export function FormField({
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  options = [],
  required = false,
  disabled = false,
  readOnly = false,
  error,
  info,
  className = '',
  id,
  min,
  max,
  step,
  minLength,
  maxLength,
  pattern,
  inputMode,
  autoComplete,
  rows = 4,
  accept,
  multiple,
}: FormFieldProps) {
  const autoId = useId();
  const fieldId = id ?? `${name}-${autoId}`;
  const filled = isFilledValue(type, value);
  const hasError = Boolean(error);
  const inputType = type === 'datetime' ? 'datetime-local' : type;

  const fieldClassName = [
    'form-field',
    filled ? 'form-field--filled' : null,
    hasError ? 'form-field--error' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const describedBy = [
    info ? `${fieldId}-info` : null,
    hasError ? `${fieldId}-error` : null,
  ]
    .filter(Boolean)
    .join(' ');

  const commonInputProps = {
    id: fieldId,
    name,
    required,
    disabled,
    readOnly,
    min,
    max,
    step,
    minLength,
    maxLength,
    pattern,
    inputMode,
    autoComplete,
    placeholder,
    'aria-invalid': hasError || undefined,
    'aria-describedby': describedBy || undefined,
  };

  const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!onChange) return;
    if (type === 'number' || type === 'range') {
      const raw = event.target.value;
      onChange(raw === '' ? '' : Number(raw));
      return;
    }
    onChange(event.target.value);
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.files);
  };

  if (type === 'checkbox') {
    return (
      <div className={fieldClassName}>
        <label className="form-field-check" htmlFor={fieldId}>
          <input
            {...commonInputProps}
            type="checkbox"
            checked={Boolean(value)}
            onChange={handleCheckboxChange}
          />
          <span className="form-field-check-label">
            {label}
            {required && <span className="req"> *</span>}
          </span>
        </label>
        {info && (
          <div id={`${fieldId}-info`} className="form-field-info">
            {info}
          </div>
        )}
        {hasError && (
          <div id={`${fieldId}-error`} className="form-field-error">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={fieldClassName}>
      <label className="form-field-label" htmlFor={fieldId}>
        {label}
        {required && <span className="req"> *</span>}
      </label>

      {type === 'radio' && (
        <div className="form-field-radio-group" role="radiogroup">
          {options.map((opt) => (
            <label key={opt.value} className="form-field-radio">
              <input
                {...commonInputProps}
                type="radio"
                value={opt.value}
                checked={String(value ?? '') === opt.value}
                onChange={handleTextChange}
              />
              <span className="form-field-radio-label">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {type === 'select' && (
        <select
          {...commonInputProps}
          className="form-input"
          value={String(value ?? '')}
          onChange={handleTextChange}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {type === 'address' && (
        <textarea
          {...commonInputProps}
          className="form-input form-input--textarea"
          rows={rows}
          value={String(value ?? '')}
          onChange={handleTextChange}
        />
      )}

      {type !== 'radio' && type !== 'select' && type !== 'address' && type !== 'checkbox' && (
        <input
          {...commonInputProps}
          className="form-input"
          type={inputType}
          value={type === 'file' ? undefined : String(value ?? '')}
          onChange={type === 'file' ? handleFileChange : handleTextChange}
          accept={accept}
          multiple={multiple}
        />
      )}

      {info && (
        <div id={`${fieldId}-info`} className="form-field-info">
          {info}
        </div>
      )}
      {hasError && (
        <div id={`${fieldId}-error`} className="form-field-error">
          {error}
        </div>
      )}
    </div>
  );
}
