import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate, // Mantenha CanActivate se estiver usando a classe
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // 1. Importe o AuthService (verifique o caminho!)

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate { // Mantenha 'implements CanActivate'

  // 2. Injete o AuthService no construtor
  constructor(
    private router: Router,
    private authService: AuthService // Injete o AuthService aqui
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // 3. Remova a verificação direta do sessionStorage
    // const authToken = sessionStorage.getItem('auth-token'); // Não use mais isso diretamente aqui

    // 4. Use o AuthService para verificar o estado de login
    //    Usamos o sinal computado 'isLoggedIn' do exemplo anterior do AuthService.
    if (this.authService.isLoggedIn()) {
      // Se o AuthService diz que o usuário está logado (tem token válido)
      return true; // Permite o acesso à rota
    } else {
      // Se o AuthService diz que o usuário NÃO está logado
      console.warn('AuthGuard: Acesso negado pela classe AuthGuard. Redirecionando para /login');
      // Redireciona para a página de login, guardando a URL de retorno
      this.router.navigate(['/login'], {
         queryParams: { returnUrl: state.url }
      });
      return false; // Bloqueia o acesso à rota atual
    }
  }
}