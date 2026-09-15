import React, { useRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { formatDateToDDMMYYYY, toISODateString } from '../../utils/dateUtils';

interface DateInputProps {
  value: string; // expects dd/MM/yyyy or ISO date
  onChange: (formattedDate: string) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  className = '',
  required = false,
  placeholder = 'dd/MM/yyyy'
}) => {
  const nativeInputRef = useRef<HTMLInputElement>(null);

  // Always format the displayed value as dd/MM/yyyy
  const displayValue = formatDateToDDMMYYYY(value);
  const isoValue = toISODateString(displayValue);

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawIso = e.target.value; // yyyy-mm-dd
    if (rawIso) {
      const [y, m, d] = rawIso.split('-');
      onChange(`${d}/${m}/${y}`);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        required={required}
        placeholder={placeholder}
        value={displayValue === '--' ? '' : displayValue}
        onChange={handleTextChange}
        className={`w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 pr-9 font-mono-code ${className}`}
      />
      
      {/* Hidden native date input for picker UI */}
      <input
        ref={nativeInputRef}
        type="date"
        value={isoValue}
        onChange={handleNativeChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={() => {
          try {
            nativeInputRef.current?.showPicker();
          } catch (e) {
            nativeInputRef.current?.focus();
          }
        }}
        className="absolute right-2.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-200"
        title="Chọn ngày từ lịch"
      >
        <CalendarIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
