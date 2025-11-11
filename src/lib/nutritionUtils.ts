// src/lib/nutritionUtils.ts
import { NutritionalInfo } from "@/types/nutritionService";

/**
 * Define a forma de dados limpa para o formulário de comida.
 * Isso desacopla o formulário dos comandos da API (Create/Edit).
 */
export interface FoodFormData {
  name: string; // O nome é obrigatório no formulário
  brand: string | null;
  barCode: string | null;
  nutritionalInfo: NutritionalInfo;
}

export const initialFoodFormState: FoodFormData = {
  name: "",
  brand: null,
  barCode: null,
  nutritionalInfo: {
    servingSize: 100,
    calories: 0,
    macronutrients: {
      proteins: 0,
      carbohydrates: {
        total: 0,
        dietaryFiber: 0,
        sugar: {
          total: 0,
          addedSugar: 0,
          sugarAlcohols: 0,
        },
      },
      fats: {
        total: 0,
        saturatedFat: 0,
        transFat: 0,
        polyunsaturatedFat: 0,
        monounsaturatedFat: 0,
        cholesterol: 0,
      },
    },
    micronutrients: {}, // Micronutrientes são gerenciados em outra UI (ainda não implementada)
  },
};