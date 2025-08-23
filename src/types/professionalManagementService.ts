export enum ServicePlanType {
    Training,
    Diet
}

export enum SubscriptionStatus {
    Active,
    Cancelled,
    Expired
}

export enum ProfessionalType {
    Trainer,
    Nutritionist,
    Both
}

export interface createServicePlanRequest {
    title: string;
    description: string;
    durationInDays: number;
    price: number;
    type: ServicePlanType;
}

export interface servicePlanResponse {
    id: string;
    professionalId: string;
    title: string;
    description: string;
    durationInDays: number;
    price: number;
    type: ServicePlanType;
}

export interface clientServicePlanResponse {
    id: string;
    startDate: string;
    endDate: string;
    status: SubscriptionStatus;
    feedback: string | null;
    servicePlan: servicePlanResponse;
}

export interface clientProfessionalReviewResponse {
    id: string;
    clientId: string;
    clientName: string;
    professionalId: string;
    clientServicePlanId: string;
    rating: number;
    comment: string;
    lastUpdatedAt: string;
}

export interface createProfessionalReviewRequest {
    rating: number;
    comment?: string;
}

export interface updateProfessionalReviewRequest {
    rating?: number;
    comment?: string;
}

export interface clientResponse {
    id: string;
    email: string;
    name: string;
    isNutritionist: boolean;
    isTrainer: boolean;
    servicePlans: clientServicePlanResponse[];
    reviews: clientProfessionalReviewResponse[];
}

export interface updateServicePlanRequest {
    title?: string;
    description?: string;
    durationInDays?: number;
    price?: number;
    type?: ServicePlanType;
}

export interface professionalResponse {
    id: string;
    email: string;
    name: string;
    type:ProfessionalType,
    isVerified: boolean;
    servicePlans: servicePlanResponse[];
}

export interface professionalScoreResponse {
    professionalId: string;
    averageScore: number;
    totalReviews: number;
    lastUpdated: string;
}