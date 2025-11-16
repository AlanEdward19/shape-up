import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FoodDto } from "@/types/nutritionService";
import { NutritionService } from "@/services/nutritionService";
import FoodList from "./FoodList";
import PaginationControls from "@/components/molecules/PaginationControls";
import { getUserId } from "@/services/authService";

export interface PublicFoodsSearchProps {
  pageSize?: number;
  onFoodSelect?: (food: FoodDto) => void;
  onAdded?: (food: FoodDto) => void;
}

export const PublicFoodsSearch: React.FC<PublicFoodsSearchProps> = ({ pageSize = 30, onFoodSelect, onAdded }) => {
  const [foods, setFoods] = useState<FoodDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFoodId, setExpandedFoodId] = useState<string | null>(null);
  const [detailsCache, setDetailsCache] = useState<Record<string, FoodDto>>({});
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);
  const [addingIds, setAddingIds] = useState<Record<string, 'idle' | 'loading' | 'done'>>({});

  const fetchFoods = async () => {
    setLoading(true);
    setError(null);
    try {
      const allFoods = await NutritionService.listPublicFoods();
      const filtered = search ? allFoods.filter((f) => (f.name || "").toLowerCase().includes(search.toLowerCase())) : allFoods;
      const startIndex = (page - 1) * pageSize;
      const pageItems = filtered.slice(startIndex, startIndex + pageSize);
      const total = filtered.length;
      const totalPagesCalc = Math.max(1, Math.ceil(total / pageSize));
      setFoods(pageItems);
      setTotalPages(totalPagesCalc);
    } catch (err) {
      console.error("Erro ao buscar comidas públicas:", err);
      setError("Erro ao carregar comidas públicas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFoods(); }, [page, search, pageSize]);

  const handleViewMore = async (foodId?: string) => {
    if (!foodId) return;
    if (expandedFoodId === foodId) { setExpandedFoodId(null); return; }
    if (detailsCache[foodId]) { setExpandedFoodId(foodId); return; }
    try {
      setLoadingDetailsId(foodId);
      const details = await NutritionService.getPublicFoodDetails(foodId);
      setDetailsCache((prev) => ({ ...prev, [foodId]: details }));
      setExpandedFoodId(foodId);
    } catch (err) {
      console.error("Erro ao carregar detalhes da comida pública:", err);
    } finally {
      setLoadingDetailsId(null);
    }
  };

  const handleAdd = async (food: FoodDto) => {
    const foodId = food.id; if (!foodId) return;
    try {
      setAddingIds((prev) => ({ ...prev, [foodId]: 'loading' }));
      const uid = getUserId() || sessionStorage.getItem('userId') || localStorage.getItem('userId');
      if (!uid) { console.error('Usuário não autenticado'); setAddingIds((prev) => ({ ...prev, [String(foodId)]: 'idle' })); return; }
      await NutritionService.insertPublicFoodsInUserFood(uid, { publicFoodIds: [foodId] });
      setAddingIds((prev) => ({ ...prev, [foodId]: 'done' }));
      onAdded?.(food);
    } catch (err) {
      console.error("Erro ao adicionar comida pública ao usuário:", err);
      setAddingIds((prev) => ({ ...prev, [String(foodId)]: 'idle' }));
    }
  };

  const currentFoods = foods || [];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-medium">Buscar comidas públicas</span>
          <Input placeholder="Digite o nome da comida..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Carregando comidas públicas...</div>}

      {error && !loading && (
        <div className="text-sm text-red-500 flex items-center justify-between gap-2">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={fetchFoods}>Tentar novamente</Button>
        </div>
      )}

      {!loading && !error && currentFoods.length === 0 && (
        <div className="text-sm text-muted-foreground">Nenhuma comida encontrada para os filtros atuais.</div>
      )}

      {!loading && !error && currentFoods.length > 0 && (
        <ScrollArea className="flex-1 border rounded-md p-2">
          <FoodList
            foods={currentFoods}
            detailsById={detailsCache}
            expandedId={expandedFoodId}
            onToggleDetails={handleViewMore}
            onAdd={handleAdd}
            onSelect={onFoodSelect}
            addStateById={addingIds}
          />
        </ScrollArea>
      )}

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setPage((prev) => prev + 1)}
        disabled={loading}
      />
    </div>
  );
};

export default PublicFoodsSearch;

