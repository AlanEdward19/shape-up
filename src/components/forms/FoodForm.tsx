import React, { useState } from "react";
import { FoodFormData } from "@/lib/nutritionUtils";

interface FoodFormProps {
    initialData: FoodFormData;
    onSubmit: (data: FoodFormData) => void;
    formId: string;
}

export function FoodForm({ initialData, onSubmit, formId }: FoodFormProps) {
    const [form, setForm] = useState<FoodFormData>(initialData);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleNutritionalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = value === '' ? null : parseFloat(value);
        setForm(prevForm => ({
            ...prevForm,
            nutritionalInfo: {
                ...prevForm.nutritionalInfo,
                [name]: numValue,
            },
        }));
    };

    const handleProteinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = value === '' ? null : parseFloat(value);
        setForm(prevForm => ({
            ...prevForm,
            nutritionalInfo: {
                ...prevForm.nutritionalInfo,
                macronutrients: {
                    ...prevForm.nutritionalInfo.macronutrients,
                    [name]: numValue,
                },
            },
        }));
    };

    const handleCarbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = value === '' ? null : parseFloat(value);
        setForm(prevForm => ({
            ...prevForm,
            nutritionalInfo: {
                ...prevForm.nutritionalInfo,
                macronutrients: {
                    ...prevForm.nutritionalInfo.macronutrients,
                    carbohydrates: {
                        ...prevForm.nutritionalInfo.macronutrients?.carbohydrates,
                        [name]: numValue,
                    },
                },
            },
        }));
    };

    const handleSugarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = value === '' ? null : parseFloat(value);
        setForm(prevForm => ({
            ...prevForm,
            nutritionalInfo: {
                ...prevForm.nutritionalInfo,
                macronutrients: {
                    ...prevForm.nutritionalInfo.macronutrients,
                    carbohydrates: {
                        ...prevForm.nutritionalInfo.macronutrients?.carbohydrates,
                        sugar: {
                            ...prevForm.nutritionalInfo.macronutrients?.carbohydrates?.sugar,
                            [name]: numValue,
                        },
                    },
                },
            },
        }));
    };

    const handleFatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = value === '' ? null : parseFloat(value);
        setForm(prevForm => ({
            ...prevForm,
            nutritionalInfo: {
                ...prevForm.nutritionalInfo,
                macronutrients: {
                    ...prevForm.nutritionalInfo.macronutrients,
                    fats: {
                        ...prevForm.nutritionalInfo.macronutrients?.fats,
                        [name]: numValue,
                    },
                },
            },
        }));
    };

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
// COMPONENTES AUXILIARES (sem alterações)
// ---
function FormGroup({ title, children }: { title: string; children: React.ReactNode }) {
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
        <div>
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
