import { MuscleGroup } from "@/types/trainingService";

export function muscleGroupToPtBr(group: MuscleGroup | string): string {
  // Accepts both enum and string
  const key = typeof group === "string" ? group : MuscleGroup[group];
  switch (key) {
    case "Chest":
      return "Peitoral";
    case "MiddleChest":
      return "Peitoral Médio";
    case "UpperChest":
      return "Peitoral Superior";
    case "LowerChest":
      return "Peitoral Inferior";
    case "Triceps":
      return "Tríceps";
    case "Biceps":
      return "Bíceps";
    case "Forearms":
      return "Antebraços";
    case "DeltoidAnterior":
      return "Deltoide Anterior";
    case "DeltoidLateral":
      return "Deltoide Lateral";
    case "DeltoidPosterior":
      return "Deltoide Posterior";
    case "Traps":
      return "Trapézio";
    case "UpperBack":
      return "Costas Superiores";
    case "MiddleBack":
      return "Costas Médias";
    case "LowerBack":
      return "Costas Inferiores";
    case "Lats":
      return "Dorsal";
    case "AbsUpper":
      return "Abdômen Superior";
    case "AbsLower":
      return "Abdômen Inferior";
    case "AbsObliques":
      return "Oblíquos";
    case "Quadriceps":
      return "Quadríceps";
    case "Hamstrings":
      return "Isquiotibiais";
    case "Glutes":
      return "Glúteos";
    case "Calves":
      return "Panturrilhas";
    case "HipFlexors":
      return "Flexores do Quadril";
    case "FullBody":
      return "Corpo Inteiro";
    case "Arms":
      return "Braços";
    case "Shoulders":
      return "Ombros";
    case "Back":
      return "Costas";
    case "Abs":
      return "Abdômen";
    case "Legs":
      return "Pernas";
    default:
      return "";
  }
}

export function getMainMuscleGroups(): MuscleGroup[] {
  return [
    MuscleGroup.Chest,
    MuscleGroup.Arms,
    MuscleGroup.Shoulders,
    MuscleGroup.Back,
    MuscleGroup.Abs,
    MuscleGroup.Legs,
    MuscleGroup.FullBody,
  ];
}

export function getRelatedMuscleGroups(group: MuscleGroup): MuscleGroup[] {
  switch (group) {
    case MuscleGroup.Chest:
      return [
        MuscleGroup.MiddleChest,
        MuscleGroup.UpperChest,
        MuscleGroup.LowerChest,
      ];
    case MuscleGroup.Back:
      return [
        MuscleGroup.UpperBack,
        MuscleGroup.MiddleBack,
        MuscleGroup.LowerBack,
        MuscleGroup.Lats,
        MuscleGroup.Traps,
      ];
    case MuscleGroup.Abs:
      return [
        MuscleGroup.AbsUpper,
        MuscleGroup.AbsLower,
        MuscleGroup.AbsObliques,
      ];
    case MuscleGroup.Legs:
      return [
        MuscleGroup.Quadriceps,
        MuscleGroup.Hamstrings,
        MuscleGroup.Glutes,
        MuscleGroup.Calves,
        MuscleGroup.HipFlexors,
      ];
    case MuscleGroup.Shoulders:
      return [
        MuscleGroup.DeltoidAnterior,
        MuscleGroup.DeltoidLateral,
        MuscleGroup.DeltoidPosterior,
      ];
    case MuscleGroup.Arms:
      return [
        MuscleGroup.Biceps,
        MuscleGroup.Triceps,
        MuscleGroup.Forearms,
      ];
    default:
      return [];
  }
}

export function getSecondaryMuscleGroups(): MuscleGroup[] {
  return [
    MuscleGroup.MiddleChest,
    MuscleGroup.UpperChest,
    MuscleGroup.LowerChest,
    MuscleGroup.Triceps,
    MuscleGroup.Biceps,
    MuscleGroup.Forearms,
    MuscleGroup.DeltoidAnterior,
    MuscleGroup.DeltoidLateral,
    MuscleGroup.DeltoidPosterior,
    MuscleGroup.Traps,
    MuscleGroup.UpperBack,
    MuscleGroup.MiddleBack,
    MuscleGroup.LowerBack,
    MuscleGroup.Lats,
    MuscleGroup.AbsUpper,
    MuscleGroup.AbsLower,
    MuscleGroup.AbsObliques,
    MuscleGroup.Quadriceps,
    MuscleGroup.Hamstrings,
    MuscleGroup.Glutes,
    MuscleGroup.Calves,
    MuscleGroup.HipFlexors,
  ];
}
