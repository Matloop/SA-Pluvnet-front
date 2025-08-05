import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO for DISPLAYING equipment data (matches backend EquipmentDTO)
export interface EquipmentDTO {
  id: number;
  description: string;
  ownerId: number;
  owner: {
    name: string;
    email: string;
  };
  address: {
    id: number;
    cep: string;
    street: string;
    number: string;
    complement?: string;
    city: string;
    neighborhood: string;
  };
}

// Payload for CREATING/UPDATING equipment (matches backend CreateEquipmentPayload)
export interface CreateEquipmentPayload {
  description: string;
  ownerId: number;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    city: string;
    neighborhood: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/equipments';

  getEquipmentsByOwnerId(ownerId: number): Observable<EquipmentDTO[]> {
    return this.http.get<EquipmentDTO[]>(`${this.apiUrl}/filters`, {
      params: { ownerId: ownerId.toString() }
    });
  }

  createEquipment(payload: CreateEquipmentPayload): Observable<EquipmentDTO> {
    return this.http.post<EquipmentDTO>(this.apiUrl, payload);
  }

  updateEquipment(id: number, payload: CreateEquipmentPayload): Observable<EquipmentDTO> {
    return this.http.put<EquipmentDTO>(`${this.apiUrl}/${id}`, payload);
  }

  deleteEquipment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}