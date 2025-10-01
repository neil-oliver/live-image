import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

interface URLDisplayProps {
  url: string;
  endpointId: string;
}

export function URLDisplay({ url, endpointId }: URLDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        </div>
      </CardContent>
    </Card>
  );
}

