import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState } from '@/types';
import { getDefaultParameters } from '@/config/endpoints';

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedEndpoint: null,
      parameters: {},
      
      setSelectedEndpoint: (id: string) => {
        set({ selectedEndpoint: id });
        
        // Initialize parameters if not already set
        const { parameters } = get();
        if (!parameters[id]) {
          const defaults = getDefaultParameters(id);
          set({
            parameters: {
              ...parameters,
              [id]: defaults,
            },
          });
        }
      },
      
      setParameter: (endpointId: string, paramName: string, value: any) => {
        const { parameters } = get();
        set({
          parameters: {
            ...parameters,
            [endpointId]: {
              ...(parameters[endpointId] || {}),
              [paramName]: value,
            },
          },
        });
      },
      
      resetParameters: (endpointId: string) => {
        const { parameters } = get();
        const defaults = getDefaultParameters(endpointId);
        set({
          parameters: {
            ...parameters,
            [endpointId]: defaults,
          },
        });
      },
      
      getParameters: (endpointId: string) => {
        const { parameters } = get();
        return parameters[endpointId] || getDefaultParameters(endpointId);
      },
    }),
    {
      name: 'live-image-store',
      partialize: (state) => ({
        parameters: state.parameters,
        selectedEndpoint: state.selectedEndpoint,
      }),
    }
  )
);

