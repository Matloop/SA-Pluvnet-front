import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Address } from '../models/address';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  url : string = "http://localhost:8080/address"
  constructor(private http: HttpClient) { }

  getAddresses(): Observable<Address[]>{
    return this.http.get<Address[]>(this.url);
  }

  addAddress(address: Address): Observable<Address> {
    return this.http.post<Address>(this.url,address)
    .pipe(
      catchError(this.handleError)
    )
  }

  private handleError(error: any): Observable<never> {
    console.error('Erro no serviço:', error);
    return throwError(() => new Error('Ocorreu um erro. Tente novamente mais tarde.'));
  }

}
