import React from "react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({ page, totalPages, onPrev, onNext, disabled }) => {
  return (
    <div className="flex items-center justify-between mt-2">
      <div className="text-xs text-muted-foreground">
        Página {page} de {Math.max(1, totalPages)}
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" variant="outline" disabled={page <= 1 || disabled} onClick={onPrev}>
          Anterior
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={page >= totalPages || disabled} onClick={onNext}>
          Próxima
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;

