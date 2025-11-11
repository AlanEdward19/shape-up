import React, { useState } from "react";
import { FoodFormData } from "@/lib/nutritionUtils"; 

interface FoodFormProps {
  initialData: FoodFormData;
  onSubmit: (data: FoodFormData) => void;
  formId: string;
}

export function FoodForm({ initialData, onSubmit, formId }: FoodFormProps) {
  const [form, setForm] = useState<FoodFormData>(initialData);

  // --- FUNÇÕES DE 'CHANGE' (Omitidas por brevidade, sem alteração) ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
  const handleNutritionalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
  const handleProteinChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
  const handleCarbChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
  const handleSugarChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
  const handleFatsChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
  // --- Fim das FUNÇÕES DE 'CHANGE' ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const macros = form.nutritionalInfo.macronutrients;
  const carbs = macros?.carbohydrates;
  const sugar = carbs?.sugar;
  const fats = macros?.fats;

  return (
    <form id={formId} onSubmit={handleSubmit}>
      {/* Layout de 4 colunas mantido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* === COLUNA 1: Básico === */}
        <FormGroup title="Informações Básicas">
          <InputGroup
            label="Nome"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            required
          />
          <InputGroup
            label="Marca"
            name="brand"
            value={form.brand || ""}
            onChange={handleInputChange}
          />
          <InputGroup
            label="Código de Barras"
            name="barCode"
            value={form.barCode || ""}
            onChange={handleInputChange}
          />
        </FormGroup>

        {/* === COLUNA 2: Visão Geral === */}
        <FormGroup title="Visão Geral (por porção)">
          <InputGroup
            label="Tamanho da Porção (g)"
            name="servingSize"
            type="number"
            value={form.nutritionalInfo.servingSize}
            onChange={handleNutritionalInfoChange}
            required
          />
          <InputGroup
            label="Calorias (kcal)"
            name="calories"
            type="number"
            value={form.nutritionalInfo.calories || ""}
            onChange={handleNutritionalInfoChange}
          />
          <InputGroup
            label="Proteínas (g)"
            name="proteins"
            type="number"
            value={macros?.proteins || ""}
            onChange={handleProteinChange}
          />
        </FormGroup>
        
        {/* === COLUNA 3: Carboidratos === */}
        {/* MUDANÇA CRÍTICA: Removido o grid aninhado */}
        <FormGroup title="Carboidratos">
          <InputGroup
            label="Total (g)"
            name="total"
            type="number"
            value={carbs?.total || ""}
            onChange={handleCarbChange}
          />
          <InputGroup
            label="Fibras (g)"
            name="dietaryFiber"
            type="number"
            value={carbs?.dietaryFiber || ""}
            onChange={handleCarbChange}
          />
          <InputGroup
            label="Açúcares Totais (g)"
            name="total"
            type="number"
            value={sugar?.total || ""}
            onChange={handleSugarChange}
          />
          <InputGroup
            label="Açúcar Adicionado (g)"
            name="addedSugar"
            type="number"
            value={sugar?.addedSugar || ""}
            onChange={handleSugarChange}
          />
          <InputGroup
            label="Álcool de Açúcar (g)"
            name="sugarAlcohols"
            type="number"
            value={sugar?.sugarAlcohols || ""}
            onChange={handleSugarChange}
          />
        </FormGroup>

        {/* === COLUNA 4: Gorduras === */}
        {/* MUDANÇA CRÍTICA: Removido o grid aninhado */}
        <FormGroup title="Gorduras">
          <InputGroup
            label="Total (g)"
            name="total"
            type="number"
            value={fats?.total || ""}
            onChange={handleFatsChange}
          />
          <InputGroup
            label="Saturada (g)"
            name="saturatedFat"
            type="number"
            value={fats?.saturatedFat || ""}
            onChange={handleFatsChange}
          />
          <InputGroup
            label="Trans (g)"
            name="transFat"
            type="number"
            value={fats?.transFat || ""}
            onChange={handleFatsChange}
          />
          <InputGroup
            label="Poli-insaturada (g)"
            name="polyunsaturatedFat"
            type="number"
            value={fats?.polyunsaturatedFat || ""}
            onChange={handleFatsChange}
          />
          <InputGroup
            label="Mono-insaturada (g)"
            name="monounsaturatedFat"
            type="number"
            value={fats?.monounsaturatedFat || ""}
            onChange={handleFatsChange}
          />
          <InputGroup
            label="Colesterol (mg)"
            name="cholesterol"
            type="number"
            value={fats?.cholesterol || ""}
            onChange={handleFatsChange}
          />
        </FormGroup>
      </div>
    </form>
  );
}

// ---
// COMPONENTES AUXILIARES
// ---
function FormGroup({ title, children }: { title: string; children: React.ReactNode }) {
  // O space-y-4 controla o espaço vertical ENTRE os inputs
  return (
    <fieldset className="border p-4 rounded-md space-y-4 h-full">
      <legend className="text-sm font-medium px-1">{title}</legend>
      {children}
    </fieldset>
  );
}
function InputGroup(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    // O div agora permite que o InputGroup ocupe a largura total
    <div>
      {/* O mb-1.5 (6px) dá o espaçamento limpo */}
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        className="input"
        style={{ width: "100%", padding: "8px" }}
        step="0.1"
        {...inputProps}
      />
    </div>
  );
}