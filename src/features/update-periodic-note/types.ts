/**
 * update-periodic-note feature types
 */

export type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface UpdatePeriodicNoteParams {
  period: Period;
  content: string;
}

export interface UpdatePeriodicNoteError {
  error: string;
  errorCode?: number;
}