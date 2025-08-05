import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Owner } from '../models/owner';

// Interface for the simple dropdown list
export interface OwnerSelectionDTO {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class OwnerService {
  private apiUrl = "http://localhost:8080/owners"; // Plural 'owners'
  private http = inject(HttpClient);

  // Gets the lightweight list of owners for the equipment form dropdown
  getAllOwnersForSelection(): Observable<OwnerSelectionDTO[]> {
    return this.http.get<OwnerSelectionDTO[]>(`${this.apiUrl}/all-for-selection`);
  }

  // Your existing methods for a separate Owner Management page
  getOwners(): Observable<Owner[]> {
    return this.http.get<Owner[]>(this.apiUrl);
  }

  addOwner(owner: Owner): Observable<Owner> {
    return this.http.post<Owner>(this.apiUrl, owner).pipe(catchError(this.handleError));
  }

  updateOwner(owner: Owner): Observable<Owner> {
    if (!owner.id) {
      return throwError(() => new Error('Owner ID is required for update.'));
    }
    return this.http.put<Owner>(`${this.apiUrl}/${owner.id}`, owner);
  }

  deleteOwner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred in OwnerService:', error);
    return throwError(() => new Error('Something went wrong with the owner service; please try again later.'));
  }
}