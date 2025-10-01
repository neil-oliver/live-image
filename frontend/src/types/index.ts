// Parameter types supported by the system
export type ParameterType = 
  | 'number' 
  | 'text' 
  | 'color' 
  | 'select' 
  | 'multiColor'
  | 'timestamp'
  | 'url';

// Parameter definition
export interface Parameter {
  name: string;
  label: string;
  type: ParameterType;
  default: string | number;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}

// Endpoint configuration
export interface EndpointConfig {
  id: string;
  name: string;
  description: string;
  path: string;
  category: 'graphics' | 'ui' | 'social' | 'data';
  parameters: Parameter[];
  examples?: Record<string, any>[];
}

// App state
export interface AppState {
  selectedEndpoint: string | null;
  parameters: Record<string, Record<string, any>>;
  setSelectedEndpoint: (id: string) => void;
  setParameter: (endpointId: string, paramName: string, value: any) => void;
  resetParameters: (endpointId: string) => void;
  getParameters: (endpointId: string) => Record<string, any>;
}

