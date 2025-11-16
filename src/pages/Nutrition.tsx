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
import MealListSection from "@/components/organisms/MealListSection";
import MealList from "@/components/organisms/MealList";
import DailyMenuListSection from "@/components/organisms/DailyMenuListSection";
import DailyMenuList from "@/components/organisms/DailyMenuList";
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
  const [modalType, setModalType] = useState<"food" | "dishesPicker" | "dishCreate" | "meal" | "mealCreate" | "dailyMenu" | "dailyMenuCreate" | null>(null);
  const [loadingDishesPicker, setLoadingDishesPicker] = useState(false);
  const [loadingMealsPicker, setLoadingMealsPicker] = useState(false);
  const [loadingDailyMenusPicker, setLoadingDailyMenusPicker] = useState(false);
  const [dishName, setDishName] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, number>>({});
  const [mealForm, setMealForm] = useState<{ type: number; name: string; dishIds: string[]; ingredients: Record<string, number>; }>({ type: 0, name: "", dishIds: [], ingredients: {} });
  const [dailyMenuForm, setDailyMenuForm] = useState<{ dayOfWeek: number; mealIds: string[] }>({ dayOfWeek: 0, mealIds: [] });
  const [publicFoods, setPublicFoods] = useState<FoodDto[]>([]);

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
        const userMeals = await NutritionService.listMeals(uid);
        setMeals(userMeals ?? []);
        const userDailyMenus = await NutritionService.listDailyMenus(uid);
        setDailyMenus(userDailyMenus ?? []);
      } else {
        setFoods([]);
        setDishes([]);
        setMeals([]);
        setDailyMenus([]);
      }
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
    if (type === "meal") {
      openMealsPicker();
      return;
    }
    if (type === "dailyMenu") {
      openDailyMenusPicker();
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

  const openMealsPicker = async () => {
    try {
      setShowModal(true);
      setModalType("meal"); // este valor é usado no renderModalContent
      setLoadingMealsPicker(true);
      const uid = getUserId() || sessionStorage.getItem("userId") || localStorage.getItem("userId");
      if (uid) {
        const [userMeals, foodsPub, userDishes] = await Promise.all([
          NutritionService.listMeals(uid),
          NutritionService.listPublicFoods(),
          NutritionService.listDishes(uid),
        ]);
        setMeals(userMeals ?? []);
        setPublicFoods(foodsPub ?? []);
        setDishes(userDishes ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMealsPicker(false);
    }
  };

  const openDailyMenusPicker = async () => {
    try {
      setShowModal(true);
      setModalType("dailyMenu");
      setLoadingDailyMenusPicker(true);
      const uid = getUserId() || sessionStorage.getItem("userId") || localStorage.getItem("userId");
      if (uid) {
        const [dm, ms] = await Promise.all([
          NutritionService.listDailyMenus(uid),
          NutritionService.listMeals(uid),
        ]);
        setDailyMenus(dm ?? []);
        setMeals(ms ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDailyMenusPicker(false);
    }
  };

  const startDishCreation = () => {
    setDishName("");
    setSelectedIngredients({});
    setModalType("dishCreate");
  };

  const startMealCreation = () => {
    setMealForm({ type: 0, name: "", dishIds: [], ingredients: {} });
    setModalType("mealCreate");
  };

  const startDailyMenuCreation = () => {
    setDailyMenuForm({ dayOfWeek: 0, mealIds: [] });
    setModalType("dailyMenuCreate");
  };

  const toggleIngredient = (foodId: string, checked: boolean) => {
    setSelectedIngredients((prev) => {
      const next = { ...prev };
      if (!checked) {
        delete next[foodId];
      } else {
        next[foodId] = next[foodId] ?? 1; // default 1 porção
      }
      return next;
    });
  };

  const updateIngredientQty = (foodId: string, qty: number) => {
    setSelectedIngredients((prev) => ({ ...prev, [foodId]: qty }));
  };

  const toggleMealDish = (dishId: string, checked: boolean) => {
    setMealForm((prev) => ({ ...prev, dishIds: checked ? [...prev.dishIds, dishId] : prev.dishIds.filter(id => id !== dishId) }));
  };

  const toggleMealFood = (foodId: string, checked: boolean) => {
    setMealForm((prev) => {
      const ingredients = { ...prev.ingredients } as Record<string, number>;
      if (!checked) delete ingredients[foodId]; else ingredients[foodId] = ingredients[foodId] ?? 1; // default 1 porção
      return { ...prev, ingredients };
    });
  };

  const setMealFoodQty = (foodId: string, qty: number) => {
    setMealForm((prev) => ({ ...prev, ingredients: { ...prev.ingredients, [foodId]: qty } }));
  };

  const toggleDailyMenuMeal = (mealId: string, checked: boolean) => {
    setDailyMenuForm((prev) => ({ ...prev, mealIds: checked ? [...prev.mealIds, mealId] : prev.mealIds.filter(id => id !== mealId) }));
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

  const handleCreateMeal = async () => {
    try {
      const uid = getUserId() || sessionStorage.getItem("userId") || localStorage.getItem("userId");
      if (!uid) return;
      const ingredientsArr = Object.entries(mealForm.ingredients).map(([foodId, quantity]) => ({ foodId, quantity }));
      await NutritionService.createMealForUser(uid, {
        type: mealForm.type as any,
        name: mealForm.name || undefined,
        dishIds: mealForm.dishIds,
        ingredients: ingredientsArr,
      });
      const userMeals = await NutritionService.listMeals(uid);
      setMeals(userMeals ?? []);
      setShowModal(false);
      setModalType(null);
      setOpenSections((prev) => ({ ...prev, meals: true }));
    } catch (e) {
      console.error("Erro ao criar refeição:", e);
    }
  };

  const handleCreateDailyMenu = async () => {
    try {
      const uid = getUserId() || sessionStorage.getItem("userId") || localStorage.getItem("userId");
      if (!uid) return;
      await NutritionService.createDailyMenu({ dayOfWeek: dailyMenuForm.dayOfWeek, mealIds: dailyMenuForm.mealIds, userId: uid });
      const userDailyMenus = await NutritionService.listDailyMenus(uid);
      setDailyMenus(userDailyMenus ?? []);
      setShowModal(false);
      setModalType(null);
      setOpenSections((prev) => ({ ...prev, dailyMenus: true }));
    } catch (e) {
      console.error("Erro ao criar cardápio diário:", e);
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

  const handleDeleteMeal = async (meal: MealDto) => {
    if (!meal.id) return;
    try {
      await NutritionService.deleteMeal(meal.id);
      const uid = getUserId() || sessionStorage.getItem("userId") || localStorage.getItem("userId");
      if (uid) {
        const userMeals = await NutritionService.listMeals(uid);
        setMeals(userMeals ?? []);
      }
    } catch (e) {
      console.error("Erro ao remover refeição:", e);
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
                  const qty = selectedIngredients[f.id || ""] || 1;
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
                        <span className="text-xs text-muted-foreground">porções</span>
                        <Input type="number" className="w-24" value={qty} min={1} step={1} onChange={(e) => updateIngredientQty(f.id || "", Number(e.target.value))} disabled={!checked} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case "meal":
        if (loadingMealsPicker) return <div>Carregando refeições...</div>;
        if (!meals || meals.length === 0) {
          return (
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">Nenhuma refeição encontrada, adicione uma</p>
              <Button className="btn primary" onClick={startMealCreation}>Adicionar Refeição</Button>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <MealList meals={meals} compact onSelect={() => setShowModal(false)} />
            <div className="pt-2 border-t">
              <Button className="btn" onClick={startMealCreation}>Adicionar Refeição</Button>
            </div>
          </div>
        );
      case "mealCreate":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm">Tipo de refeição</label>
                <select className="input" value={mealForm.type} onChange={(e) => setMealForm((p) => ({ ...p, type: Number(e.target.value) }))}>
                  <option value={0}>Café da manhã</option>
                  <option value={1}>Lanche da manhã</option>
                  <option value={2}>Almoço</option>
                  <option value={3}>Lanche da tarde</option>
                  <option value={4}>Jantar</option>
                  <option value={5}>Ceia</option>
                </select>
                <label className="text-sm">Nome (opcional)</label>
                <Input value={mealForm.name} onChange={(e) => setMealForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: Pós-treino" />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Pratos</label>
                <div className="max-h-[40vh] overflow-y-auto space-y-2">
                  {dishes.map((d) => {
                    const checked = mealForm.dishIds.includes(d.id || "");
                    return (
                      <div key={d.id || d.name} className="flex items-center justify-between gap-2 border rounded-md p-2">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={checked} onCheckedChange={(v) => toggleMealDish(d.id || "", Boolean(v))} />
                          <span className="text-sm">{d.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm">Alimentos</label>
                <div className="max-h-[40vh] overflow-y-auto space-y-2">
                  {publicFoods.map((f) => {
                    const checked = mealForm.ingredients[f.id || ""] !== undefined;
                    const qty = mealForm.ingredients[f.id || ""] || 1;
                    return (
                      <div key={f.id || f.name} className="flex items-center justify-between gap-2 border rounded-md p-2">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={checked} onCheckedChange={(v) => toggleMealFood(f.id || "", Boolean(v))} />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{f.name}</span>
                            {f.brand && <span className="text-xs text-muted-foreground">{f.brand}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">porções</span>
                          <Input type="number" className="w-24" value={qty} min={1} onChange={(e) => setMealFoodQty(f.id || "", Number(e.target.value))} disabled={!checked} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      case "dailyMenu":
        if (loadingDailyMenusPicker) return <div>Carregando cardápios diários...</div>;
        if (!dailyMenus || dailyMenus.length === 0) {
          return (
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">Nenhum cardápio diario encontrada, adicione um</p>
              <Button className="btn primary" onClick={startDailyMenuCreation}>Adicionar Cardápio</Button>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <DailyMenuList dailyMenus={dailyMenus} compact onSelect={() => setShowModal(false)} />
            <div className="pt-2 border-t">
              <Button className="btn" onClick={startDailyMenuCreation}>Adicionar Cardápio</Button>
            </div>
          </div>
        );
      case "dailyMenuCreate":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm">Dia da semana</label>
                <select className="input" value={dailyMenuForm.dayOfWeek} onChange={(e) => setDailyMenuForm((p) => ({ ...p, dayOfWeek: Number(e.target.value) }))}>
                  <option value={0}>Domingo</option>
                  <option value={1}>Segunda</option>
                  <option value={2}>Terça</option>
                  <option value={3}>Quarta</option>
                  <option value={4}>Quinta</option>
                  <option value={5}>Sexta</option>
                  <option value={6}>Sábado</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm">Refeições</label>
                <div className="max-h-[50vh] overflow-y-auto space-y-2">
                  {meals.map((m) => {
                    const checked = dailyMenuForm.mealIds.includes(m.id || "");
                    return (
                      <div key={m.id || m.name} className="flex items-center gap-2 border rounded-md p-2">
                        <Checkbox checked={checked} onCheckedChange={(v) => toggleDailyMenuMeal(m.id || "", Boolean(v))} />
                        <span className="text-sm">{m.name || "Sem nome"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
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
        return "Selecionar Refeição";
      case "mealCreate":
        return "Criar Refeição";
      case "dailyMenu":
        return "Selecionar Cardápio";
      case "dailyMenuCreate":
        return "Criar Cardápio";
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
        <MealListSection
          title="Refeições"
          description="Toque para expandir e ver a lista"
          meals={meals}
          expanded={openSections.meals}
          onToggle={() => toggleSection("meals")}
          onAddClick={() => openCreateModal("meal")}
          onDeleteMeal={handleDeleteMeal}
        />
      </div>

      <div className="card p-4">
        <DailyMenuListSection
          title="Cardápios Diários"
          description="Toque para expandir e ver a lista"
          dailyMenus={dailyMenus}
          expanded={openSections.dailyMenus}
          onToggle={() => toggleSection("dailyMenus")}
          onAddClick={() => openCreateModal("dailyMenu")}
        />
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
            {modalType === "mealCreate" && (
              <Button type="button" className="btn primary" onClick={handleCreateMeal}>
                Criar Refeição
              </Button>
            )}
            {modalType === "dailyMenuCreate" && (
              <Button type="button" className="btn primary" onClick={handleCreateDailyMenu}>
                Adicionar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}