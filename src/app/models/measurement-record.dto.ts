// src/app/models/measurement-record.dto.ts
export interface MeasurementRecordDTO {
  id?: number; // Usually returned by the backend after creation or when fetching
  danger: string | null; // Can be null if not always set
  measurementDateTime: string; // LocalDateTime will be a string in ISO format
  measurementValue: string;
  equipmentID: number | null; // equipmentID is Long in Java, maps to number in TS
}