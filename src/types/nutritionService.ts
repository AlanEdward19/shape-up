// Enums based on Swagger documentation
export enum DayOfWeek {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
}

export enum MealType {
    Breakfast = 0,
    Lunch = 1,
    Snack = 2,
    PreWorkout = 3,
    PostWorkout = 4,
    Dinner = 5
}

// Core nutrition interfaces based on Swagger schemas
export interface SugarDetails {
  total: number;
  addedSugar: number | null;
  sugarAlcohols: number | null;
}

export interface Carbohydrates {
  total: number;
  dietaryFiber: number | null;
  sugar: SugarDetails | null;
}

export interface Fats {
  total: number;
  saturatedFat: number | null;
  transFat: number | null;
  polyunsaturatedFat: number | null;
  monounsaturatedFat: number | null;
  cholesterol: number | null;
}

export interface Macronutrients {
  proteins: number | null;
  carbohydrates: Carbohydrates | null;
  fats: Fats | null;
}

export interface MicronutrientDetails {
  quantity: number;
  unit: string;
}

export interface NutritionalInfo {
  macronutrients: Macronutrients | null;
  micronutrients: Record<string, MicronutrientDetails> | null; // Usando Record para o Dictionary
  servingSize: number;
  calories: number | null;
}

// Food interfaces
export interface FoodDto {
    id?: string;
    createdBy?: string;
    userId?: string;
    name?: string;
    brand?: string;
    barCode?: string;
    isRevised: boolean;
    nutritionalInfo: NutritionalInfo;
}

// Dish interfaces
export interface DishIngredientDto {
    quantity: number;
    food: FoodDto;
}

export interface DishDto {
    id?: string;
    createdBy?: string;
    userId?: string;
    name?: string;
    ingredients?: DishIngredientDto[];
}

// Meal interfaces
export interface MealDto {
    id?: string;
    createdBy?: string;
    userId?: string;
    type: MealType;
    name?: string;
    dishes?: DishDto[];
    ingredients?: DishIngredientDto[];
}

// Daily Menu interfaces
export interface DailyMenuDto {
    id?: string;
    createdBy?: string;
    userId?: string;
    dayOfWeek: DayOfWeek;
    meals?: MealDto[];
}

// User Nutrition interfaces
export interface UserNutritionDto {
    id?: string;
    createdBy?: string;
    nutritionManagerId?: string;
    userId?: string;
    dailyMenus?: DailyMenuDto[];
}

// Command interfaces for creating resources
export interface CreateUserFoodCommand {
    name?: string;
    brand?: string;
    barCode?: string;
    nutritionalInfo: NutritionalInfo;
    userId?: string;
}

export interface CreatePublicFoodCommand {
    name?: string;
    brand?: string;
    barCode?: string;
    nutritionalInfo: NutritionalInfo;
    userId?: string;
}

export interface IngredientInputForSameUser {
    foodId?: string;
    quantity: number;
}

export interface IngredientInputForDifferentUser {
    foodId?: string;
    quantity: number;
}

export interface CreateDishForSameUserCommand {
    name?: string;
    ingredients?: IngredientInputForSameUser[];
}

export interface CreateDishForDifferentUserCommand {
    name?: string;
    ingredients?: IngredientInputForDifferentUser[];
}

export interface MealIngredientInputForSameUser {
    foodId?: string;
    quantity: number;
}

export interface MealIngredientInputForDifferentUser {
    foodId?: string;
    quantity: number;
}

export interface CreateMealForSameUserCommand {
    type: MealType;
    name?: string;
    dishIds?: string[];
    ingredients?: MealIngredientInputForSameUser[];
}

export interface CreateMealForDifferentUserCommand {
    type: MealType;
    name?: string;
    dishIds?: string[];
    ingredients?: MealIngredientInputForDifferentUser[];
    userId?: string;
}

export interface CreateDailyMenuForSameUserCommand {
    dayOfWeek: DayOfWeek;
    mealIds?: string[];
}

export interface CreateDailyMenuForDifferentUserCommand {
    dayOfWeek: DayOfWeek;
    mealIds?: string[];
    userId?: string;
}

export interface CreateUserNutritionCommand {
    nutritionManagerId?: string;
    dailyMenuIds?: string[];
    userId?: string;
}

export interface InsertPublicFoodsInUserFoodCommand {
    publicFoodIds?: string[];
    userId?: string;
}

// Edit command interfaces
export interface EditUserFoodCommand {
    id?: string;
    name?: string;
    brand?: string;
    barCode?: string;
    nutritionalInfo: NutritionalInfo;
}

export interface EditPublicFoodCommand {
    id?: string;
    name?: string;
    brand?: string;
    barCode?: string;
    nutritionalInfo: NutritionalInfo;
}

export interface IngredientInput {
    foodId?: string;
    quantity: number;
}

export interface EditDishCommand {
    id?: string;
    name?: string;
    ingredients?: IngredientInput[];
}

export interface EditIngredientInput {
    foodId?: string;
    quantity: number;
}

export interface EditMealCommand {
    id?: string;
    name?: string;
    type: MealType;
    dishIds?: string[];
    ingredients?: EditIngredientInput[];
}

export interface EditDailyMenuCommand {
    id?: string;
    dayOfWeek: DayOfWeek;
    mealIds?: string[];
}

export interface EditUserNutritionCommand {
    id?: string;
    nutritionManagerId?: string;
    dailyMenuIds?: string[];
}

// Pagination interface
export interface PaginationQuery {
    page?: number;
    rows?: number;
}

export interface UserPaginationQuery extends PaginationQuery {
    userId?: string;
}

export interface DailyMenuListQuery extends UserPaginationQuery {
    dayOfWeek?: string;
    size?: number;
}