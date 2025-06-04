// src/app/services/measurement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MeasurementRecordDTO } from '../models/measurement-record.dto'; // Adjust path if needed

@Injectable({
  providedIn: 'root'
})
export class MeasurementService { // Corrected spelling
  private baseUrl = "http://localhost:8080/records"; // Base URL for measurement records

  constructor(private http: HttpClient) { }

  /**
   * Fetches all measurement records.
   */
  getAllMeasurements(): Observable<MeasurementRecordDTO[]> {
    return this.http.get<MeasurementRecordDTO[]>(this.baseUrl)
      .pipe(
        // Example: Convert date strings to Date objects if needed by components
        // map(records => records.map(record => ({
        //   ...record,
        //   measurementDateTime: new Date(record.measurementDateTime)
        // }))),
        catchError(this.handleError)
      );
  }

  /**
   * Fetches a single measurement record by its ID.
   * @param id The ID of the measurement record.
   */
  getMeasurementById(id: number): Observable<MeasurementRecordDTO> {
    return this.http.get<MeasurementRecordDTO>(`${this.baseUrl}/${id}`)
      .pipe(
        // map(record => ({ // Example transformation
        //   ...record,
        //   measurementDateTime: new Date(record.measurementDateTime)
        // })),
        catchError(this.handleError)
      );
  }

  /**
   * Creates a new measurement record.
   * The input DTO should match the backend's expected structure for creation.
   * The 'danger' field might be set by business logic or passed from the client.
   * 'measurementValue' is expected as a string.
   * 'equipmentID' is the ID of the Pluviometro/Equipment.
   */
  createMeasurement(measurementData: Omit<MeasurementRecordDTO, 'id'>): Observable<MeasurementRecordDTO> {
    // Backend expects measurementDateTime as string, measurementValue as string, and equipmentID.
    // The 'danger' field needs to be provided or handled.
    // Example: if danger is determined client-side or a default is needed:
    // const payload = { ...measurementData, danger: measurementData.danger || 'DEFAULT_STATUS' };

    return this.http.post<MeasurementRecordDTO>(this.baseUrl, measurementData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Deletes a measurement record by its ID.
   * @param id The ID of the measurement record to delete.
   */
  deleteMeasurement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Filters measurement records by the number of past days.
   * @param days The number of days to look back.
   */
  filterMeasurementsByDays(days: number): Observable<MeasurementRecordDTO[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<MeasurementRecordDTO[]>(`${this.baseUrl}/filters`, { params })
      .pipe(catchError(this.handleError));
  }

  // You might want a method to get measurements for a specific Pluviometro/Equipment
  /**
   * Fetches all measurement records for a specific equipment ID.
   * (This endpoint is not explicitly in your controller, but is a common requirement)
   * If your backend supports /records/equipment/{equipmentId}, you'd use that.
   * Otherwise, you might filter client-side or add a backend endpoint.
   * For now, let's assume you'd filter from getAllMeasurements or add a backend endpoint.
   */
  getMeasurementsByEquipmentId(equipmentId: number): Observable<MeasurementRecordDTO[]> {
    // Example: If backend has an endpoint like /records/equipment/{equipmentId}
    // return this.http.get<MeasurementRecordDTO[]>(`${this.baseUrl}/equipment/${equipmentId}`)
    //   .pipe(catchError(this.handleError));

    // Or, if you need to filter client-side (less efficient for large datasets):
    return this.getAllMeasurements().pipe(
      map(records => records.filter(record => record.equipmentID === equipmentId)),
      catchError(this.handleError)
    );
    // A better approach is to have a dedicated backend endpoint for this.
    // e.g., @GetMapping("/equipment/{equipmentId}") in your MeasurementRecordController
  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido.';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend retornou código ${error.status}, ` +
        `corpo do erro: ${JSON.stringify(error.error)}`);
      errorMessage = `Erro do servidor: ${error.status}. ${error.error?.message || error.message || 'Por favor, tente novamente.'}`;
      if (error.status === 400 && error.error?.errors) { // Example for Spring Boot validation errors
        const validationErrors = error.error.errors.map((e: any) => e.defaultMessage).join(', ');
        errorMessage = `Erro de validação: ${validationErrors}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}