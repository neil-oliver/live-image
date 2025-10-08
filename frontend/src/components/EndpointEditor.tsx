import { useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ParameterInput } from '@/components/ParameterInput';
import { ImagePreview } from '@/components/ImagePreview';
import { URLDisplay } from '@/components/URLDisplay';
import { RotateCcw, Sparkles } from 'lucide-react';
import type { EndpointConfig } from '@/types';
import { useStore } from '@/lib/store';
import { buildImageUrl } from '@/lib/url-builder';

interface EndpointEditorProps {
  endpoint: EndpointConfig;
}

export function EndpointEditor({ endpoint }: EndpointEditorProps) {
  const { getParameters, setParameter, resetParameters } = useStore();
  const parameters = getParameters(endpoint.id);

  const imageUrl = useMemo(() => {
    return buildImageUrl(endpoint, parameters);
  }, [endpoint, parameters]);

  const handleParameterChange = useCallback(
    (paramName: string, value: any) => {
      setParameter(endpoint.id, paramName, value);
    },
    [endpoint.id, setParameter]
  );

  const handleReset = useCallback(() => {
    resetParameters(endpoint.id);
  }, [endpoint.id, resetParameters]);

  const handleLoadExample = useCallback(
    (example: Record<string, any>) => {
      Object.entries(example).forEach(([key, value]) => {
        // Skip display name fields, but include actual parameter fields
        if (key !== 'exampleName' && key !== 'iconName') {
          setParameter(endpoint.id, key, value);
        } else if (key === 'iconName') {
          // Map iconName to name parameter for icon endpoint
          setParameter(endpoint.id, 'name', value);
        }
      });
    },
    [endpoint.id, setParameter]
  );

  const categoryColors: Record<string, string> = {
    graphics: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    ui: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    social: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    data: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{endpoint.name}</h1>
          <Badge className={categoryColors[endpoint.category]}>{endpoint.category}</Badge>
        </div>
        <p className="text-muted-foreground">{endpoint.description}</p>
      </div>

      {/* Examples */}
      {endpoint.examples && endpoint.examples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Examples
            </CardTitle>
            <CardDescription>Load pre-configured examples to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {endpoint.examples.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoadExample(example)}
                >
                  {example.name || example.exampleName || `Example ${index + 1}`}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Parameters */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">Parameters</CardTitle>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {endpoint.parameters.map((param) => (
                <ParameterInput
                  key={param.name}
                  parameter={param}
                  value={parameters[param.name]}
                  onChange={(value) => handleParameterChange(param.name, value)}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Preview & URL */}
        <div className="space-y-6">
          <ImagePreview imageUrl={imageUrl} endpointName={endpoint.name} />
          <URLDisplay url={imageUrl} />
        </div>
      </div>
    </div>
  );
}

