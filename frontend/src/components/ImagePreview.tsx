import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  endpointName: string;
}

export function ImagePreview({ imageUrl, endpointName }: ImagePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setKey((k) => k + 1);
  }, [imageUrl]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative min-h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-red-500">Failed to load image</p>
            </div>
          )}
          <img
            key={key}
            src={imageUrl}
            alt={`${endpointName} preview`}
            className={`max-w-full max-h-[500px] object-contain transition-opacity duration-200 ${
              loading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

