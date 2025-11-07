import {
    FoodDto,
    DishDto,
    MealDto,
    DailyMenuDto,
    UserNutritionDto,
    CreateUserFoodCommand,
    CreateDishForSameUserCommand,
    CreateMealForSameUserCommand,
    CreateDailyMenuForSameUserCommand,
    CreateUserNutritionCommand,
    EditUserFoodCommand,
    EditDishCommand,
    EditMealCommand,
    EditDailyMenuCommand,
    EditUserNutritionCommand,
    PaginationQuery,
    UserPaginationQuery,
    DailyMenuListQuery
} from "@/types/nutritionService";
import { SERVICES } from "@/config/services";
import { createHeaders } from "@/services/utils/serviceUtils";

export const NutritionService = {
    // Public Food operations
    listPublicFoods: async (query?: PaginationQuery): Promise<FoodDto[]> => {
        const url = new URL(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.listPublicFoods}`);
        if (query?.page) url.searchParams.append('Page', query.page.toString());
        if (query?.rows) url.searchParams.append('Rows', query.rows.toString());

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to fetch public foods');
        return response.json();
    },

    // User Food operations
    listUserFoods: async (userId: string, query?: UserPaginationQuery): Promise<FoodDto[]> => {
        const url = new URL(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.listUserFoods.replace('userId', userId)}`);
        if (query?.page) url.searchParams.append('Page', query.page.toString());
        if (query?.rows) url.searchParams.append('Rows', query.rows.toString());
        if (query?.userId) url.searchParams.append('UserId', query.userId);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to fetch user foods');
        return response.json();
    },

    getUserFoodDetails: async (id: string): Promise<FoodDto> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.getUserFoodDetails.replace('id', id)}`, {
            method: "GET",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to fetch user food details');
        return response.json();
    },

    createUserFood: async (userId: string, details: CreateUserFoodCommand): Promise<FoodDto> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.createUserFood.replace('userId', userId)}`, {
            method: "POST",
            body: JSON.stringify(details),
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to create user food');
        return response.json();
    },

    updateUserFood: async (id: string, details: EditUserFoodCommand): Promise<void> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.updateUserFood.replace('id', id)}`, {
            method: "PUT",
            body: JSON.stringify(details),
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to update user food');
    },

    deleteUserFood: async (id: string): Promise<void> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.deleteUserFood.replace('id', id)}`, {
            method: "DELETE",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to delete user food');
    },

    getUserFoodByBarcode: async (barCode: string): Promise<FoodDto> => {
        const url = new URL(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.getUserFoodByBarcode}`);
        url.searchParams.append('BarCode', barCode);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to fetch user food by barcode');
        return response.json();
    },

    // Dish operations
    getDishDetails: async (id: string): Promise<DishDto> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.getDishDetails.replace('id', id)}`, {
            method: "GET",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to fetch dish details');
        return response.json();
    },

    listDishes: async (userId: string, query?: UserPaginationQuery): Promise<DishDto[]> => {
        const url = new URL(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.listDishes.replace('userId', userId)}`);
        if (query?.page) url.searchParams.append('Page', query.page.toString());
        if (query?.rows) url.searchParams.append('Rows', query.rows.toString());
        if (query?.userId) url.searchParams.append('UserId', query.userId);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to fetch dishes');
        return response.json();
    },

    createDish: async (details: CreateDishForSameUserCommand): Promise<DishDto> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.createDish}`, {
            method: "POST",
            body: JSON.stringify(details),
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to create dish');
        return response.json();
    },

    updateDish: async (id: string, details: EditDishCommand): Promise<void> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.updateDish.replace('id', id)}`, {
            method: "PUT",
            body: JSON.stringify(details),
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to update dish');
    },

    deleteDish: async (id: string): Promise<void> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.deleteDish.replace('id', id)}`, {
            method: "DELETE",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to delete dish');
    },

    // Meal operations
    createMeal: async (details: CreateMealForSameUserCommand): Promise<MealDto> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.createMeal}`, {
            method: "POST",
            body: JSON.stringify(details),
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to create meal');
        return response.json();
    },

    getMealDetails: async (mealId: string): Promise<MealDto> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.getMealDetails.replace('mealId', mealId)}`, {
            method: "GET",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to fetch meal details');
        return response.json();
    },

    listMeals: async (userId: string, query?: UserPaginationQuery): Promise<MealDto[]> => {
        const url = new URL(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.listMeals.replace('userId', userId)}`);
        if (query?.page) url.searchParams.append('Page', query.page.toString());
        if (query?.rows) url.searchParams.append('Rows', query.rows.toString());
        if (query?.userId) url.searchParams.append('UserId', query.userId);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to fetch meals');
        return response.json();
    },

    updateMeal: async (mealId: string, details: EditMealCommand): Promise<void> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.updateMeal.replace('mealId', mealId)}`, {
            method: "PUT",
            body: JSON.stringify(details),
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to update meal');
    },

    deleteMeal: async (mealId: string): Promise<void> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.deleteMeal.replace('mealId', mealId)}`, {
            method: "DELETE",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to delete meal');
    },

    // Daily Menu operations
    createDailyMenu: async (details: CreateDailyMenuForSameUserCommand): Promise<DailyMenuDto> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.createDailyMenu}`, {
            method: "POST",
            body: JSON.stringify(details),
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to create daily menu');
        return response.json();
    },

    getDailyMenuDetails: async (id: string): Promise<DailyMenuDto> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.getDailyMenuDetails.replace('id', id)}`, {
            method: "GET",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to fetch daily menu details');
        return response.json();
    },

    listDailyMenus: async (userId: string, query?: DailyMenuListQuery): Promise<DailyMenuDto[]> => {
        const url = new URL(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.listDailyMenus.replace('userId', userId)}`);
        if (query?.dayOfWeek) url.searchParams.append('DayOfWeek', query.dayOfWeek);
        if (query?.page) url.searchParams.append('Page', query.page.toString());
        if (query?.size) url.searchParams.append('Size', query.size.toString());
        if (query?.userId) url.searchParams.append('UserId', query.userId);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to fetch daily menus');
        return response.json();
    },

    updateDailyMenu: async (id: string, details: EditDailyMenuCommand): Promise<void> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.updateDailyMenu.replace('id', id)}`, {
            method: "PUT",
            body: JSON.stringify(details),
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to update daily menu');
    },

    deleteDailyMenu: async (id: string): Promise<void> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.deleteDailyMenu.replace('id', id)}`, {
            method: "DELETE",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to delete daily menu');
    },

    // User Nutrition operations
    createUserNutrition: async (userId: string, details: CreateUserNutritionCommand): Promise<UserNutritionDto> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.createUserNutrition.replace('userId', userId)}`, {
            method: "POST",
            body: JSON.stringify(details),
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to create user nutrition');
        return response.json();
    },

    getUserNutritionDetails: async (id: string): Promise<UserNutritionDto> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.getUserNutritionDetails.replace('id', id)}`, {
            method: "GET",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to fetch user nutrition details');
        return response.json();
    },

    getUserSpecificNutrition: async (userId: string): Promise<UserNutritionDto> => {
        const response = await fetch(`${SERVICES.NUTRITION.baseUrl}${SERVICES.NUTRITION.endpoints.getUserSpecificNutrition.replace('userId', userId)}`, {
            method: "GET",
            headers: await createHeaders()
        });

        if (!response.ok) throw new Error('Failed to fetch user specific nutrition');
        return response.json();
    }
};