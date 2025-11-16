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
import { ProfessionalManagementService } from "@/services/professionalManagementService";
import { clientResponse } from "@/types/professionalManagementService";
import { useToast } from "@/hooks/use-toast";

export default function Nutrition() {
  const { toast } = useToast();
  // --- Minha Nutrição ---
  const [foods, setFoods] = useState<FoodDto[]>([]);
  const [dishes, setDishes] = useState<DishDto[]>([]);
  const [meals, setMeals] = useState<MealDto[]>([]);
  const [dailyMenus, setDailyMenus] = useState<DailyMenuDto[]>([]);

  // --- Tabs ---
  const [activeTab, setActiveTab] = useState("minha-nutricao");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    foods: false,
    dishes: false,
    meals: false,
    dailyMenus: false,
  });

  // --- Modal ---
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"food" | "dishesPicker" | "dishCreate" | "meal" | "mealCreate" | "dailyMenu" | "dailyMenuCreate" | "clientDailyMenuCreate" | null>(null);
  const [loadingDishesPicker, setLoadingDishesPicker] = useState(false);
  const [loadingMealsPicker, setLoadingMealsPicker] = useState(false);
  const [loadingDailyMenusPicker, setLoadingDailyMenusPicker] = useState(false);
  const [dishName, setDishName] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<Record<string, number>>({});
  const [mealForm, setMealForm] = useState<{ type: number; name: string; dishIds: string[]; ingredients: Record<string, number>; }>({ type: 0, name: "", dishIds: [], ingredients: {} });
  const [dailyMenuForm, setDailyMenuForm] = useState<{ dayOfWeek: number; mealIds: string[] }>({ dayOfWeek: 0, mealIds: [] });

  // --- Meus clientes ---
  const [clients, setClients] = useState<clientResponse[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | "">("");
  const [clientDailyMenus, setClientDailyMenus] = useState<DailyMenuDto[]>([]);
  const [clientMeals, setClientMeals] = useState<MealDto[]>([]);
  // Loading states for clients tab
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingClientData, setLoadingClientData] = useState(false);
  // New states for client management
  const [clientFoods, setClientFoods] = useState<FoodDto[]>([]);
  const [clientDishes, setClientDishes] = useState<DishDto[]>([]);
  const [clientManagementMode, setClientManagementMode] = useState(false);
  const [editingClientDailyMenu, setEditingClientDailyMenu] = useState<DailyMenuDto | null>(null);
  // helper to load client foods/dishes/meals
  const loadClientLists = async (clientId: string) => {
    try {
      const [ms, foodsResp, dishesResp] = await Promise.all([
        NutritionService.listMeals(clientId),
        NutritionService.listUserFoods(clientId),
        NutritionService.listDishes(clientId),
      ]);
      setClientMeals(ms ?? []);
      setClientFoods(foodsResp ?? []);
      setClientDishes(dishesResp ?? []);
    } catch (e) {
      console.error("Erro ao carregar listas do cliente:", e);
    }
  };
  // open existing daily menu for editing
  const startClientDailyMenuEdit = async (dm: DailyMenuDto) => {
    if (!selectedClientId || !dm.id) return;
    try {
      setClientManagementMode(true);
      await loadClientLists(selectedClientId);
      const details = await NutritionService.getDailyMenuDetails(dm.id);
      setEditingClientDailyMenu(details);
      setDailyMenuForm({ dayOfWeek: Number(details.dayOfWeek) as any, mealIds: (details.meals || []).map(m => m.id || "") });
      // mark selected meals in the checkbox list
      const map: Record<string, boolean> = {};
      (details.meals || []).forEach(m => { if (m.id) map[m.id] = true; });
      setSelectedClientMealIds(map);
      toast({ title: "Editando cardápio de " + dm.dayOfWeek });
    } catch (e: any) {
      console.error("Erro ao carregar detalhes do cardápio:", e);
      toast({ title: "Erro ao abrir cardápio", description: e?.message || "" });
    }
  };
  const handleUpdateClientDailyMenu = async () => {
    if (!editingClientDailyMenu?.id) return;
    try {
      const mealIds = Object.entries(selectedClientMealIds).filter(([, v]) => v).map(([id]) => id);
      await NutritionService.updateDailyMenu(editingClientDailyMenu.id, { id: editingClientDailyMenu.id, dayOfWeek: dailyMenuForm.dayOfWeek as any, mealIds });
      const dms = selectedClientId ? await NutritionService.listDailyMenus(selectedClientId) : [];
      setClientDailyMenus(dms ?? []);
      toast({ title: "Cardápio atualizado" });
    } catch (e: any) {
      console.error("Erro ao atualizar cardápio:", e);
      toast({ title: "Erro ao atualizar cardápio", description: e?.message || "" });
    }
  };

  // Food create/edit/import states (client)
  const [publicFoodsForImport, setPublicFoodsForImport] = useState<FoodDto[]>([]);
  const [selectedPublicFoodIds, setSelectedPublicFoodIds] = useState<Record<string, boolean>>({});
  const [clientFoodsModalOpen, setClientFoodsModalOpen] = useState(false);
  const [clientFoodsModalMode, setClientFoodsModalMode] = useState<"manage" | "import">("manage");
  const [publicSearch, setPublicSearch] = useState("");
  const [loadingPublicFoods, setLoadingPublicFoods] = useState(false);

  // Dish creation (client)
  const [showClientDishCreate, setShowClientDishCreate] = useState(false);
  const [clientDishName, setClientDishName] = useState("");
  const [clientDishIngredients, setClientDishIngredients] = useState<Record<string, number>>({});

  // Meal creation / edit (client)
  const [showClientMealCreate, setShowClientMealCreate] = useState(false);
  const [editingClientMeal, setEditingClientMeal] = useState<MealDto | null>(null);
  const [clientMealForm, setClientMealForm] = useState<{ type: number; name: string; dishIds: string[]; ingredients: Record<string, number>; }>({ type: 0, name: "", dishIds: [], ingredients: {} });

  // Track meals selected to compose the client's Daily Menu
  const [selectedClientMealIds, setSelectedClientMealIds] = useState<Record<string, boolean>>({});

  // Save Daily Menu directly from right column (clients tab)
  const handleSaveClientDailyMenu = async () => {
    if (!selectedClientId) return;
    const mealIds = Object.entries(selectedClientMealIds).filter(([, v]) => v).map(([id]) => id);
    if (mealIds.length === 0) {
      toast({ title: "Selecione ao menos uma refeição", description: "Marque as refeições na seção Refeições" });
      return;
    }
    try {
      await NutritionService.createDailyMenuForUser(selectedClientId, { dayOfWeek: dailyMenuForm.dayOfWeek, mealIds });
      toast({ title: "Cardápio salvo", description: "O cardápio diário foi criado com sucesso." });
      const dms = await NutritionService.listDailyMenus(selectedClientId);
      setClientDailyMenus(dms ?? []);
      setSelectedClientMealIds({});
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erro ao salvar cardápio", description: e?.message || "Tente novamente." });
    }
  };

  // --- Effects ---
  useEffect(() => {
    loadNutritionData();
  }, []);

  useEffect(() => {
    // Load professional clients when switching to clients tab
    if (activeTab === "clientes") {
      (async () => {
        try {
          setLoadingClients(true);
          const profId = getUserId() || sessionStorage.getItem("userId") || localStorage.getItem("userId");
          if (!profId) { setClients([]); return; }
          const data = await ProfessionalManagementService.getProfessionalClients(profId);
          setClients(data || []);
          // If no client selected, preselect first if exists
          if (!selectedClientId && data && data.length > 0) {
            const firstId = data[0].id;
            setSelectedClientId(firstId);
          }
        } catch (e) {
          console.error("Erro ao buscar clientes do profissional:", e);
        } finally {
          setLoadingClients(false);
        }
      })();
    }
  }, [activeTab]);

  useEffect(() => {
    // Load selected client's daily menus and items when in clients tab
    if (activeTab === "clientes" && selectedClientId) {
      (async () => {
        try {
          setLoadingClientData(true);
          const dms = await NutritionService.listDailyMenus(selectedClientId);
          setClientDailyMenus(dms ?? []);
          await loadClientLists(selectedClientId);
        } catch (e) {
          console.error("Erro ao carregar dados do cliente:", e);
        } finally {
          setLoadingClientData(false);
        }
      })();
    } else if (activeTab === "clientes") {
      setClientDailyMenus([]);
      setClientMeals([]);
      setClientFoods([]);
      setClientDishes([]);
      setEditingClientDailyMenu(null);
      setSelectedClientMealIds({});
    }
  }, [activeTab, selectedClientId]);

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
        const [userMeals, userFoods, userDishes] = await Promise.all([
          NutritionService.listMeals(uid),
          NutritionService.listUserFoods(uid),
          NutritionService.listDishes(uid),
        ]);
        setMeals(userMeals ?? []);
        setFoods(userFoods ?? []);
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
      await NutritionService.createDish({ name: dishName || undefined, ingredients});
      const userDishes = await NutritionService.listDishes(uid);
      setDishes(userDishes ?? []);
      setShowModal(false);
      setModalType(null);
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

  const handleCreateClientDailyMenu = async () => {
    try {
      if (!selectedClientId) return;
      await NutritionService.createDailyMenuForUser(selectedClientId, { dayOfWeek: dailyMenuForm.dayOfWeek, mealIds: dailyMenuForm.mealIds });
      const dms = await NutritionService.listDailyMenus(selectedClientId);
      setClientDailyMenus(dms ?? []);
      setShowModal(false);
      setModalType(null);
    } catch (e) {
      console.error("Erro ao criar cardápio diário do cliente:", e);
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

  const handleDeleteDailyMenu = async (dm: DailyMenuDto) => {
    if (!dm.id) return;
    try {
      await NutritionService.deleteDailyMenu(dm.id);
      const uid = getUserId() || sessionStorage.getItem("userId") || localStorage.getItem("userId");
      if (activeTab === "clientes" && selectedClientId) {
        const dms = await NutritionService.listDailyMenus(selectedClientId);
        setClientDailyMenus(dms ?? []);
      } else if (uid) {
        const userDailyMenus = await NutritionService.listDailyMenus(uid);
        setDailyMenus(userDailyMenus ?? []);
      }
    } catch (e) {
      console.error("Erro ao remover cardápio diário:", e);
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "food":
        return "Minhas Comidas";
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
      case "clientDailyMenuCreate":
        return "Criar Cardápio (Cliente)";
      default:
        return "";
    }
  };

  // ===== Client management handlers =====
  // Foods (only delete remains inline; add/edit handled by modal browser)
  const handleClientDeleteFood = async (food: FoodDto) => {
    if (!food.id || !selectedClientId) return;
    try {
      await NutritionService.deleteUserFood(food.id);
      const foodsResp = await NutritionService.listUserFoods(selectedClientId);
      setClientFoods(foodsResp ?? []);
      toast({ title: "Comida removida" });
    } catch (e: any) { console.error("Erro ao deletar comida do cliente:", e); toast({ title: "Erro ao remover comida", description: e?.message || "" }); }
  };
  // Import public foods
  const togglePublicFoodSelection = (id: string) => {
    setSelectedPublicFoodIds(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const loadPublicFoodsForImport = async () => {
    try {
      setLoadingPublicFoods(true);
      const pub = await NutritionService.listPublicFoods();
      setPublicFoodsForImport(pub ?? []);
    } catch (e) { console.error(e); }
    finally { setLoadingPublicFoods(false); }
  };
  const handleInsertPublicFoods = async () => {
    if (!selectedClientId) return;
    try {
      const ids = Object.entries(selectedPublicFoodIds).filter(([, v]) => v).map(([id]) => id);
      if (ids.length === 0) { toast({ title: "Selecione ao menos uma comida pública" }); return; }
      await NutritionService.insertPublicFoodsInUserFood(selectedClientId, { publicFoodIds: ids, userId: selectedClientId });
      const foodsResp = await NutritionService.listUserFoods(selectedClientId);
      setClientFoods(foodsResp ?? []);
      setSelectedPublicFoodIds({});
      setClientFoodsModalOpen(false);
      toast({ title: "Comidas importadas" });
    } catch (e: any) { console.error("Erro ao inserir comidas públicas:", e); toast({ title: "Erro ao importar comidas", description: e?.message || "" }); }
  };

  // Dishes
  const toggleClientDishIngredient = (foodId: string, checked: boolean) => {
    setClientDishIngredients(prev => {
      const next = { ...prev };
      if (!checked) delete next[foodId]; else next[foodId] = next[foodId] || 1;
      return next;
    });
  };
  const setClientDishIngredientQty = (foodId: string, qty: number) => {
    setClientDishIngredients(prev => ({ ...prev, [foodId]: qty }));
  };
  const handleClientCreateDish = async () => {
    if (!selectedClientId) return;
    try {
      const ingredients = Object.entries(clientDishIngredients).map(([foodId, quantity]) => ({ foodId, quantity }));
      if (ingredients.length === 0) { toast({ title: "Selecione ingredientes", description: "Marque comidas para o prato" }); return; }
      await NutritionService.createDishForUser(selectedClientId, { name: clientDishName || undefined, ingredients });
      const dishesResp = await NutritionService.listDishes(selectedClientId);
      setClientDishes(dishesResp ?? []);
      setShowClientDishCreate(false);
      setClientDishIngredients({});
      setClientDishName("");
      toast({ title: "Prato criado" });
    } catch (e: any) { console.error("Erro ao criar prato do cliente:", e); toast({ title: "Erro ao criar prato", description: e?.message || "" }); }
  };
  const handleClientDeleteDish = async (dish: DishDto) => {
    if (!dish.id || !selectedClientId) return;
    try {
      await NutritionService.deleteDish(dish.id);
      const dishesResp = await NutritionService.listDishes(selectedClientId);
      setClientDishes(dishesResp ?? []);
      toast({ title: "Prato removido" });
    } catch (e: any) { console.error("Erro ao deletar prato:", e); toast({ title: "Erro ao remover prato", description: e?.message || "" }); }
  };

  // Meals
  const toggleClientMealDish = (dishId: string, checked: boolean) => {
    setClientMealForm(prev => ({ ...prev, dishIds: checked ? [...prev.dishIds, dishId] : prev.dishIds.filter(id => id !== dishId) }));
  };
  const toggleClientMealFood = (foodId: string, checked: boolean) => {
    setClientMealForm(prev => {
      const ing = { ...prev.ingredients };
      if (!checked) delete ing[foodId]; else ing[foodId] = ing[foodId] || 1;
      return { ...prev, ingredients: ing };
    });
  };
  const setClientMealFoodQty = (foodId: string, qty: number) => {
    setClientMealForm(prev => ({ ...prev, ingredients: { ...prev.ingredients, [foodId]: qty } }));
  };
  const handleClientCreateMeal = async () => {
    if (!selectedClientId) return;
    try {
      const ingredients = Object.entries(clientMealForm.ingredients).map(([foodId, quantity]) => ({ foodId, quantity }));
      await NutritionService.createMealForUser(selectedClientId, {
        type: clientMealForm.type as any,
        name: clientMealForm.name || undefined,
        dishIds: clientMealForm.dishIds,
        ingredients,
      });
      const mealsResp = await NutritionService.listMeals(selectedClientId);
      setClientMeals(mealsResp ?? []);
      setShowClientMealCreate(false);
      setClientMealForm({ type: 0, name: "", dishIds: [], ingredients: {} });
      toast({ title: "Refeição criada" });
    } catch (e: any) { console.error("Erro ao criar refeição do cliente:", e); toast({ title: "Erro ao criar refeição", description: e?.message || "" }); }
  };
  const handleClientDeleteMeal = async (meal: MealDto) => {
    if (!meal.id || !selectedClientId) return;
    try {
      await NutritionService.deleteMeal(meal.id);
      const mealsResp = await NutritionService.listMeals(selectedClientId);
      setClientMeals(mealsResp ?? []);
      // se estava selecionado, remove
      setSelectedClientMealIds(prev => { const n = { ...prev }; delete n[meal.id!]; return n; });
      toast({ title: "Refeição removida" });
    } catch (e: any) { console.error("Erro ao remover refeição:", e); toast({ title: "Erro ao remover refeição", description: e?.message || "" }); }
  };
  const startClientMealEdit = (meal: MealDto) => {
    setEditingClientMeal(meal);
    setClientMealForm({
      type: meal.type as any,
      name: meal.name || "",
      dishIds: (meal.dishes || []).map(d => d.id || ""),
      ingredients: Object.fromEntries((meal.ingredients || []).map(i => [i.food.id || "", i.quantity]))
    });
    setShowClientMealCreate(true);
  };
  const handleClientUpdateMeal = async () => {
    if (!editingClientMeal?.id || !selectedClientId) return;
    try {
      const ingredients = Object.entries(clientMealForm.ingredients).map(([foodId, quantity]) => ({ foodId, quantity }));
      await NutritionService.updateMeal(editingClientMeal.id, {
        id: editingClientMeal.id,
        name: clientMealForm.name || undefined,
        type: clientMealForm.type as any,
        dishIds: clientMealForm.dishIds,
        ingredients,
      });
      const mealsResp = await NutritionService.listMeals(selectedClientId);
      setClientMeals(mealsResp ?? []);
      setEditingClientMeal(null);
      setShowClientMealCreate(false);
      setClientMealForm({ type: 0, name: "", dishIds: [], ingredients: {} });
      toast({ title: "Refeição atualizada" });
    } catch (e: any) { console.error("Erro ao atualizar refeição do cliente:", e); toast({ title: "Erro ao atualizar refeição", description: e?.message || "" }); }
  };

  // --- Minha Nutrição columns ---
  const leftColumnMy = (
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
          onDeleteDailyMenu={handleDeleteDailyMenu}
        />
      </div>
    </>
  );

  const rightColumnMy = (
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

  // --- Meus Clientes columns ---
  const leftColumnClients = (
    <>
      <div className="card p-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm">Selecionar cliente</label>
            {loadingClients && <div className="text-xs text-muted-foreground">Carregando clientes...</div>}
            <select
              className="input mt-1"
              value={selectedClientId}
              onChange={(e) => { setSelectedClientId(e.target.value); setClientManagementMode(false); }}
            >
              <option value="">-- Selecione --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2" style={{ maxHeight: "55vh", overflowY: "auto" }}>
            <h3 className="text-sm">Cardápios do cliente</h3>
            {loadingClientData ? (
              <div className="text-sm text-muted-foreground">Carregando...</div>
            ) : clientDailyMenus.length === 0 ? (
              <div className="empty">Nenhum cardápio diário encontrado.</div>
            ) : (
              <DailyMenuList dailyMenus={clientDailyMenus} compact onSelect={startClientDailyMenuEdit} onDelete={handleDeleteDailyMenu} />
            )}
          </div>
          <div className="pt-2 border-t flex flex-col gap-2">
            <Button className="btn primary" onClick={async () => { if (!selectedClientId) return; setEditingClientDailyMenu(null); setSelectedClientMealIds({}); setDailyMenuForm({ dayOfWeek: 0, mealIds: [] }); setClientManagementMode(true); await loadClientLists(selectedClientId); }} disabled={!selectedClientId}>
              Adicionar Cardápio diário
            </Button>
            {clientManagementMode && (
              <Button className="btn" variant="outline" onClick={() => setClientManagementMode(false)}>Sair do modo</Button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const rightColumnClients = clientManagementMode ? (
    <div className="detail flex flex-col h-full" style={{ overflowY: "auto" }}>
      <div className="head flex items-center justify-between">
        <h2 className="p-0 border-0 m-0">Gerenciar Cardápio do Cliente</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs">Dia</label>
            <select
                className="appearance-none h-8 min-w-[140px] px-3 py-0 leading-8 rounded border border-neutral-700"
                value={dailyMenuForm.dayOfWeek}
                onChange={(e) => setDailyMenuForm(p => ({ ...p, dayOfWeek: Number(e.target.value) }))}
            >
                <option value={0}>Dom</option>
                <option value={1}>Seg</option>
                <option value={2}>Ter</option>
                <option value={3}>Qua</option>
                <option value={4}>Qui</option>
                <option value={5}>Sex</option>
                <option value={6}>Sáb</option>
            </select>

            {editingClientDailyMenu ? (
            <Button className="btn" onClick={handleUpdateClientDailyMenu} disabled={!selectedClientId}>Atualizar Menu Diário</Button>
          ) : (
            <Button className="btn" onClick={handleSaveClientDailyMenu} disabled={!selectedClientId}>Adicionar Menu Diário</Button>
          )}
        </div>
      </div>
      <div className="body p-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: '16px' }}>
        {/* Comidas */}
        <div className="panel">
          <h3 className="text-sm font-semibold mb-3">Comidas <span className="text-xs text-muted-foreground">({clientFoods.length})</span></h3>
          <div className="flex gap-2 mb-3 flex-wrap">
            <Button className="btn" onClick={() => { setClientFoodsModalMode("manage"); setClientFoodsModalOpen(true); }}>+ Adicionar Comida</Button>
            <Button className="btn" onClick={async () => { setClientFoodsModalMode("import"); setClientFoodsModalOpen(true); }}>Importar Públicas</Button>
          </div>
          {/* Lista */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {clientFoods.length === 0 && !loadingClientData && <div className="empty text-xs">Sem comidas.</div>}
            {clientFoods.map(f => (
              <div key={f.id || f.name} className="border rounded-md p-2 text-xs flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-medium">{f.name}</span>
                  {f.brand && <span className="text-muted-foreground">{f.brand}</span>}
                </div>
                <div className="flex gap-2">
                  <Button className="btn danger" size="sm" onClick={() => handleClientDeleteFood(f)}>X</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Pratos */}
        <div className="panel">
          <h3 className="text-sm font-semibold mb-3">Pratos <span className="text-xs text-muted-foreground">({clientDishes.length})</span></h3>
          {!showClientDishCreate && (
            <div className="flex gap-2 mb-3">
              <Button className="btn" onClick={() => setShowClientDishCreate(true)}>+ Criar Prato</Button>
            </div>
          )}
          {showClientDishCreate && (
            <div className="space-y-3 mb-3">
              <div>
                <label className="text-xs">Nome (opcional)</label>
                <Input value={clientDishName} onChange={e => setClientDishName(e.target.value)} placeholder="Ex: Salada Proteica" />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {clientFoods.map(cf => {
                  const checked = clientDishIngredients[cf.id || ""] !== undefined;
                  const qty = clientDishIngredients[cf.id || ""] || 1;
                  return (
                    <div key={cf.id || cf.name} className="flex items-center justify-between border rounded p-2 text-xs">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={checked} onChange={e => toggleClientDishIngredient(cf.id || "", e.target.checked)} />
                        <span>{cf.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>porções</span>
                        <Input type="number" className="w-16" value={qty} min={1} disabled={!checked} onChange={e => setClientDishIngredientQty(cf.id || "", Number(e.target.value))} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Selecionados: {Object.keys(clientDishIngredients).length}</span>
                <div className="flex gap-2">
                  <Button className="btn" onClick={handleClientCreateDish}>Salvar</Button>
                  <Button className="btn" variant="outline" onClick={() => { setShowClientDishCreate(false); setClientDishIngredients({}); setClientDishName(""); }}>Cancelar</Button>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {clientDishes.length === 0 && !loadingClientData && <div className="empty text-xs">Sem pratos.</div>}
            {clientDishes.map(d => (
              <div key={d.id || d.name} className="border rounded-md p-2 text-xs flex justify-between items-center">
                <span className="font-medium">{d.name || 'Sem nome'}</span>
                <Button className="btn danger" size="sm" onClick={() => handleClientDeleteDish(d)}>X</Button>
              </div>
            ))}
          </div>
        </div>
        {/* Refeições */}
        <div className="panel">
          <h3 className="text-sm font-semibold mb-3">Refeições <span className="text-xs text-muted-foreground">(selecionadas: {Object.values(selectedClientMealIds).filter(Boolean).length})</span></h3>
          {!showClientMealCreate && (
            <div className="flex gap-2 mb-3">
              <Button className="btn" onClick={() => { setShowClientMealCreate(true); setEditingClientMeal(null); setClientMealForm({ type: 0, name: "", dishIds: [], ingredients: {} }); }}>+ Criar Refeição</Button>
            </div>
          )}
          {showClientMealCreate && (
            <div className="space-y-3 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-xs">Tipo</label>
                  <select className="input" value={clientMealForm.type} onChange={e => setClientMealForm(p => ({ ...p, type: Number(e.target.value) }))}>
                    <option value={0}>Café da manhã</option>
                    <option value={1}>Lanche da manhã</option>
                    <option value={2}>Almoço</option>
                    <option value={3}>Lanche da tarde</option>
                    <option value={4}>Jantar</option>
                    <option value={5}>Ceia</option>
                  </select>
                  <label className="text-xs">Nome (opcional)</label>
                  <Input value={clientMealForm.name} onChange={e => setClientMealForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Pós-treino" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs">Pratos</label>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {clientDishes.map(d => {
                      const checked = clientMealForm.dishIds.includes(d.id || "");
                      return (
                        <div key={d.id || d.name} className="flex items-center gap-2 text-xs border rounded p-1">
                          <input type="checkbox" checked={checked} onChange={e => toggleClientMealDish(d.id || "", e.target.checked)} />
                          <span>{d.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs">Alimentos</label>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {clientFoods.map(f => {
                      const checked = clientMealForm.ingredients[f.id || ""] !== undefined;
                      const qty = clientMealForm.ingredients[f.id || ""] || 1;
                      return (
                        <div key={f.id || f.name} className="flex items-center justify-between text-xs border rounded p-1">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={checked} onChange={e => toggleClientMealFood(f.id || "", e.target.checked)} />
                            <span>{f.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>porções</span>
                            <Input type="number" className="w-14" value={qty} min={1} disabled={!checked} onChange={e => setClientMealFoodQty(f.id || "", Number(e.target.value))} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Selecionados: pratos {clientMealForm.dishIds.length} • alimentos {Object.keys(clientMealForm.ingredients).length}</span>
                <div className="flex gap-2">
                  {!editingClientMeal && <Button className="btn" onClick={handleClientCreateMeal}>Salvar</Button>}
                  {editingClientMeal && <Button className="btn" onClick={handleClientUpdateMeal}>Atualizar</Button>}
                  <Button className="btn" variant="outline" onClick={() => { setShowClientMealCreate(false); setEditingClientMeal(null); }}>Cancelar</Button>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {clientMeals.length === 0 && !loadingClientData && <div className="empty text-xs">Sem refeições.</div>}
            {clientMeals.map(m => {
              const selected = !!selectedClientMealIds[m.id || ""];
              return (
                <div key={m.id || m.name} className="border rounded-md p-2 text-xs flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={selected} onChange={e => setSelectedClientMealIds(prev => ({ ...prev, [m.id || ""]: e.target.checked }))} />
                    <span className="font-medium">{m.name || 'Refeição'}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="btn" size="sm" onClick={() => startClientMealEdit(m)}>Editar</Button>
                    <Button className="btn danger" size="sm" onClick={() => handleClientDeleteMeal(m)}>X</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="detail flex flex-col h-full" style={{ overflowY: "auto" }}>
      <div className="head">
        <h2 className="p-0 border-0 m-0">Meus Clientes</h2>
      </div>
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="text-center max-w-[520px]">
          <h3 className="text-muted-foreground">Selecione um cliente para visualizar e gerenciar os cardápios diários.</h3>
          {!selectedClientId && <p className="text-muted-foreground mt-2">Escolha um cliente na coluna à esquerda.</p>}
          {selectedClientId && !clientManagementMode && <p className="text-muted-foreground mt-2">Clique em "Adicionar Cardápio diário" para abrir o modo de gerenciamento.</p>}
        </div>
      </div>
    </div>
  );

  // --- Modal content ---
  const renderModalContent = () => {
    switch (modalType) {
      case "food":
        return (
          <PublicFoodsBrowser
            pageSize={30}
            onFoodSelect={() => setShowModal(false)}
            onAdded={async () => {
              await loadNutritionData();
              setOpenSections((prev) => ({ ...prev, foods: true }));
              toast({ title: "Comida adicionada" });
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
                  {foods.map((f) => {
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
            <DailyMenuList dailyMenus={dailyMenus} compact onSelect={() => setShowModal(false)} onDelete={handleDeleteDailyMenu} />
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
      case "clientDailyMenuCreate":
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
                <label className="text-sm">Refeições do cliente</label>
                <div className="max-h-[50vh] overflow-y-auto space-y-2">
                  {clientMeals.map((m) => {
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

  // --- Layout selection by tab ---
  const left = activeTab === "clientes" ? leftColumnClients : leftColumnMy;
  const right = activeTab === "clientes" ? rightColumnClients : rightColumnMy;

  return (
    <div>
      <NutritionTemplate activeTab={activeTab} onTabChange={setActiveTab} left={left} right={right} />

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
            {modalType === "clientDailyMenuCreate" && (
              <Button type="button" className="btn primary" onClick={handleCreateClientDailyMenu} disabled={!selectedClientId}>
                Adicionar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clientFoodsModalOpen} onOpenChange={setClientFoodsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{clientFoodsModalMode === "manage" ? "Comidas do cliente" : "Importar comidas públicas"}</DialogTitle>
          </DialogHeader>
          <div className="h-[70vh]">
            {clientFoodsModalMode === "manage" ? (
              <PublicFoodsBrowser
                pageSize={30}
                userIdOverride={selectedClientId || undefined}
                allowCreate={true}
                onFoodSelect={(food) => {
                  // Adiciona à seleção local para o formulário, sem carregar tudo do usuário
                  setClientFoods((prev) => {
                    const exists = prev.some((f) => (f.id && f.id === food.id));
                    return exists ? prev : [...prev, food];
                  });
                  setClientFoodsModalOpen(false);
                  toast({ title: "Comida adicionada" });
                }}
                onAdded={async () => {
                  // Após criar, a lista dentro do modal já se atualiza; o usuário seleciona a comida para adicioná-la à seleção local
                }}
              />
            ) : (
              <div className="flex flex-col h-full gap-3">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-sm">Buscar comidas públicas</label>
                    <Input placeholder="Digite o nome" value={publicSearch} onChange={(e) => setPublicSearch(e.target.value)} />
                  </div>
                  <Button onClick={loadPublicFoodsForImport} disabled={loadingPublicFoods}>Atualizar</Button>
                </div>
                {loadingPublicFoods && <div className="text-sm text-muted-foreground">Carregando...</div>}
                <div className="flex-1 overflow-y-auto border rounded p-2 space-y-2">
                  {publicFoodsForImport
                    .filter((f) => (f.name || "").toLowerCase().includes(publicSearch.toLowerCase()))
                    .map((pf) => (
                      <div key={pf.id || pf.name} className="flex items-center justify-between text-xs border rounded px-2 py-1">
                        <div className="flex flex-col">
                          <span>{pf.name}</span>
                          {pf.brand && <span className="text-muted-foreground">{pf.brand}</span>}
                        </div>
                        <input type="checkbox" checked={!!selectedPublicFoodIds[pf.id || ""]} onChange={() => togglePublicFoodSelection(pf.id || "")} />
                      </div>
                    ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button onClick={handleInsertPublicFoods} disabled={!selectedClientId}>Adicionar Selecionadas</Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setClientFoodsModalOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
