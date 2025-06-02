import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Owner } from '../models/owner';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {
url : string = "http://localhost:8080/owner"
  
  constructor(private http: HttpClient) { }

  getOwners(): Observable<Owner[]>{
    return this.http.get<Owner[]>(this.url);
  }

  addOwner(owner: Owner): Observable<Owner> {
    return this.http.post<Owner>(this.url,owner)
    .pipe(
      catchError(this.handleError)
    )
  }

  updateOwner(owner: Owner): Observable<Owner> { // <--- THIS METHOD MUST EXIST
    if (owner.id === null || owner.id === undefined) {
      console.error('Owner ID is required for update operation in service.');
      throw new Error('Owner ID is required for update.');
    }
    return this.http.put<Owner>(`${this.url}/${owner.id}`, owner);
  }

  deleteOwner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  private handleError(error: any): Observable<never> {
    console.error('Erro no serviço:', error);
    return throwError(() => new Error('Ocorreu um erro. Tente novamente mais tarde.'));
  }

  
}
