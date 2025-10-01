import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Menu, X, Palette, Layout, Users, BarChart } from 'lucide-react';
import { endpoints } from '@/config/endpoints';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { EndpointConfig } from '@/types';

export function Sidebar() {
  const { selectedEndpoint, setSelectedEndpoint } = useStore();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredEndpoints = endpoints.filter(
    (endpoint) =>
      endpoint.name.toLowerCase().includes(search.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(search.toLowerCase()) ||
      endpoint.category.toLowerCase().includes(search.toLowerCase())
  );

  const categoryIcons = {
    graphics: Palette,
    ui: Layout,
    social: Users,
    data: BarChart,
  };

  const groupedEndpoints = filteredEndpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = [];
    }
    acc[endpoint.category].push(endpoint);
    return acc;
  }, {} as Record<string, EndpointConfig[]>);

  const handleSelect = (id: string) => {
    setSelectedEndpoint(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Live Image</h2>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search endpoints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Endpoints List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {Object.entries(groupedEndpoints).map(([category, items]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2 px-2">
                  {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {category}
                  </h3>
                  <Badge variant="secondary" className="ml-auto">
                    {items.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {items.map((endpoint) => (
                    <button
                      key={endpoint.id}
                      onClick={() => handleSelect(endpoint.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        selectedEndpoint === endpoint.id
                          ? 'bg-primary text-primary-foreground'
                          : ''
                      )}
                    >
                      <div className="font-medium">{endpoint.name}</div>
                      <div className="text-xs opacity-80 line-clamp-1">
                        {endpoint.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t text-center text-sm text-muted-foreground">
        <p>{endpoints.length} endpoints available</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-80 bg-background border-r z-40 transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

