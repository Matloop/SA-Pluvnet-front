// src/app/services/via-cep.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // Adicionado 'of'
import { catchError, map } from 'rxjs/operators';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // Cidade
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean; // Propriedade de erro do ViaCEP
}

@Injectable({
  providedIn: 'root'
})
export class ViaCepService {
  private viaCepUrl = 'https://viacep.com.br/ws/';

  constructor(private http: HttpClient) { }

  buscarCep(cep: string): Observable<ViaCepResponse | null> {
    const cepNumerico = cep.replace(/\D/g, ''); // Remove caracteres não numéricos

    if (cepNumerico.length !== 8) {
      // Se o CEP não tiver 8 dígitos, retorna um Observable de null
      // Isso evita uma chamada HTTP desnecessária para CEPs claramente inválidos
      return of(null);
    }

    // Adicionada barra final em /json/
    return this.http.get<ViaCepResponse>(`${this.viaCepUrl}${cepNumerico}/json/`).pipe(
      map((response: ViaCepResponse) => {
        if (response.erro) {
          // Se o ViaCEP retornar { erro: true }, o CEP é válido no formato mas não existe
          console.warn(`CEP ${cepNumerico} não encontrado na base do ViaCEP.`);
          return null;
        }
        return response; // Retorna os dados do endereço
      }),
      catchError(error => {
        // Captura erros da requisição HTTP (ex: 400 Bad Request para CEPs com formato inválido que passaram pelo filtro inicial, 404, 500, etc.)
        // ou erros de rede.
        console.error('Erro na requisição HTTP ao ViaCEP:', error);
        return of(null); // Retorna null para indicar falha na busca
      })
    );
  }
}