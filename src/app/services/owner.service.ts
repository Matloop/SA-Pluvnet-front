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

  private handleError(error: any): Observable<never> {
    console.error('Erro no serviço:', error);
    return throwError(() => new Error('Ocorreu um erro. Tente novamente mais tarde.'));
  }
}
