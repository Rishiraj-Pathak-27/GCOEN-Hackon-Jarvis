'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Patient, PatientStatus, PriorityLevel } from '@/types';
import { samplePatients } from '@/lib/sample-data';

interface AppContextType {
  patients: Patient[];
  addPatient: (p: Patient) => void;
  updatePatientStatus: (id: string, status: PatientStatus) => void;
  getPatient: (id: string) => Patient | undefined;
  stats: { critical: number; high: number; medium: number; low: number; waiting: number; total: number };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(samplePatients);

  const addPatient = useCallback((p: Patient) => {
    setPatients(prev => [p, ...prev]);
  }, []);

  const updatePatientStatus = useCallback((id: string, status: PatientStatus) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }, []);

  const getPatient = useCallback((id: string) => {
    return patients.find(p => p.id === id);
  }, [patients]);

  const stats = useMemo(() => ({
    critical: patients.filter(p => p.priority === 'critical').length,
    high: patients.filter(p => p.priority === 'high').length,
    medium: patients.filter(p => p.priority === 'medium').length,
    low: patients.filter(p => p.priority === 'low').length,
    waiting: patients.filter(p => p.status === 'waiting').length,
    total: patients.length,
  }), [patients]);

  return (
    <AppContext.Provider value={{ patients, addPatient, updatePatientStatus, getPatient, stats }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
