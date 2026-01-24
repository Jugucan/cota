import { motion } from 'framer-motion';
import { MoreVertical, Trash2, Edit, Camera } from 'lucide-react';
import { Space } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SpaceCardProps {
  space: Space;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SpaceCard({ space, onClick, onEdit, onDelete }: SpaceCardProps) {
  const measurementCount = space.measurements.length;
  const totalBoxes = space.measurements.reduce((sum, m) => sum + m.boxes.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="cursor-pointer overflow-hidden border-0 shadow-soft hover:shadow-elevated transition-all duration-300 group"
        onClick={onClick}
      >
        <CardHeader className="pb-2 flex flex-row items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{space.icon}</span>
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {space.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {measurementCount} foto{measurementCount !== 1 ? 's' : ''}
                {totalBoxes > 0 && ` • ${totalBoxes} mide${totalBoxes !== 1 ? 's' : 'a'}`}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Esborrar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        
        <CardContent className="pt-2">
          {measurementCount > 0 ? (
            <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
              {space.measurements.slice(0, 3).map((m, i) => (
                <div 
                  key={m.id} 
                  className="aspect-square bg-muted flex items-center justify-center"
                >
                  {m.photoBase64 || m.photoUrl ? (
                    <img 
                      src={m.photoBase64 || m.photoUrl} 
                      alt={m.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              ))}
              {measurementCount < 3 && Array.from({ length: 3 - measurementCount }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square bg-muted/50" />
              ))}
            </div>
          ) : (
            <div className="h-20 flex items-center justify-center rounded-lg border-2 border-dashed border-border">
              <p className="text-sm text-muted-foreground">Encara no hi ha fotos</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
