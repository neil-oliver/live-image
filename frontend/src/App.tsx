import { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { EndpointEditor } from '@/components/EndpointEditor';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getEndpoint, endpoints } from '@/config/endpoints';

function App() {
  const { selectedEndpoint, setSelectedEndpoint } = useStore();

  // Select first endpoint by default
  useEffect(() => {
    if (!selectedEndpoint && endpoints.length > 0) {
      setSelectedEndpoint(endpoints[0].id);
    }
  }, [selectedEndpoint, setSelectedEndpoint]);

  const endpoint = selectedEndpoint ? getEndpoint(selectedEndpoint) : null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8">
          {endpoint ? (
            <EndpointEditor endpoint={endpoint} />
          ) : (
            <Card className="mt-12">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Welcome to Live Image</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Select an endpoint from the sidebar to start generating custom images.
                  Customize parameters, preview in real-time, and get the URL or download your
                  creation.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

