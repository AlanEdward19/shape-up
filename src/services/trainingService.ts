import {
    createWorkoutRequest,
    createWorkoutSessionRequest,
    exerciseResponse,
    workoutResponse, workoutSessionResponse
} from "@/types/trainingService.ts";
import {SERVICES} from "@/config/services.ts";
import {createHeaders} from "@/services/utils/serviceUtils.ts";

export const TrainingService = {
    getExerciseById: async (id: string) : Promise<exerciseResponse> => {
        const response = await fetch(`${SERVICES.TRAINING.baseUrl}${SERVICES.TRAINING.endpoints.getExerciseById.replace('exerciseId', id)}`,
            {
                method: "GET",
                headers: await createHeaders()
            });

        if (!response.ok) throw new Error('Failed to fetch exercise by id');
        return response.json();
    },

    getExercisesByMuscleGroup: async (muscleGroup?: string) : Promise<exerciseResponse[]> => {
        const url = new URL(`${SERVICES.TRAINING.baseUrl}${SERVICES.TRAINING.endpoints.getExercisesByMuscleGroup}`);
        if (muscleGroup) {
            url.searchParams.append('muscleGroup', muscleGroup);
        }

        const response = await fetch(url.toString(),
            {
                method: "GET",
                headers: await createHeaders()
            });

        if (!response.ok) throw new Error('Failed to fetch exercises by muscle group');
        return response.json();
    },

    getWorkoutById: async (id: string) : Promise<workoutResponse> => {
        const response = await fetch(`${SERVICES.TRAINING.baseUrl}${SERVICES.TRAINING.endpoints.getWorkoutById.replace('workoutId', id)}`,
            {
                method: "GET",
                headers: await createHeaders()
            });

        if (!response.ok) throw new Error('Failed to fetch workout by id');
        return response.json();
    },

    getWorkoutsByUserId: async (userId: string) : Promise<workoutResponse[]> => {
        const response = await fetch(`${SERVICES.TRAINING.baseUrl}${SERVICES.TRAINING.endpoints.getWorkoutsByUserId.replace('userId', userId)}`,
            {
                method: "GET",
                headers: await createHeaders()
            });

        if (!response.ok) throw new Error('Failed to fetch workouts by user id');
        return response.json();
    },

    deleteWorkoutById: async (id: string) => {
        const response = await fetch(`${SERVICES.TRAINING.baseUrl}${SERVICES.TRAINING.endpoints.deleteWorkoutById.replace('workoutId', id)}`,
            {
                method: "DELETE",
                headers: await createHeaders()
            });

        if (!response.ok) throw new Error('Failed to delete workout by id');
        return;
    },

    createWorkout: async (details: createWorkoutRequest) : Promise<workoutResponse> => {
        const response = await fetch(`${SERVICES.TRAINING.baseUrl}${SERVICES.TRAINING.endpoints.createWorkout}`,
            {
                method: "POST",
                body: JSON.stringify(details),
                headers: await createHeaders()
            });

        if (!response.ok) throw new Error('Failed to create workout');
        return response.json();
    },

    createWorkoutForClient: async (clientId: string, details: createWorkoutRequest) : Promise<workoutResponse> => {
        const response = await fetch(`${SERVICES.TRAINING.baseUrl}${SERVICES.TRAINING.endpoints.createWorkoutForClient.replace('clientId', clientId)}`,
            {
                method: "POST",
                body: JSON.stringify(details),
                headers: await createHeaders()
            });

        if (!response.ok) throw new Error('Failed to create workout for client');
        return response.json();
    },

    updateWorkout: async (workoutId: string, details: createWorkoutRequest) : Promise<workoutResponse> => {
        const response = await fetch(`${SERVICES.TRAINING.baseUrl}${SERVICES.TRAINING.endpoints.updateWorkout.replace('workoutId', workoutId)}`,
            {
                method: "PUT",
                body: JSON.stringify(details),
                headers: await createHeaders()
            });

        if (!response.ok) throw new Error('Failed to update workout');
        return response.json();
    },

    createWorkoutSession: async (details: createWorkoutSessionRequest) : Promise<workoutSessionResponse> => {
        const response = await fetch(`${SERVICES.TRAINING.baseUrl}${SERVICES.TRAINING.endpoints.createWorkoutSession}`,
            {
                method: "POST",
                body: JSON.stringify(details),
                headers: await createHeaders()
            });
        if (!response.ok) throw new Error('Failed to create workout session');
        return response.json();
    },

    getWorkoutSessionsByWorkoutId: async (workoutId: string) : Promise<workoutSessionResponse[]> => {
        const response = await fetch(`${SERVICES.TRAINING.baseUrl}${SERVICES.TRAINING.endpoints.getWorkoutSessionsByWorkoutId.replace('workoutId', workoutId)}`,
            {
                method: "GET",
                headers: await createHeaders()
            });

        if (!response.ok) throw new Error('Failed to fetch workout sessions by workout id');
        return response.json();
    },

    getWorkoutSessionById: async (sessionId: string) : Promise<workoutSessionResponse> => {
        const response = await fetch(`${SERVICES.TRAINING.baseUrl}${SERVICES.TRAINING.endpoints.getWorkoutSessionById.replace('sessionId', sessionId)}`,
            {
                method: "GET",
                headers: await createHeaders()
            });

        if (!response.ok) throw new Error('Failed to fetch workout session by id');
        return response.json();
    },

    updateWorkoutSession: async (sessionId: string, details: createWorkoutSessionRequest) : Promise<workoutSessionResponse> => {
        const response = await fetch(`${SERVICES.TRAINING.baseUrl}${SERVICES.TRAINING.endpoints.updateWorkoutSession.replace('sessionId', sessionId)}`,
            {
                method: "PUT",
                body: JSON.stringify(details),
                headers: await createHeaders()
            });

        if (!response.ok) throw new Error('Failed to update workout session');
        return response.json();
    },

    deleteWorkoutSessionById: async (id: string) => {
        const response = await fetch(`${SERVICES.TRAINING.baseUrl}${SERVICES.TRAINING.endpoints.deleteWorkoutSessionById.replace('sessionId', id)}`,
            {
                method: "DELETE",
                headers: await createHeaders()
            });

        if (!response.ok) throw new Error('Failed to delete workout session by id');
    },

    getCurrentWorkoutSession: async() : Promise<workoutSessionResponse> => {
        const response = await fetch(`${SERVICES.TRAINING.baseUrl}${SERVICES.TRAINING.endpoints.getCurrentWorkoutSession}`,
            {
                method: "GET",
                headers: await createHeaders()
            });

        if (!response.ok) throw new Error('Failed to fetch current workout session');
        return response.json();
    },

    getWorkoutSessionsByUserId: async (userId: string) : Promise<workoutSessionResponse> => {
        const response = await fetch(`${SERVICES.TRAINING.baseUrl}${SERVICES.TRAINING.endpoints.getWorkoutSessionsByUserId.replace('userId', userId)}`,
            {
                method: "GET",
                headers: await createHeaders()
            });

        if (!response.ok) throw new Error('Failed to fetch workout sessions by user id');
        return response.json();
    }
}