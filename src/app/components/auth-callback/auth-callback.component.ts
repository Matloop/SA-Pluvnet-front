// src/app/pages/auth-callback/auth-callback.component.ts (Exemplo de caminho)

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Ajuste o caminho

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [RouterModule], // Necessário se usar routerLink no template (opcional)
  template: `
    <div class="callback-container">
      <h2>Processando Login</h2>
      <p>Você será redirecionado em breve...</p>
      <!-- Pode adicionar um spinner visual aqui -->
      @if (errorMessage) {
        <p class="error-message">Erro: {{ errorMessage }}</p>
        <a routerLink="/login">Voltar para Login</a>
      }
    </div>
  `,
  styles: [`
    .callback-container { padding: 40px; text-align: center; }
    .error-message { color: red; margin-top: 15px; }
    a { margin-top: 10px; display: inline-block; }
  `]
})
export class AuthCallbackComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  errorMessage: string | null = null;

  ngOnInit(): void {
    console.log('[AuthCallback] ngOnInit: Componente Ativado.'); // Log A
    this.route.queryParams.subscribe({
      next: (params) => {
        console.log('[AuthCallback] ngOnInit: QueryParams recebidos:', params); // Log B
        const token = params['token'];
        console.log('[AuthCallback] ngOnInit: Token extraído da URL:', token); // Log C
  
        if (token && typeof token === 'string' && token.length > 10) { // Verifica se é uma string razoável
          console.log('[AuthCallback] ngOnInit: Token parece válido, chamando authService.saveToken...'); // Log D
          const saved = this.authService.saveToken(token);
          console.log('[AuthCallback] ngOnInit: Resultado de authService.saveToken ->', saved); // Log E
  
          if (saved) {
            console.log('[AuthCallback] ngOnInit: Token salvo com sucesso! Navegando para /user...'); // Log F
            // Use replaceUrl para evitar que o usuário volte para esta página de callback
            this.router.navigate(['/user'], { replaceUrl: true });
          } else {
            console.error('[AuthCallback] ngOnInit: authService.saveToken retornou false.'); // Log G
            this.handleError('Falha ao processar o token de autenticação.');
          }
        } else {
          console.error('[AuthCallback] ngOnInit: Token inválido ou não encontrado na URL.'); // Log H
          this.handleError('Nenhum token de autenticação válido encontrado na resposta.');
        }
      },
      error: (err) => {
        console.error("[AuthCallback] ngOnInit: Erro ao processar queryParams", err); // Log I
        this.handleError('Ocorreu um erro ao processar a resposta de autenticação.');
      }
   });
  }

  private handleError(message: string): void {
      this.errorMessage = message;
      // Não redireciona automaticamente em caso de erro, mostra a mensagem.
      // Opcionalmente, poderia redirecionar para /login após um tempo.
  }

  
}