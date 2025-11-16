import { SERVICES } from "@/config/services";
import { createHeaders } from "@/services/utils/serviceUtils";

// Importa os tipos REAIS do seu
import {
    FoodDto,
    DishDto,
    MealDto,
    DailyMenuDto,
    UserNutritionDto,

    // Create Commands
    CreateUserFoodCommand,
    CreatePublicFoodCommand,
    CreateDishForSameUserCommand,
    CreateMealForSameUserCommand,
    CreateDailyMenuForSameUserCommand,
    CreateUserNutritionCommand,

    // Edit Commands
    EditUserFoodCommand,
    EditPublicFoodCommand,
    EditDishCommand,
    EditMealCommand,
    EditDailyMenuCommand,
    EditUserNutritionCommand,

    // Other
    InsertPublicFoodsInUserFoodCommand, CreateDishForDifferentUserCommand, CreateDailyMenuForDifferentUserCommand
} from "@/types/nutritionService";

// Helpers
const baseUrl = SERVICES.NUTRITION.baseUrl;
const endpoints = SERVICES.NUTRITION.endpoints;

/**
 * Limpa o 'userId' do corpo do comando, pois ele já está sendo
 * passado na URL para endpoints 'ForUser'.
 */
const cleanCommand = (command: any) => {
  const { userId, ...body } = command;
  return body;
};

export const NutritionService = {

  // --- Public Food ---

  listPublicFoods: async (): Promise<FoodDto[]> => {
    try {
      const response = await fetch(`${baseUrl}${endpoints.listPublicFoods}`, { 
        headers: await createHeaders() 
      });

      if (!response.ok) throw new Error(`Erro estranho`);
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getPublicFoodsByUser: async (): Promise<FoodDto[]> => {
    try {
      const response = await fetch(`${baseUrl}${endpoints.getPublicFoodsByUser}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao buscar comidas públicas por usuário");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getPublicFoodsUsedByUser: async (userId: string): Promise<FoodDto[]> => {
    try {
      const endpoint = endpoints.getPublicFoodsUsedByUser.replace("userId", userId);
      const response = await fetch(`${baseUrl}${endpoint}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao buscar comidas públicas usadas pelo usuário");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getPublicFoodDetails: async (id: string): Promise<FoodDto> => {
    try {
      const endpoint = endpoints.getPublicFoodDetails.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao buscar detalhes da comida pública");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  listUnrevisedFoods: async (): Promise<FoodDto[]> => {
    try {
      const response = await fetch(`${baseUrl}${endpoints.listUnrevisedFoods}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao listar comidas não revisadas");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  listRevisedFoods: async (): Promise<FoodDto[]> => {
    try {
      const response = await fetch(`${baseUrl}${endpoints.listRevisedFoods}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao listar comidas revisadas");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  createPublicFood: async (userId: string, command: CreatePublicFoodCommand): Promise<string> => {
    try {
      const endpoint = endpoints.createPublicFood.replace("userId", userId);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: await createHeaders(),
        body: JSON.stringify(cleanCommand(command))
      });
      if (!response.ok) throw new Error("Erro ao criar comida pública");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updatePublicFood: async (id: string, command: EditPublicFoodCommand): Promise<void> => {
    try {
      const endpoint = endpoints.updatePublicFood.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: await createHeaders(),
        body: JSON.stringify(command)
      });
      if (!response.ok) throw new Error("Erro ao atualizar comida pública");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deletePublicFood: async (id: string): Promise<void> => {
    try {
      const endpoint = endpoints.deletePublicFood.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: await createHeaders()
      });
      if (!response.ok) throw new Error("Erro ao deletar comida pública");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  approvePublicFood: async (id: string): Promise<void> => {
    try {
      const endpoint = endpoints.approvePublicFood.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: await createHeaders()
      });
      if (!response.ok) throw new Error("Erro ao aprovar comida pública");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getPublicFoodByBarcode: async (barcode: string): Promise<FoodDto> => {
    try {
      // Assumindo que o endpoint espera um query param ?barcode=
      const endpoint = `${endpoints.getPublicFoodByBarcode}?barcode=${encodeURIComponent(barcode)}`;
      const response = await fetch(`${baseUrl}${endpoint}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao buscar comida pública por código de barras");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // --- User Food ---

  listUserFoods: async (userId: string): Promise<FoodDto[]> => {
    try {
      const endpoint = endpoints.listUserFoods.replace("userId", userId);
      const response = await fetch(`${baseUrl}${endpoint}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao listar comidas do usuário");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getUserFoodDetails: async (id: string): Promise<FoodDto> => {
    try {
      const endpoint = endpoints.getUserFoodDetails.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao buscar detalhes da comida do usuário");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  createUserFood: async (userId: string, command: CreateUserFoodCommand): Promise<string> => {
    try {
      const endpoint = endpoints.createUserFood.replace("userId", userId);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: await createHeaders(),
        body: JSON.stringify(cleanCommand(command))
      });
      if (!response.ok) throw new Error("Erro ao criar comida do usuário");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateUserFood: async (id: string, command: EditUserFoodCommand): Promise<void> => {
    try {
      const endpoint = endpoints.updateUserFood.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: await createHeaders(),
        body: JSON.stringify(command)
      });
      if (!response.ok) throw new Error("Erro ao atualizar comida do usuário");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteUserFood: async (id: string): Promise<void> => {
    try {
      const endpoint = endpoints.deleteUserFood.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: await createHeaders()
      });
      if (!response.ok) throw new Error("Erro ao deletar comida do usuário");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  insertPublicFoodsInUserFood: async (userId: string, command: InsertPublicFoodsInUserFoodCommand): Promise<void> => {
    try {
      const endpoint = endpoints.insertPublicFoodsInUserFood.replace("userId", userId);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: await createHeaders(),
        body: JSON.stringify(cleanCommand(command))
      });
      if (!response.ok) throw new Error("Erro ao inserir comidas públicas no usuário");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  approveUserFood: async (id: string): Promise<void> => {
    try {
      const endpoint = endpoints.approveUserFood.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: await createHeaders()
      });
      if (!response.ok) throw new Error("Erro ao aprovar comida do usuário");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getUserFoodByBarcode: async (barcode: string): Promise<FoodDto> => {
    try {
      const endpoint = `${endpoints.getUserFoodByBarcode}?barcode=${encodeURIComponent(barcode)}`;
      const response = await fetch(`${baseUrl}${endpoint}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao buscar comida do usuário por código de barras");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // --- Dish ---

  getDishDetails: async (id: string): Promise<DishDto> => {
    try {
      const endpoint = endpoints.getDishDetails.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao buscar detalhes do prato");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  listDishes: async (userId: string): Promise<DishDto[]> => {
    try {
      const endpoint = endpoints.listDishes.replace("userId", userId);
      const response = await fetch(`${baseUrl}${endpoint}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao listar pratos");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  createDishForUser: async (userId: string, command: CreateDishForDifferentUserCommand): Promise<string> => {
    try {
      const endpoint = endpoints.createDishForUser;
      const response = await fetch(`${baseUrl}${endpoint}?userId=${userId}`, {
        method: 'POST',
        headers: await createHeaders(),
        body: JSON.stringify(command)
      });
      if (!response.ok) throw new Error("Erro ao criar prato para usuário");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  createDish: async (command: CreateDishForSameUserCommand): Promise<string> => {
    try {
      const endpoint = endpoints.createDish;
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: await createHeaders(),
        body: JSON.stringify(command)
      });
      if (!response.ok) throw new Error("Erro ao criar prato");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateDish: async (id: string, command: EditDishCommand): Promise<void> => {
    try {
      const endpoint = endpoints.updateDish.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: await createHeaders(),
        body: JSON.stringify(command)
      });
      if (!response.ok) throw new Error("Erro ao atualizar prato");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteDish: async (id: string): Promise<void> => {
    try {
      const endpoint = endpoints.deleteDish.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: await createHeaders()
      });
      if (!response.ok) throw new Error("Erro ao deletar prato");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // --- Meal ---

  createMealForUser: async (userId: string, command: CreateMealForSameUserCommand): Promise<string> => {
    try {
      const endpoint = endpoints.createMealForUser.replace("userId", userId);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: await createHeaders(),
        body: JSON.stringify(command)
      });
      if (!response.ok) throw new Error("Erro ao criar refeição para usuário");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteMeal: async (mealId: string): Promise<void> => {
    try {
      const endpoint = endpoints.deleteMeal.replace("mealId", mealId);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: await createHeaders()
      });
      if (!response.ok) throw new Error("Erro ao deletar refeição");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateMeal: async (mealId: string, command: EditMealCommand): Promise<void> => {
    try {
      const endpoint = endpoints.updateMeal.replace("mealId", mealId);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: await createHeaders(),
        body: JSON.stringify(command)
      });
      if (!response.ok) throw new Error("Erro ao atualizar refeição");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getMealDetails: async (mealId: string): Promise<MealDto> => {
    try {
      const endpoint = endpoints.getMealDetails.replace("mealId", mealId);
      const response = await fetch(`${baseUrl}${endpoint}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao buscar detalhes da refeição");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  listMeals: async (userId: string): Promise<MealDto[]> => {
    try {
      const endpoint = endpoints.listMeals.replace("userId", userId);
      const response = await fetch(`${baseUrl}${endpoint}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao listar refeições");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // --- Daily Menu ---

  createDailyMenuForUser: async (userId: string, command: CreateDailyMenuForSameUserCommand): Promise<string> => {
    try {
      const endpoint = endpoints.createDailyMenuForUser.replace("userId", userId);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: await createHeaders(),
        body: JSON.stringify(command)
      });
      if (!response.ok) throw new Error("Erro ao criar cardápio diário para usuário");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  createDailyMenu: async (command: CreateDailyMenuForDifferentUserCommand | { dayOfWeek: number; mealIds?: string[]; userId?: string }): Promise<string> => {
    try {
      const endpoint = endpoints.createDailyMenu;
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: await createHeaders(),
        body: JSON.stringify(command)
      });
      if (!response.ok) throw new Error("Erro ao criar cardápio diário");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteDailyMenu: async (id: string): Promise<void> => {
    try {
      const endpoint = endpoints.deleteDailyMenu.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: await createHeaders()
      });
      if (!response.ok) throw new Error("Erro ao deletar cardápio diário");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateDailyMenu: async (id: string, command: EditDailyMenuCommand): Promise<void> => {
    try {
      const endpoint = endpoints.updateDailyMenu.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: await createHeaders(),
        body: JSON.stringify(command)
      });
      if (!response.ok) throw new Error("Erro ao atualizar cardápio diário");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getDailyMenuDetails: async (id: string): Promise<DailyMenuDto> => {
    try {
      const endpoint = endpoints.getDailyMenuDetails.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao buscar detalhes do cardápio diário");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  listDailyMenus: async (userId: string): Promise<DailyMenuDto[]> => {
    try {
      const endpoint = endpoints.listDailyMenus.replace("userId", userId);
      const response = await fetch(`${baseUrl}${endpoint}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao listar cardápios diários");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // --- User Nutrition ---

  createUserNutrition: async (userId: string, command: CreateUserNutritionCommand): Promise<string> => {
    try {
      const endpoint = endpoints.createUserNutrition.replace("userId", userId);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: await createHeaders(),
        body: JSON.stringify(cleanCommand(command))
      });
      if (!response.ok) throw new Error("Erro ao criar nutrição do usuário");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteUserNutrition: async (id: string): Promise<void> => {
    try {
      const endpoint = endpoints.deleteUserNutrition.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: await createHeaders()
      });
      if (!response.ok) throw new Error("Erro ao deletar nutrição do usuário");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateUserNutrition: async (id: string, command: EditUserNutritionCommand): Promise<void> => {
    try {
      const endpoint = endpoints.updateUserNutrition.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: await createHeaders(),
        body: JSON.stringify(command)
      });
      if (!response.ok) throw new Error("Erro ao atualizar nutrição do usuário");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getUserNutritionDetails: async (id: string): Promise<UserNutritionDto> => {
    try {
      const endpoint = endpoints.getUserNutritionDetails.replace("id", id);
      const response = await fetch(`${baseUrl}${endpoint}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao buscar detalhes da nutrição do usuário");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  listUserNutritions: async (managerId: string): Promise<UserNutritionDto[]> => {
    try {
      const endpoint = endpoints.listUserNutritions.replace("managerId", managerId);
      const response = await fetch(`${baseUrl}${endpoint}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao listar nutrições de usuários");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getUserSpecificNutrition: async (userId: string): Promise<UserNutritionDto> => {
    try {
      const endpoint = endpoints.getUserSpecificNutrition.replace("userId", userId);
      const response = await fetch(`${baseUrl}${endpoint}`, { 
        headers: await createHeaders() 
      });
      if (!response.ok) throw new Error("Erro ao buscar nutrição específica do usuário");
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
