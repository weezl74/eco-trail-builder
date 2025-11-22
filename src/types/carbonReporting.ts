// Types for Carbon Reporting System

export type ReportingMode = 'sme' | 'full';

export interface CarbonResponse {
  category: string;
  subcategory?: string;
  activityData: number;
  unit: string;
  emissionFactor: number;
  emissions: number; // kgCO2e
  notes?: string;
}

export interface CategoryResult {
  category: string;
  totalEmissions: number; // kgCO2e
  responses: CarbonResponse[];
}

export interface CarbonReport {
  reportId: string;
  businessId: string;
  reportingMode: ReportingMode;
  reportingPeriod: {
    start: string;
    end: string;
  };
  categories: CategoryResult[];
  totalEmissions: number; // kgCO2e
  totalEmissionsTonnes: number; // tonnes CO2e
  completedAt: string;
  skippedCategories: string[];
}

// Emission Factor Structure
export interface EmissionFactor {
  name: string;
  unit: string;
  factor: number; // kgCO2e per unit
  category: string;
  subcategory?: string;
  conversionFactor?: number; // For unit conversions
}

// Question Structure
export interface CarbonQuestion {
  id: string;
  category: string;
  subcategory?: string;
  question: string;
  helpText?: string;
  unit: string;
  emissionFactorKey: string;
  required: boolean;
  allowMultiple?: boolean; // For items like multiple vehicles
  options?: {
    label: string;
    emissionFactorKey: string;
  }[];
}

// Category Groups for SME vs Full
export interface CategoryGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  questions: CarbonQuestion[];
  availableIn: ('sme' | 'full')[];
}