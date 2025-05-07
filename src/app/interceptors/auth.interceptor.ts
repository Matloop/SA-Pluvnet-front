// src/app/core/interceptors/auth.interceptor.ts (Exemplo de caminho)

import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Ajuste o caminho

// TODO: Defina a URL base da sua API! As requisições só terão token se começarem com isso.
const API_BASE_URL = 'http://localhost:8080'; // Exemplo, ajuste!

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const authService = inject(AuthService);
  const token = authService.getToken(); // Pega o token do serviço

  // Verifica se a requisição é para a sua API e se existe um token
  if (token && req.url.startsWith(API_BASE_URL)) {
    // Clona a requisição para adicionar o cabeçalho de forma imutável
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Define o cabeçalho Bearer Token
      }
    });
    // console.log(`AuthInterceptor: Adicionando token à requisição para ${req.url}`);
    return next(authReq); // Envia a requisição clonada
  } else {
    // Se não for para a API ou não houver token, envia a requisição original
    return next(req);
  }
};