import { Button } from '@/components/ui/button';
import { Download, Trash2, Play, FileJson } from 'lucide-react';
import { toast } from 'sonner';

interface ToolbarProps {
  onExport: () => void;
  onClear: () => void;
  onTraceRays: () => void;
}

export const Toolbar = ({ onExport, onClear, onTraceRays }: ToolbarProps) => {
  const handleExport = () => {
    onExport();
    toast.success('Setup exported successfully!');
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the entire setup?')) {
      onClear();
      toast.info('Setup cleared');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onTraceRays}
        className="gap-2"
      >
        <Play className="w-4 h-4" />
        Trace Rays
      </Button>
      
      <Button
        onClick={handleExport}
        variant="secondary"
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Export JSON
      </Button>

      <Button
        onClick={handleClear}
        variant="outline"
        className="gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Clear All
      </Button>
    </div>
  );
};
