import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MeasurementRecordDTO } from '../models/measurement-record.dto'; // Ajuste o caminho se necessário

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  private baseUrl = "http://localhost:8080/records"; // URL base para os registros de medição

  constructor(private http: HttpClient) { }

  /**
   * Busca todos os registros de medição.
   */
  getAllMeasurements(): Observable<MeasurementRecordDTO[]> {
    return this.http.get<MeasurementRecordDTO[]>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Busca um único registro de medição pelo seu ID.
   * @param id O ID do registro de medição.
   */
  getMeasurementById(id: number): Observable<MeasurementRecordDTO> {
    return this.http.get<MeasurementRecordDTO>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cria um novo registro de medição.
   * O DTO de entrada deve corresponder à estrutura esperada pelo backend.
   */
  createMeasurement(measurementData: Partial<MeasurementRecordDTO>): Observable<MeasurementRecordDTO> {
    // O backend espera measurementDateTime, measurementValue e equipmentID.
    // O campo 'danger' será definido no backend.
    return this.http.post<MeasurementRecordDTO>(this.baseUrl, measurementData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Atualiza um registro de medição existente.
   * @param id O ID do registro a ser atualizado.
   * @param measurementData Os dados atualizados.
   */
  updateMeasurement(id: number, measurementData: Partial<MeasurementRecordDTO>): Observable<MeasurementRecordDTO> {
    // Vamos assumir que você adicionará um endpoint @PutMapping("/{id}") no seu controller.
    return this.http.put<MeasurementRecordDTO>(`${this.baseUrl}/${id}`, measurementData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Deleta um registro de medição pelo seu ID.
   * @param id O ID do registro a ser deletado.
   */
  deleteMeasurement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Busca medições para um equipamento específico.
   * @param equipmentId O ID do equipamento.
   */
  getMeasurementsByEquipmentId(equipmentId: number): Observable<MeasurementRecordDTO[]> {
    // Este método corresponde ao endpoint @GetMapping("/equipment/{equipmentId}") do backend.
    return this.http.get<MeasurementRecordDTO[]>(`${this.baseUrl}/equipment/${equipmentId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Filtra registros de medição pelo número de dias passados.
   * @param days O número de dias para olhar para trás.
   */
  filterMeasurementsByDays(days: number): Observable<MeasurementRecordDTO[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<MeasurementRecordDTO[]>(`${this.baseUrl}/filters`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido.';
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente ou de rede
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // O backend retornou um código de resposta sem sucesso.
      console.error(
        `Backend retornou código ${error.status}, ` +
        `corpo do erro: ${JSON.stringify(error.error)}`);
      errorMessage = `Erro do servidor: ${error.status}. Por favor, tente novamente.`;
      if (error.status === 400 && error.error?.errors) { // Exemplo para erros de validação do Spring Boot
        const validationErrors = error.error.errors.map((e: any) => e.defaultMessage).join(', ');
        errorMessage = `Erro de validação: ${validationErrors}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}