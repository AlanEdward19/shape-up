import React, { useState, useEffect } from "react";
import "../styles/training.css";
import { 
  FoodDto,
  DishDto,
  MealDto,
  DailyMenuDto
} from "@/types/nutritionService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PublicFoodsBrowser } from "@/components/forms/PublicFoodsBrowser";
import { NutritionService } from "@/services/nutritionService";
import { getUserId } from "@/services/authService";
import NutritionTemplate from "@/components/templates/NutritionTemplate";
import FoodListSection from "@/components/organisms/FoodListSection";
import DishListSection from "@/components/organisms/DishListSection";
import DishList from "@/components/organisms/DishList";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function Nutrition() {
  const [foods, setFoods] = useState<FoodDto[]>([]);
  const [dishes, setDishes] = useState<DishDto[]>([]);
  const [meals, setMeals] = useState<MealDto[]>([]);
  const [dailyMenus, setDailyMenus] = useState<DailyMenuDto[]>([]);

  const [activeTab, setActiveTab] = useState("minha-nutricao");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    foods: false,
    dishes: false,
    meals: false,
    dailyMenus: false,
  });

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"food" | "dishesPicker" | "dishCreate" | "meal" | "dailyMenu" | null>(null);
  const [loadingDishesPicker, setLoadingDishesPicker] = useState(false);
  const [dishName, setDishName] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, number>>({});

  useEffect(() => {
    loadNutritionData();
  }, []);

  const loadNutritionData = async () => {
    try {
      const uid = getUserId() || sessionStorage.getItem("userId") || localStorage.getItem("userId");
      if (uid) {
        const userFoods = await NutritionService.listUserFoods(uid);
        setFoods(userFoods ?? []);
        const userDishes = await NutritionService.listDishes(uid);
        setDishes(userDishes ?? []);
      } else {
        setFoods([]);
        setDishes([]);
      }
      setMeals([]);
      setDailyMenus([]);
    } catch (error) {
      console.error("Erro ao carregar dados de nutrição:", error);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const openCreateModal = (type: "food" | "dish" | "meal" | "dailyMenu") => {
    if (type === "dish") {
      openDishesPicker();
      return;
    }
    setModalType(type);
    setShowModal(true);
  };

  const openDishesPicker = async () => {
    try {
      setShowModal(true);
      setModalType("dishesPicker");
      setLoadingDishesPicker(true);
      const uid = getUserId() || sessionStorage.getItem("userId") || localStorage.getItem("userId");
      if (uid) {
        const userDishes = await NutritionService.listDishes(uid);
        setDishes(userDishes ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDishesPicker(false);
    }
  };

  const startDishCreation = () => {
    setDishName("");
    setSelectedIngredients({});
    setModalType("dishCreate");
  };

  const toggleIngredient = (foodId: string, checked: boolean) => {
    setSelectedIngredients((prev) => {
      const next = { ...prev };
      if (!checked) {
        delete next[foodId];
      } else {
        next[foodId] = next[foodId] ?? 100; // default 100g
      }
      return next;
    });
  };

  const updateIngredientQty = (foodId: string, qty: number) => {
    setSelectedIngredients((prev) => ({ ...prev, [foodId]: qty }));
  };

  const handleCreateDish = async () => {
    try {
      const uid = getUserId() || sessionStorage.getItem("userId") || localStorage.getItem("userId");
      if (!uid) return;
      const ingredients = Object.entries(selectedIngredients).map(([foodId, quantity]) => ({ foodId, quantity }));
      if (ingredients.length === 0) return;
      await NutritionService.createDish({ name: dishName || undefined, ingredients, userId: uid });
      // reload dishes
      const userDishes = await NutritionService.listDishes(uid);
      setDishes(userDishes ?? []);
      setShowModal(false);
      setModalType(null);
      // expand dishes section to show
      setOpenSections((prev) => ({ ...prev, dishes: true }));
    } catch (e) {
      console.error("Erro ao criar prato:", e);
    }
  };

  const handleDeleteFood = async (food: FoodDto) => {
    if (!food.id) return;
    try {
      await NutritionService.deleteUserFood(food.id);
      const uid = getUserId() || sessionStorage.getItem("userId") || localStorage.getItem("userId");
      if (uid) {
        const userFoods = await NutritionService.listUserFoods(uid);
        setFoods(userFoods ?? []);
      }
    } catch (e) {
      console.error("Erro ao remover comida:", e);
    }
  };

  const handleDeleteDish = async (dish: DishDto) => {
    if (!dish.id) return;
    try {
      await NutritionService.deleteDish(dish.id);
      const uid = getUserId() || sessionStorage.getItem("userId") || localStorage.getItem("userId");
      if (uid) {
        const userDishes = await NutritionService.listDishes(uid);
        setDishes(userDishes ?? []);
      }
    } catch (e) {
      console.error("Erro ao remover prato:", e);
    }
  };

  const consolidateNutritionPlan = () => {
    console.log("Consolidando plano nutricional...");
  };

  const renderModalContent = () => {
    switch (modalType) {
      case "food":
        return (
          <PublicFoodsBrowser
            pageSize={30}
            onAdded={async () => {
              await loadNutritionData();
              setOpenSections((prev) => ({ ...prev, foods: true }));
            }}
          />
        );
      case "dishesPicker":
        if (loadingDishesPicker) return <div>Carregando pratos...</div>;
        if (!dishes || dishes.length === 0) {
          return (
            <div className="p-4">
              <p className="text-sm text-muted-foreground">Nenhum prato encontrado, adicione um para selecionar</p>
              <div className="mt-4">
                <Button className="btn primary" onClick={startDishCreation}>Adicionar um prato</Button>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <DishList dishes={dishes} compact onSelect={() => setShowModal(false)} />
            <div className="pt-2 border-t">
              <Button className="btn" onClick={startDishCreation}>Adicionar um prato</Button>
            </div>
          </div>
        );
      case "dishCreate":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm">Nome do prato (opcional)</label>
              <Input value={dishName} onChange={(e) => setDishName(e.target.value)} placeholder="Ex: Frango com salada" />
            </div>
            {foods.length === 0 ? (
              <p className="text-sm text-muted-foreground">Você ainda não possui comidas. Adicione comidas para criar um prato.</p>
            ) : (
              <div className="max-h-[50vh] overflow-y-auto space-y-2">
                {foods.map((f) => {
                  const checked = selectedIngredients[f.id || ""] !== undefined;
                  const qty = selectedIngredients[f.id || ""] || 100;
                  return (
                    <div key={f.id || f.name} className="flex items-center justify-between gap-3 border rounded-md p-2">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={checked} onCheckedChange={(v) => toggleIngredient(f.id || "", Boolean(v))} />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{f.name}</span>
                          {f.brand && <span className="text-xs text-muted-foreground">{f.brand}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">g</span>
                        <Input type="number" className="w-24" value={qty} min={1} onChange={(e) => updateIngredientQty(f.id || "", Number(e.target.value))} disabled={!checked} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case "meal":
        return <div>Formulário de Refeição (WIP)</div>;
      case "dailyMenu":
        return <div>Formulário de Cardápio Diário (WIP)</div>;
      default:
        return null;
    }
  };

  const getActiveFormId = () => "";

  const getModalTitle = () => {
    switch (modalType) {
      case "food":
        return "Buscar Comidas Públicas";
      case "dishesPicker":
        return "Selecionar Prato";
      case "dishCreate":
        return "Criar Prato";
      case "meal":
        return "Criar Refeição";
      case "dailyMenu":
        return "Criar Cardápio Diário";
      default:
        return "";
    }
  };

  const leftColumn = (
    <>
      <div className="card p-4">
        <FoodListSection
          title="Comidas"
          description="Toque para expandir e ver a lista"
          foods={foods}
          expanded={openSections.foods}
          onToggle={() => toggleSection("foods")}
          onAddClick={() => openCreateModal("food")}
          onDeleteFood={handleDeleteFood}
        />
      </div>

      <div className="card p-4">
        <DishListSection
          title="Pratos"
          description="Toque para expandir e ver a lista"
          dishes={dishes}
          expanded={openSections.dishes}
          onToggle={() => toggleSection("dishes")}
          onAddClick={() => openCreateModal("dish")}
          onDeleteDish={handleDeleteDish}
        />
      </div>

      <div className="card p-4">
        {/* Placeholder for Refeições */}
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="m-0 font-semibold text-base">Refeições</h3>
            <p className="m-0 mt-1 text-sm text-muted-foreground">Toque para expandir e ver a lista</p>
          </div>
          <Button size="sm" onClick={() => openCreateModal("meal")} className="btn px-2 py-1">+ </Button>
        </div>
      </div>

      <div className="card p-4">
        {/* Placeholder for Cardápios Diários */}
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="m-0 font-semibold text-base">Cardápios Diários</h3>
            <p className="m-0 mt-1 text-sm text-muted-foreground">Toque para expandir e ver a lista</p>
          </div>
          <Button size="sm" onClick={() => openCreateModal("dailyMenu")} className="btn px-2 py-1">+ </Button>
        </div>
      </div>

      <div className="p-4 mt-auto">
        <Button className="btn primary w-full py-3 text-base font-semibold" onClick={consolidateNutritionPlan}>
          ✓ Consolidar Plano Nutricional
        </Button>
      </div>
    </>
  );

  const rightColumn = (
    <div className="detail flex flex-col h-full" style={{ overflowY: "auto" }}>
      <div className="head">
        <h2 className="p-0 border-0 m-0">Nutrição</h2>
      </div>
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="text-center max-w-[520px]">
          <h3 className="text-muted-foreground">Gerencie sua alimentação de forma inteligente</h3>
          <p className="text-muted-foreground mx-auto mt-4">
            Cadastre alimentos, crie pratos personalizados, organize refeições e monte cardápios completos para atingir seus objetivos nutricionais.
          </p>
          <div className="mt-10 flex w-full justify-center gap-3 flex-wrap">
            <Button onClick={() => openCreateModal("food")} className="btn">+ Adicionar Comida</Button>
            <Button onClick={() => openCreateModal("dish")} className="btn">+ Criar Prato</Button>
            <Button onClick={() => openCreateModal("meal")} className="btn">+ Nova Refeição</Button>
            <Button onClick={() => openCreateModal("dailyMenu")} className="btn">+ Cardápio Diário</Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <NutritionTemplate activeTab={activeTab} onTabChange={setActiveTab} left={leftColumn} right={rightColumn} />

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="min-w-[500px] max-w-screen-xl flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{getModalTitle()}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-6">{renderModalContent()}</div>
          <DialogFooter className="pt-4 border-t mt-4">
            <Button type="button" onClick={() => setShowModal(false)} className="btn">
              Fechar
            </Button>
            {modalType === "dishCreate" && (
              <Button type="button" className="btn primary" onClick={handleCreateDish}>
                Criar Prato
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}