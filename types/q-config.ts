export interface QConfig {
    id?: number;
    quarter: string;
    year: number;
    sprintsPerQ: number;
    sprintDuration: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}