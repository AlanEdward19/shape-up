import React, { useState, useEffect } from "react";
import "../styles/training.css";
import { 
  FoodDto, 
  DishDto, 
  MealDto, 
  DailyMenuDto, 
  MealType, 
  CreateUserFoodCommand,
  CreateDishForSameUserCommand,
  CreateMealForSameUserCommand,
  CreateDailyMenuForSameUserCommand
} from "@/types/nutritionService"; // Tipos devem estar atualizados (Etapa 1)
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ChevronDown, Plus } from "lucide-react";
import { FoodForm } from "@/components/forms/FoodForm"; // Importa o novo formulário
import { initialFoodFormState } from "@/lib/nutritionUtils"; // Importa o estado inicial

export default function Nutrition() {
  // Main state
  const [foods, setFoods] = useState<FoodDto[]>([]);
  const [dishes, setDishes] = useState<DishDto[]>([]);
  const [meals, setMeals] = useState<MealDto[]>([]);
  const [dailyMenus, setDailyMenus] = useState<DailyMenuDto[]>([]);
  const [nutritionGoals, setNutritionGoals] = useState<any | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState("minha-nutricao");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    foods: false,
    dishes: false,
    meals: false,
    dailyMenus: false
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"food" | "dish" | "meal" | "dailyMenu" | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null); // Usado para popular o formulário para edição

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Load initial data
  useEffect(() => {
    loadNutritionData();
  }, []);

  const loadNutritionData = async () => {
    try {
      // TODO: Replace with actual API calls
      // const foods = await NutritionService.getFoods();
      // ...
      
      // Mock data for now
      setFoods([]);
      setDishes([]);
      setMeals([]);
      setDailyMenus([]);
    } catch (error) {
      console.error("Erro ao carregar dados de nutrição:", error);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const openCreateModal = (type: "food" | "dish" | "meal" | "dailyMenu") => {
    setModalType(type);
    setEditingItem(null); // Reseta o item em edição
    setShowModal(true);
  };
  
  // Função para abrir o modal em MODO DE EDIÇÃO (você vai precisar disso)
  const openEditModal = (item: any, type: "food" | "dish" | "meal" | "dailyMenu") => {
    setModalType(type);
    setEditingItem(item); // Define o item para edição
    setShowModal(true);
  };

  // Handler específico para o formulário de Comida
  const handleFoodSubmit = async (data: CreateUserFoodCommand) => {
    try {
      if (editingItem) {
        // Lógica de ATUALIZAÇÃO (mock)
        console.log("Atualizando comida:", editingItem.id, data);
        // await NutritionService.updateFood(editingItem.id, data);
      } else {
        // Lógica de CRIAÇÃO (mock)
        console.log("Criando comida:", data);
        // await NutritionService.createFood(data);
      }
      
      setShowModal(false);
      setEditingItem(null);
      loadNutritionData(); // Recarrega os dados
    } catch (error) {
      console.error("Erro ao salvar comida:", error);
    }
  };

  const consolidateNutritionPlan = () => {
    // TODO: Implement nutrition plan consolidation logic
    console.log("Consolidando plano nutricional...");
  };
  
  const renderModalContent = () => {
    switch (modalType) {
      case "food":
        return (
          <FoodForm 
            formId="food-form" // MUDANÇA: Passa o ID para o formulário
            onSubmit={handleFoodSubmit}
            initialData={editingItem || initialFoodFormState} 
          />
        );
      case "dish":
        // TODO: Implementar DishForm
        // return <DishForm formId="dish-form" ... />
        return <div>Formulário de Prato (WIP)</div>;
      case "meal":
        // TODO: Implementar MealForm
        // return <MealForm formId="meal-form" ... />
        return <div>Formulário de Refeição (WIP)</div>;
      case "dailyMenu":
        // TODO: Implementar DailyMenuForm
        // return <DailyMenuForm formId="daily-menu-form" ... />
        return <div>Formulário de Cardápio Diário (WIP)</div>;
      default:
        return null;
    }
  };

  const getActiveFormId = () => {
     switch (modalType) {
      case "food": return "food-form";
      case "dish": return "dish-form";
      case "meal": return "meal-form";
      case "dailyMenu": return "daily-menu-form";
      default: return "";
    }
  }

  const getModalTitle = () => {
    const action = editingItem ? "Editar" : "Criar";
    switch (modalType) {
      case "food": return `${action} Comida`;
      case "dish": return `${action} Prato`;
      case "meal": return `${action} Refeição`;
      case "dailyMenu": return `${action} Cardápio Diário`;
      default: return "";
    }
  };

  return (
    <div>
      <div className="training-main">
        <section className="col">
           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
             <div className="tabs" style={{ display: "flex", justifyContent: "center", marginTop: 12 }} role="tablist">
               <button 
                 className="tab" 
                 role="tab" 
                 aria-selected={activeTab === "minha-nutricao"}
                 onClick={() => setActiveTab("minha-nutricao")}
               >
                 Minha Nutrição
               </button>
               <button 
                 className="tab" 
                 role="tab" 
                 aria-selected={activeTab === "clientes"}
                 onClick={() => setActiveTab("clientes")}
               >
                 Clientes
               </button>
               <button 
                 className="tab" 
                 role="tab" 
                 aria-selected={activeTab === "tutorial"}
                 onClick={() => setActiveTab("tutorial")}
               >
                 Tutorial
               </button>
             </div>
           </div>

           <div className="list" style={{ padding: "20px 16px", gap: "12px" }}>
             {/* Comidas Section */}
             <Collapsible open={openSections.foods} onOpenChange={() => toggleSection("foods")}>
               <div className="card" style={{ padding: "16px", cursor: "pointer" }}>
                 <CollapsibleTrigger asChild>
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                     <div>
                       <h3 style={{ margin: 0, fontWeight: 600, fontSize: "16px" }}>Comidas</h3>
                       <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--muted)" }}>
                         Toque para expandir e ver a lista
                       </p>
                     </div>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                       <Button
                         size="sm"
                         onClick={(e) => {
                           e.stopPropagation();
                           openCreateModal("food");
                         }}
                         className="btn"
                         style={{ padding: "6px 8px" }}
                       >
                         <Plus size={16} />
                       </Button>
                       <ChevronDown 
                         size={20} 
                         style={{ 
                           transition: "transform 0.2s",
                           transform: openSections.foods ? "rotate(180deg)" : "rotate(0deg)"
                         }} 
                       />
                     </div>
                   </div>
                 </CollapsibleTrigger>
                 <CollapsibleContent style={{ marginTop: "12px" }}>
                   <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                     {foods.length === 0 ? (
                       <div className="empty">Nenhuma comida cadastrada.</div>
                     ) : (
                       foods.map((food) => (
                         <div key={food.id} className="pill" style={{ margin: "4px 0", width: "100%" }}>
                           <span>{food.name}</span>
                           <span className="muted">({food.nutritionalInfo.calories} kcal)</span>
                           {/* TODO: Adicionar botão de editar aqui */}
                           {/* <Button size="xs" onClick={() => openEditModal(food, 'food')}>Editar</Button> */}
                         </div>
                       ))
                     )}
                   </div>
                 </CollapsibleContent>
               </div>
             </Collapsible>

             {/* Pratos Section (Sem alterações) */}
             <Collapsible open={openSections.dishes} onOpenChange={() => toggleSection("dishes")}>
               <div className="card" style={{ padding: "16px", cursor: "pointer" }}>
                 <CollapsibleTrigger asChild>
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                     <div>
                       <h3 style={{ margin: 0, fontWeight: 600, fontSize: "16px" }}>Pratos</h3>
                       <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--muted)" }}>
                         Toque para expandir e ver a lista
                       </p>
                     </div>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                       <Button
                         size="sm"
                         onClick={(e) => {
                           e.stopPropagation();
                           openCreateModal("dish");
                         }}
                         className="btn"
                         style={{ padding: "6px 8px" }}
                       >
                         <Plus size={16} />
                       </Button>
                       <ChevronDown 
                         size={20} 
                         style={{ 
                           transition: "transform 0.2s",
                           transform: openSections.dishes ? "rotate(180deg)" : "rotate(0deg)"
                         }} 
                       />
                     </div>
                   </div>
                 </CollapsibleTrigger>
                 <CollapsibleContent style={{ marginTop: "12px" }}>
                   <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                     {dishes.length === 0 ? (
                       <div className="empty">Nenhum prato cadastrado.</div>
                     ) : (
                       dishes.map((dish) => (
                         <div key={dish.id} className="pill" style={{ margin: "4px 0", width: "100%" }}>
                           <span>{dish.name}</span>
                           <span className="muted">({dish.ingredients?.length || 0} ingredientes)</span>
                         </div>
                       ))
                     )}
                   </div>
                 </CollapsibleContent>
               </div>
             </Collapsible>

             {/* Refeições Section (Sem alterações) */}
             <Collapsible open={openSections.meals} onOpenChange={() => toggleSection("meals")}>
               <div className="card" style={{ padding: "16px", cursor: "pointer" }}>
                 <CollapsibleTrigger asChild>
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                     <div>
                       <h3 style={{ margin: 0, fontWeight: 600, fontSize: "16px" }}>Refeições</h3>
                       <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--muted)" }}>
                         Toque para expandir e ver a lista
                       </p>
                     </div>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                       <Button
                         size="sm"
                         onClick={(e) => {
                           e.stopPropagation();
                           openCreateModal("meal");
                         }}
                         className="btn"
                         style={{ padding: "6px 8px" }}
                       >
                         <Plus size={16} />
                       </Button>
                       <ChevronDown 
                         size={20} 
                         style={{ 
                           transition: "transform 0.2s",
                           transform: openSections.meals ? "rotate(180deg)" : "rotate(0deg)"
                         }} 
                       />
                     </div>
                   </div>
                 </CollapsibleTrigger>
                 <CollapsibleContent style={{ marginTop: "12px" }}>
                   <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                     {meals.length === 0 ? (
                       <div className="empty">Nenhuma refeição cadastrada.</div>
                     ) : (
                       meals.map((meal) => (
                         <div key={meal.id} className="pill" style={{ margin: "4px 0", width: "100%" }}>
                           <span>{meal.name}</span>
                           <span className="muted">({meal.type})</span>
                         </div>
                       ))
                     )}
                   </div>
                 </CollapsibleContent>
               </div>
             </Collapsible>

             {/* Cardápios Diários Section (Sem alterações) */}
             <Collapsible open={openSections.dailyMenus} onOpenChange={() => toggleSection("dailyMenus")}>
               <div className="card" style={{ padding: "16px", cursor: "pointer" }}>
                 <CollapsibleTrigger asChild>
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                     <div>
                       <h3 style={{ margin: 0, fontWeight: 600, fontSize: "16px" }}>Cardápios Diários</h3>
                       <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--muted)" }}>
                         Toque para expandir e ver a lista
                       </p>
                     </div>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                       <Button
                         size="sm"
                         onClick={(e) => {
                           e.stopPropagation();
                           openCreateModal("dailyMenu");
                         }}
                         className="btn"
                         style={{ padding: "6px 8px" }}
                       >
                         <Plus size={16} />
                       </Button>
                       <ChevronDown 
                         size={20} 
                         style={{ 
                           transition: "transform 0.2s",
                           transform: openSections.dailyMenus ? "rotate(180deg)" : "rotate(0deg)"
                         }} 
                       />
                     </div>
                   </div>
                 </CollapsibleTrigger>
                 <CollapsibleContent style={{ marginTop: "12px" }}>
                   <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                     {dailyMenus.length === 0 ? (
                       <div className="empty">Nenhum cardápio diário cadastrado.</div>
                     ) : (
                       dailyMenus.map((menu) => (
                         <div key={menu.id} className="pill" style={{ margin: "4px 0", width: "100%" }}>
                           <span>Menu {menu.dayOfWeek !== undefined ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][menu.dayOfWeek] : 'Sem dia'}</span>
                           <span className="muted">({menu.meals?.length || 0} refeições)</span>
                         </div>
                       ))
                     )}
                   </div>
                 </CollapsibleContent>
               </div>
             </Collapsible>
           </div>

           {/* Consolidar Plano Nutricional Button (Sem alterações) */}
           <div style={{ padding: "16px", marginTop: "auto" }}>
             <Button 
               className="btn primary" 
               style={{ width: "100%", padding: "12px", fontSize: "16px", fontWeight: 600 }}
               onClick={consolidateNutritionPlan}
             >
               ✓ Consolidar Plano Nutricional
             </Button>
           </div>
         </section>

        {/* RIGHT COLUMN: CONTENT (Sem alterações, código omitido) */}
        <section className="col">
           <div className="detail" style={{ overflowY: "auto" }}>
             <div className="head">
               <h2 style={{ padding: 0, border: 0, margin: 0 }}>
                 Nutrição
               </h2>
             </div>
             <div className="body" style={{ display: "block", padding: "24px" }}>
               <div style={{ textAlign: "center", marginTop: "60px" }}>
                 <h3 style={{ color: "var(--muted)" }}>
                   Gerencie sua alimentação de forma inteligente
                 </h3>
                 <p style={{ color: "var(--muted)", maxWidth: "400px", margin: "16px auto" }}>
                   Cadastre alimentos, crie pratos personalizados, organize refeições e 
                   monte cardápios completos para atingir seus objetivos nutricionais.
                 </p>
                 <div style={{ marginTop: "32px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                   <Button onClick={() => openCreateModal("food")} className="btn">
                     + Adicionar Comida
                   </Button>
                   <Button onClick={() => openCreateModal("dish")} className="btn">
                     + Criar Prato
                   </Button>
                   <Button onClick={() => openCreateModal("meal")} className="btn">
                     + Nova Refeição
                   </Button>
                   <Button onClick={() => openCreateModal("dailyMenu")} className="btn">
                     + Cardápio Diário
                   </Button>
                 </div>
               </div>
             </div>
           </div>
         </section>
      </div>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="min-w-[500px] max-w-screen-xl flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{getModalTitle()}</DialogTitle>
          </DialogHeader>
          
          {/* O overflow e o footer permanecem os mesmos */}
          <div className="overflow-y-auto pr-6">
            {renderModalContent()}
          </div>
          
          <DialogFooter className="pt-4 border-t mt-4">
            <Button 
              type="button" 
              onClick={() => setShowModal(false)}
              className="btn"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              form={getActiveFormId()} 
              className="btn primary"
            >
              {editingItem ? "Salvar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}