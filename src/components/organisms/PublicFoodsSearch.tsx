import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FoodDto } from "@/types/nutritionService";
import { NutritionService } from "@/services/nutritionService";
import FoodList from "./FoodList";
import PaginationControls from "@/components/molecules/PaginationControls";
import { getUserId } from "@/services/authService";
import { FoodForm } from "@/components/forms/FoodForm";
import { FoodFormData, initialFoodFormState } from "@/lib/nutritionUtils";

export interface PublicFoodsSearchProps {
  pageSize?: number;
  onFoodSelect?: (food: FoodDto) => void;
  onAdded?: () => void;
  userIdOverride?: string; // new: permite listar/criar para outro usuário
  allowCreate?: boolean; // new: controla exibição do botão Adicionar Comida
}

export const PublicFoodsSearch: React.FC<PublicFoodsSearchProps> = ({ pageSize = 30, onFoodSelect, onAdded, userIdOverride, allowCreate = true }) => {
  const [foods, setFoods] = useState<FoodDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFoodId, setExpandedFoodId] = useState<string | null>(null);
  const [detailsCache, setDetailsCache] = useState<Record<string, FoodDto>>({});
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);

  // Create food state
  const [creating, setCreating] = useState(false);
  const formId = "create-user-food-form";

  const resolveUserId = (): string | null => {
    const uid = userIdOverride || getUserId() || sessionStorage.getItem("userId") || localStorage.getItem("userId");
    return uid || null;
  };

  const fetchFoods = async () => {
    setLoading(true);
    setError(null);
    try {
      const uid = resolveUserId();
      if (!uid) { setFoods([]); setTotalPages(1); return; }
      const allFoods = await NutritionService.listUserFoods(uid);
      const filtered = search ? allFoods.filter((f) => (f.name || "").toLowerCase().includes(search.toLowerCase())) : allFoods;
      const startIndex = (page - 1) * pageSize;
      const pageItems = filtered.slice(startIndex, startIndex + pageSize);
      const total = filtered.length;
      const totalPagesCalc = Math.max(1, Math.ceil(total / pageSize));
      setFoods(pageItems);
      setTotalPages(totalPagesCalc);
    } catch (err) {
      console.error("Erro ao buscar comidas do usuário:", err);
      setError("Erro ao carregar suas comidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFoods(); }, [page, search, pageSize, userIdOverride]);

  const handleViewMore = async (foodId?: string) => {
    if (!foodId) return;
    if (expandedFoodId === foodId) { setExpandedFoodId(null); return; }
    if (detailsCache[foodId]) { setExpandedFoodId(foodId); return; }
    try {
      setLoadingDetailsId(foodId);
      const details = await NutritionService.getUserFoodDetails(foodId);
      setDetailsCache((prev) => ({ ...prev, [foodId]: details }));
      setExpandedFoodId(foodId);
    } catch (err) {
      console.error("Erro ao carregar detalhes da comida do usuário:", err);
    } finally {
      setLoadingDetailsId(null);
    }
  };

  const startCreateFood = () => {
    setCreating(true);
  };

  const handleCreateFoodSubmit = async (data: FoodFormData) => {
    try {
      const uid = resolveUserId();
      if (!uid) return;
      await NutritionService.createUserFood(uid, {
        name: data.name || undefined,
        brand: data.brand || undefined,
        barCode: data.barCode || undefined,
        nutritionalInfo: data.nutritionalInfo,
        userId: uid,
      });
      setCreating(false);
      await fetchFoods();
      onAdded?.();
    } catch (err) {
      console.error("Erro ao criar comida do usuário:", err);
    }
  };

  const currentFoods = foods || [];

  return (
    <div className="flex flex-col gap-4 h-full">
      {!creating ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-sm font-medium">Minhas comidas</span>
              <Input placeholder="Digite o nome da comida..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            {allowCreate && (
              <div className="pt-6">
                <Button onClick={startCreateFood} className="btn primary">Adicionar Comida</Button>
              </div>
            )}
          </div>

          {loading && <div className="text-sm text-muted-foreground">Carregando suas comidas...</div>}

          {error && !loading && (
            <div className="text-sm text-red-500 flex items-center justify-between gap-2">
              <span>{error}</span>
              <Button size="sm" variant="outline" onClick={fetchFoods}>Tentar novamente</Button>
            </div>
          )}

          {!loading && !error && currentFoods.length === 0 && (
            <div className="text-sm text-muted-foreground">Nenhuma comida encontrada.</div>
          )}

          {!loading && !error && currentFoods.length > 0 && (
            <ScrollArea className="flex-1 border rounded-md p-2">
              <FoodList
                foods={currentFoods}
                detailsById={detailsCache}
                expandedId={expandedFoodId}
                onToggleDetails={handleViewMore}
                onSelect={onFoodSelect}
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
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <FoodForm initialData={initialFoodFormState} onSubmit={handleCreateFoodSubmit} formId={formId} />
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
            <Button type="submit" form={formId} className="btn primary">
              Adicionar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicFoodsSearch;
