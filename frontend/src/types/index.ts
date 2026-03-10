export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type PatientStatus = 'waiting' | 'in-treatment' | 'completed' | 'transferred';
export type Gender = 'male' | 'female' | 'other';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  symptoms: string[];
  painLevel: number;
  heartRate: number;
  bloodPressure: string;
  oxygenLevel: number;
  temperature: number;
  medicalHistory: string;
  emergencyNotes: string;
  arrivalTime: Date;
  urgencyScore: number;
  priority: PriorityLevel;
  status: PatientStatus;
  assignedArea: string;
  riskFactors: RiskFactor[];
  aiExplanation: string;
}

export interface RiskFactor {
  text: string;
  severity: 'high' | 'medium' | 'low';
}

export interface PatientFormData {
  name: string;
  age: string;
  gender: Gender;
  symptoms: string[];
  painLevel: number;
  heartRate: string;
  bloodPressure: string;
  oxygenLevel: string;
  temperature: string;
  medicalHistory: string;
  emergencyNotes: string;
}

export interface TriageResult {
  urgencyScore: number;
  priority: PriorityLevel;
  assignedArea: string;
  riskFactors: RiskFactor[];
  explanation: string;
}
