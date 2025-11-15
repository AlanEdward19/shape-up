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
  const [modalType, setModalType] = useState<"food" | "dish" | "meal" | "dailyMenu" | null>(null);

  useEffect(() => {
    loadNutritionData();
  }, []);

  const loadNutritionData = async () => {
    try {
      const uid = getUserId() || sessionStorage.getItem("userId") || localStorage.getItem("userId");
      if (uid) {
        const userFoods = await NutritionService.listUserFoods(uid);
        setFoods(userFoods ?? []);
      } else {
        setFoods([]);
      }
      setDishes([]);
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
    setModalType(type);
    setShowModal(true);
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
      case "dish":
        return <div>Formulário de Prato (WIP)</div>;
      case "meal":
        return <div>Formulário de Refeição (WIP)</div>;
      case "dailyMenu":
        return <div>Formulário de Cardápio Diário (WIP)</div>;
      default:
        return null;
    }
  };

  const getActiveFormId = () => {
    switch (modalType) {
      case "food":
        return "";
      case "dish":
        return "dish-form";
      case "meal":
        return "meal-form";
      case "dailyMenu":
        return "daily-menu-form";
      default:
        return "";
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "food":
        return "Buscar Comidas Públicas";
      case "dish":
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
        />
      </div>

      <div className="card p-4">
        {/* Placeholder for Pratos */}
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="m-0 font-semibold text-base">Pratos</h3>
            <p className="m-0 mt-1 text-sm text-muted-foreground">Toque para expandir e ver a lista</p>
          </div>
          <Button size="sm" onClick={() => openCreateModal("dish")} className="btn px-2 py-1">+ </Button>
        </div>
        {/* Conteúdo original mantido como futuro refactor */}
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
    <div className="flex-col h-full" style={{ overflowY: "auto" }}>
      <div className="head">
        <h2 className="p-0 border-0 m-0">Nutrição</h2>
      </div>
      <div className="mt-40 flex w-full justify-center gap-3 flex-nowrap md:flex-wrap">
        <div className="text-center max-w-[800px]">
          <h3 className="text-muted-foreground">Gerencie sua alimentação de forma inteligente</h3>
          <p className="text-muted-foreground mx-auto mt-4">
            Cadastre alimentos, crie pratos personalizados, organize refeições e monte cardápios completos para atingir seus objetivos nutricionais.
          </p>
            <div className="mt-10 flex w-full justify-center gap-3 flex-nowrap">
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
            {modalType !== "food" && (
              <Button type="submit" form={getActiveFormId()} className="btn primary">
                Salvar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}