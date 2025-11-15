import React from "react";
import { FoodDto } from "@/types/nutritionService";

interface FoodDetailsProps {
  food: FoodDto;
}

export const FoodDetails: React.FC<FoodDetailsProps> = ({ food }) => {
  const details = food;
  return (
    <div className="mt-2 border-t pt-2 text-xs text-muted-foreground">
      <div className="mt-1">
        <span className="font-semibold">Tamanho da porção:</span>{" "}
        <span>{details.nutritionalInfo?.servingSize}</span>
      </div>
      <div className="mt-1">
        <span className="font-semibold">Macronutrientes:</span>
        <div className="ml-2 mt-1 flex flex-col gap-1">
          <div>
            Proteínas: {details.nutritionalInfo?.macronutrients?.proteins ?? "-"}
          </div>
          <div>
            Carboidratos totais: {details.nutritionalInfo?.macronutrients?.carbohydrates?.total ?? "-"}
          </div>
          <div>
            Fibra alimentar: {details.nutritionalInfo?.macronutrients?.carbohydrates?.dietaryFiber ?? "-"}
          </div>
          <div>
            Açúcares totais: {details.nutritionalInfo?.macronutrients?.carbohydrates?.sugar?.total ?? "-"}
          </div>
          <div>
            Açúcares adicionados: {details.nutritionalInfo?.macronutrients?.carbohydrates?.sugar?.addedSugar ?? "-"}
          </div>
          <div>
            Açúcares de álcool: {details.nutritionalInfo?.macronutrients?.carbohydrates?.sugar?.sugarAlcohols ?? "-"}
          </div>
          <div>
            Gorduras totais: {details.nutritionalInfo?.macronutrients?.fats?.total ?? "-"}
          </div>
          <div>
            Gorduras saturadas: {details.nutritionalInfo?.macronutrients?.fats?.saturatedFat ?? "-"}
          </div>
          <div>
            Gorduras trans: {details.nutritionalInfo?.macronutrients?.fats?.transFat ?? "-"}
          </div>
          <div>
            Gorduras poli-insaturadas: {details.nutritionalInfo?.macronutrients?.fats?.polyunsaturatedFat ?? "-"}
          </div>
          <div>
            Gorduras monoinsaturadas: {details.nutritionalInfo?.macronutrients?.fats?.monounsaturatedFat ?? "-"}
          </div>
          <div>
            Colesterol: {details.nutritionalInfo?.macronutrients?.fats?.cholesterol ?? "-"}
          </div>
        </div>
      </div>

      {details.nutritionalInfo?.micronutrients && (
        <div className="mt-2">
          <span className="font-semibold">Micronutrientes:</span>
          <div className="ml-2 mt-1 flex flex-col gap-1">
            {Object.entries(details.nutritionalInfo.micronutrients).map(([key, value]) => (
              <div key={key}>
                {key}: {value.quantity} {value.unit}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDetails;

