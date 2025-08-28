export enum MuscleGroup {
    Chest,
    MiddleChest,
    UpperChest,
    LowerChest,

    Arms,
    Triceps,
    Biceps,
    Forearms,

    Shoulders,
    DeltoidAnterior,
    DeltoidLateral,
    DeltoidPosterior,

    Back,
    Traps,
    UpperBack,
    MiddleBack,
    LowerBack,
    Lats,

    Abs,
    AbsUpper,
    AbsLower,
    AbsObliques,

    Legs,
    Quadriceps,
    Hamstrings,
    Glutes,
    Calves,
    HipFlexors,

    FullBody
}

export enum WorkoutVisibility {
    Public,
    FriendsOnly,
    Private
}

export enum MeasurementUnit {
    Kilogram,
    Pound,
    Kilometer,
    Mile
}

export enum WorkoutStatus {
    InProgress,
    Finished,
    Cancelled
}

export interface exerciseResponse {
    id: string;
    name: string;
    description: string;
    muscleGroups: MuscleGroup[];
    requiresWeight: boolean;
    imageUrl: string;
    videoUrl: string;
}

export interface workoutResponse {
    id: string;
    creatorId: string;
    userId: string;
    name: string;
    visibility: WorkoutVisibility;
    exercises: exerciseResponse[];
    restingTimeInSeconds: number;
}

export interface createWorkoutRequest {
    name:string;
    visibility: WorkoutVisibility;
    exercises: string[];
    restingTimeInSeconds: number;
}

export interface workoutExerciseRequest {
    exerciseId: string;
    weight?: number;
    repetitions?: number;
    measureUnit: MeasurementUnit;
}

export interface workoutExerciseResponse {
    weight?: number;
    repetitions?: number;
    measureUnit: MeasurementUnit;
    metadata: exerciseResponse;
}

export interface createWorkoutSessionRequest {
    workoutId: string;
    exercises: workoutExerciseRequest[];
}

export interface workoutSessionResponse {
    sessionId: string;
    userId: string;
    workoutId: string;
    startedAt: string;
    endedAt?: string;
    status: WorkoutStatus;
    exercises: workoutExerciseResponse[];
}