import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { Parameter } from '@/types';

interface ParameterInputProps {
  parameter: Parameter;
  value: any;
  onChange: (value: any) => void;
}

export function ParameterInput({ parameter, value, onChange }: ParameterInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const renderInput = () => {
    switch (parameter.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={localValue ?? ''}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : '')}
            min={parameter.min}
            max={parameter.max}
            step={parameter.step ?? 1}
            placeholder={parameter.placeholder}
          />
        );

      case 'color':
        return (
          <div className="flex gap-2">
            <Input
              type="color"
              value={localValue || '#000000'}
              onChange={(e) => handleChange(e.target.value)}
              className="w-20 h-9 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={localValue ?? ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={parameter.placeholder || '#000000'}
              className="flex-1"
            />
          </div>
        );

      case 'multiColor':
        return (
          <div className="space-y-2">
            <Input
              type="text"
              value={localValue ?? ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={parameter.placeholder || '#000000,#FFFFFF'}
            />
            <div className="flex gap-1 flex-wrap">
              {String(localValue || '')
                .split(',')
                .filter((c) => c.trim())
                .map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: color.trim() }}
                    title={color.trim()}
                  />
                ))}
            </div>
          </div>
        );

      case 'select':
        return (
          <Select value={localValue ?? ''} onChange={(e) => handleChange(e.target.value)}>
            {parameter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case 'timestamp':
        return (
          <div className="space-y-2">
            <Input
              type="datetime-local"
              value={
                localValue
                  ? new Date(Number(localValue)).toISOString().slice(0, 16)
                  : new Date().toISOString().slice(0, 16)
              }
              onChange={(e) => {
                const timestamp = new Date(e.target.value).getTime();
                handleChange(timestamp);
              }}
            />
            <Input
              type="number"
              value={localValue ?? Date.now()}
              onChange={(e) => handleChange(Number(e.target.value))}
              placeholder="Unix timestamp (ms)"
              className="text-xs"
            />
          </div>
        );

      case 'url':
      case 'text':
      default:
        return (
          <Input
            type="text"
            value={localValue ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={parameter.placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={parameter.name} className="text-sm font-medium">
        {parameter.label}
        {parameter.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderInput()}
      {parameter.description && (
        <p className="text-xs text-muted-foreground">{parameter.description}</p>
      )}
    </div>
  );
}

