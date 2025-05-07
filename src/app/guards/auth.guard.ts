// src/app/core/guards/auth.guard.ts (Exemplo de caminho)

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Ajuste o caminho

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) { // Usa o sinal computado do AuthService
    return true; // Acesso permitido
  } else {
    // Não autenticado, redireciona para a página de login
    console.warn('AuthGuard: Acesso negado à rota:', state.url, '- Redirecionando para /login');
    router.navigate(['/login'], {
      // Guarda a URL que o usuário tentou acessar para redirecioná-lo após o login
      queryParams: { returnUrl: state.url }
    });
    return false; // Bloqueia o acesso à rota atual
  }
};