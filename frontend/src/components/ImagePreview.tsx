import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  endpointName: string;
}

export function ImagePreview({ imageUrl, endpointName }: ImagePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);
  const [downloading, setDownloading] = useState<'svg' | 'png' | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setKey((k) => k + 1);
  }, [imageUrl]);

  const downloadSVG = async () => {
    setDownloading('svg');
    try {
      const response = await fetch(imageUrl);
      const svgContent = await response.text();
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${endpointName}-${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download SVG:', err);
    } finally {
      setDownloading(null);
    }
  };

  const downloadPNG = async () => {
    setDownloading('png');
    try {
      const response = await fetch(imageUrl);
      const svgContent = await response.text();
      
      // Create an image element from SVG
      const img = new Image();
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          // Convert to PNG blob
          canvas.toBlob((blob) => {
            if (blob) {
              const pngUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = pngUrl;
              a.download = `${endpointName}-${Date.now()}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(pngUrl);
            }
            setDownloading(null);
          }, 'image/png');
        }
        
        URL.revokeObjectURL(url);
      };
      
      img.onerror = () => {
        console.error('Failed to load SVG for PNG conversion');
        URL.revokeObjectURL(url);
        setDownloading(null);
      };
      
      img.src = url;
    } catch (err) {
      console.error('Failed to download PNG:', err);
      setDownloading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Preview</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSVG}
              disabled={loading || error || downloading !== null}
            >
              {downloading === 'svg' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              SVG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPNG}
              disabled={loading || error || downloading !== null}
            >
              {downloading === 'png' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              PNG
            </Button>
          </div>
        </div>
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

