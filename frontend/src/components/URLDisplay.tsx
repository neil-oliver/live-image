import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Copy, Check, Code, Loader2, X } from 'lucide-react';
import { copyToClipboard, fetchAsDataUrl } from '@/lib/utils';

interface URLDisplayProps {
  url: string;
}

export function URLDisplay({ url }: URLDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [dataUrlCopied, setDataUrlCopied] = useState(false);
  const [dataUrlLoading, setDataUrlLoading] = useState(false);
  const [dataUrlError, setDataUrlError] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyDataUrl = async () => {
    setDataUrlLoading(true);
    setDataUrlError(false);
    try {
      const dataUrl = await fetchAsDataUrl(url);
      const success = await copyToClipboard(dataUrl);
      if (success) {
        setDataUrlCopied(true);
        setTimeout(() => setDataUrlCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy data URL:', err);
      setDataUrlError(true);
      setTimeout(() => setDataUrlError(false), 2000);
    } finally {
      setDataUrlLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Generated URL</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input value={url} readOnly className="font-mono text-sm" />
          <Button onClick={handleCopy} variant="outline" size="icon" title="Copy URL">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button
            onClick={handleCopyDataUrl}
            variant="outline"
            size="icon"
            title="Copy as Data URL"
            disabled={dataUrlLoading}
          >
            {dataUrlLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : dataUrlError ? (
              <X className="w-4 h-4 text-red-500" />
            ) : dataUrlCopied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Code className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

