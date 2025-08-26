import {
    clientProfessionalReviewResponse,
    clientResponse, createProfessionalReviewRequest,
    createServicePlanRequest, professionalResponse, professionalScoreResponse,
    servicePlanResponse, updateProfessionalReviewRequest,
    updateServicePlanRequest
} from "@/types/professionalManagementService.ts";
import {SERVICES} from "@/config/services.ts";
import {createHeaders} from "@/services/utils/serviceUtils.ts";

export const ProfessionalManagementService = {
    createServicePlan: async (planDetails: createServicePlanRequest): Promise<servicePlanResponse> => {
        const response = await fetch(
            `${SERVICES.PROFESSIONAL_MANAGEMENT.baseUrl}${SERVICES.PROFESSIONAL_MANAGEMENT.endpoints.createServicePlan}`,
            {
                method: "POST",
                body: JSON.stringify(planDetails),
                headers: await createHeaders() }
        );
        if (!response.ok) throw new Error('Failed to create service plan');
        return response.json();
    },

    deactivateServicePlanFromClient: async (clientId: string, servicePlanId: string, reason:string) : Promise<clientResponse> => {
        const response = await fetch(
            `${SERVICES.PROFESSIONAL_MANAGEMENT.baseUrl}${SERVICES.PROFESSIONAL_MANAGEMENT.endpoints.deactivateServicePlanFromClient}`
                .replace('clientId', clientId)
                .replace('servicePlanId', servicePlanId),
            {
                method: "PUT",
                body: JSON.stringify({reason, status:1}),
                headers: await createHeaders() }
        );

        if (!response.ok) throw new Error('Failed to deactivate service plan from client');
        return response.json();
    },

    activateServicePlanToClient: async (clientId: string, servicePlanId: string) : Promise<clientResponse> => {
        const response = await fetch(
            `${SERVICES.PROFESSIONAL_MANAGEMENT.baseUrl}${SERVICES.PROFESSIONAL_MANAGEMENT.endpoints.activateServicePlanToClient}`
                .replace('clientId', clientId)
                .replace('servicePlanId', servicePlanId),
            {
                method: "PUT",
                body: JSON.stringify({reason:'', status:0}),
                headers: await createHeaders() }
        );

        if (!response.ok) throw new Error('Failed to activate service plan to client');
        return response.json();
    },

    updateServicePlanById : async (servicePlanId: string, updatedDetails: updateServicePlanRequest) : Promise<servicePlanResponse>=> {
        const response = await fetch(
            `${SERVICES.PROFESSIONAL_MANAGEMENT.baseUrl}${SERVICES.PROFESSIONAL_MANAGEMENT.endpoints.updateServicePlanById}`
                .replace('servicePlanId', servicePlanId),
            {
                method: "PATCH",
                body: JSON.stringify(updatedDetails),
                headers: await createHeaders() }
        );
        if (!response.ok) throw new Error('Failed to update service plan');
        return response.json();
    },

    deleteServicePlanById : async (servicePlanId: string) => {
        const response = await fetch(
            `${SERVICES.PROFESSIONAL_MANAGEMENT.baseUrl}${SERVICES.PROFESSIONAL_MANAGEMENT.endpoints.deleteServicePlanById}`
                .replace('servicePlanId', servicePlanId),
            {
                method: "DELETE",
                headers: await createHeaders() }
        );
        if (!response.ok) throw new Error('Failed to delete service plan');
    },

    getProfessionalClients : async (professionalId: string) : Promise<clientResponse[]>=> {
        const response = await fetch(
            `${SERVICES.PROFESSIONAL_MANAGEMENT.baseUrl}${SERVICES.PROFESSIONAL_MANAGEMENT.endpoints.getProfessionalClients}`
                .replace('professionalId', professionalId),
            {
                method: "GET",
                headers: await createHeaders() }
        );
        if (!response.ok) throw new Error('Failed to fetch professional clients');
        return response.json();
    },

    addServicePlanToClient : async (clientId: string, servicePlanId: string):Promise<clientResponse> => {
        const response = await fetch(
            `${SERVICES.PROFESSIONAL_MANAGEMENT.baseUrl}${SERVICES.PROFESSIONAL_MANAGEMENT.endpoints.addServicePlanToClient}`
                .replace('clientId', clientId)
                .replace('servicePlanId', servicePlanId),
            {
                method: "POST",
                headers: await createHeaders() }
        );
        if (!response.ok) throw new Error('Failed to add service plan to client');
        return response.json();
    },

    createProfessionalReview : async (professionalId:string, servicePlanId:string,reviewDetails: createProfessionalReviewRequest) : Promise<clientProfessionalReviewResponse>=> {
        const response = await fetch(
            `${SERVICES.PROFESSIONAL_MANAGEMENT.baseUrl}${SERVICES.PROFESSIONAL_MANAGEMENT.endpoints.createProfessionalReview}`
                .replace('professionalId', professionalId)
                .replace('servicePlanId', servicePlanId),
            {
                method: "POST",
                body: JSON.stringify(reviewDetails),
                headers: await createHeaders() }
        );
        if (!response.ok) throw new Error('Failed to create professional review');
        return response.json();
    },

    deleteProfessionalReview : async (reviewId: string) => {
        const response = await fetch(
            `${SERVICES.PROFESSIONAL_MANAGEMENT.baseUrl}${SERVICES.PROFESSIONAL_MANAGEMENT.endpoints.deleteProfessionalReview}`
                .replace('id', reviewId),
            {
                method: "DELETE",
                headers: await createHeaders() }
        );
        if (!response.ok) throw new Error('Failed to delete professional review');
    },

    updateProfessionalReview : async (reviewId: string, updatedDetails: updateProfessionalReviewRequest): Promise<clientProfessionalReviewResponse> => {
        const response = await fetch(
            `${SERVICES.PROFESSIONAL_MANAGEMENT.baseUrl}${SERVICES.PROFESSIONAL_MANAGEMENT.endpoints.updateProfessionalReview}`
                .replace('id', reviewId),
            {
                method: "PATCH",
                body: JSON.stringify(updatedDetails),
                headers: await createHeaders() }
        );
        if (!response.ok) throw new Error('Failed to update professional review');
        return response.json();
    },

    getProfessionalReviewsById : async (professionalId: string) : Promise<clientProfessionalReviewResponse[]>=> {
        const response = await fetch(
            `${SERVICES.PROFESSIONAL_MANAGEMENT.baseUrl}${SERVICES.PROFESSIONAL_MANAGEMENT.endpoints.getProfessionalReviewsById}`
                .replace('professionalId', professionalId),
            {
                method: "GET",
                headers: await createHeaders() }
        );
        if (!response.ok) throw new Error('Failed to fetch professional reviews');
        return response.json();
    },

    getProfessionals : async ():Promise<professionalResponse[]> => {
        const response = await fetch(
            `${SERVICES.PROFESSIONAL_MANAGEMENT.baseUrl}${SERVICES.PROFESSIONAL_MANAGEMENT.endpoints.getProfessionals}`,
            {
                method: "GET",
                headers: await createHeaders() }
        );

        if (!response.ok) throw new Error('Failed to fetch professionals');
        return response.json();
    },

    getProfessionalScoreById : async (professionalId: string) : Promise<professionalScoreResponse>=> {
        const response = await fetch(
            `${SERVICES.PROFESSIONAL_MANAGEMENT.baseUrl}${SERVICES.PROFESSIONAL_MANAGEMENT.endpoints.getProfessionalScoreById}`
                .replace('professionalId', professionalId),
            {
                method: "GET",
                headers: await createHeaders() }
        );

        if (!response.ok) throw new Error('Failed to fetch professional score');
        return response.json();
    },

    getProfessionalById : async (professionalId: string) : Promise<professionalResponse> => {
        const response = await fetch(
            `${SERVICES.PROFESSIONAL_MANAGEMENT.baseUrl}${SERVICES.PROFESSIONAL_MANAGEMENT.endpoints.getProfessionalById}`
                .replace('professionalId', professionalId),
            {
                method: "GET",
                headers: await createHeaders() }
        );

        if (!response.ok) throw new Error('Failed to fetch professional details');
        return response.json();
    },

    getClientById : async (clientId: string) : Promise<clientResponse> => {
        const response = await fetch(
            `${SERVICES.PROFESSIONAL_MANAGEMENT.baseUrl}${SERVICES.PROFESSIONAL_MANAGEMENT.endpoints.getClientById}`
                .replace('clientId', clientId),
            {
                method: "GET",
                headers: await createHeaders() }
        );
        if (!response.ok) throw new Error('Failed to fetch client details');
        return response.json();
    },
}