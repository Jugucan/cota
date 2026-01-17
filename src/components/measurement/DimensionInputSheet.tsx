import { useState, useEffect } from 'react';
import { Box3D, BOX_COLORS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface DimensionInputSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  box: Box3D | null;
  onSave: (dimensions: { width: number; height: number; depth: number }, label: string, color: string) => void;
}

export function DimensionInputSheet({
  open,
  onOpenChange,
  box,
  onSave,
}: DimensionInputSheetProps) {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [depth, setDepth] = useState('');
  const [label, setLabel] = useState('');
  const [color, setColor] = useState(BOX_COLORS[0].name);

  useEffect(() => {
    if (box) {
      setWidth(box.dimensions.width > 0 ? String(box.dimensions.width) : '');
      setHeight(box.dimensions.height > 0 ? String(box.dimensions.height) : '');
      setDepth(box.dimensions.depth > 0 ? String(box.dimensions.depth) : '');
      setLabel(box.label);
      setColor(box.color);
    }
  }, [box]);

  const handleSave = () => {
    onSave(
      {
        width: parseFloat(width) || 0,
        height: parseFloat(height) || 0,
        depth: parseFloat(depth) || 0,
      },
      label,
      color
    );
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="font-display">Edit Measurement</SheetTitle>
          <SheetDescription>
            Enter the real-world dimensions for this box
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="label">Label (optional)</Label>
            <Input
              id="label"
              placeholder="e.g., Wardrobe, TV Stand"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="width">Width (cm)</Label>
              <Input
                id="width"
                type="number"
                placeholder="0"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="text-center text-lg font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="text-center text-lg font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depth">Depth (cm)</Label>
              <Input
                id="depth"
                type="number"
                placeholder="0"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className="text-center text-lg font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Box Color</Label>
            <div className="flex gap-2 flex-wrap">
              {BOX_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  className={cn(
                    'w-10 h-10 rounded-full transition-all',
                    color === c.name ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button variant="hero" className="flex-1" onClick={handleSave}>
              Save Dimensions
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
