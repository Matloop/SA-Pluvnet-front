// src/app/core/services/auth.service.ts (Exemplo de caminho)

import { Injectable, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";

// --- Configuração ---
const TOKEN_STORAGE_KEY = 'auth-token'; // Chave para o storage
const USE_SESSION_STORAGE = true; // Mude para true se preferir sessionStorage

// Interface para os dados esperados do payload do JWT (Ajuste!)
interface UserInfo {
  sub: string; // Subject (geralmente email ou user ID)
  name?: string; // Nome (se houver)
  roles?: string[]; // Roles/Permissões (se houver)
  exp?: number; // Timestamp de expiração (padrão JWT)
  // Adicione outras claims que seu backend envia
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private storage = USE_SESSION_STORAGE ? sessionStorage : localStorage;

  // --- Estado Reativo ---
  // Sinal privado para o token bruto
  private readonly tokenSignal = signal<string | null>(this.storage.getItem(TOKEN_STORAGE_KEY));

  // Sinal público computado para saber se está logado (baseado na existência e validade do token)
  public readonly isLoggedIn = computed<boolean>(() => {
    const token = this.tokenSignal();
    if (!token) return false;
    return !this.isTokenExpired(token); // Verifica expiração
  });

  // Sinal público computado para informações do usuário (decodificadas do token)
  public readonly currentUser = computed<UserInfo | null>(() => {
    const token = this.tokenSignal();
    if (!token || !this.isLoggedIn()) return null; // Retorna null se não logado ou token inválido
    return this.decodeToken(token);
  });

  // --- Métodos Públicos ---

  /**
   * Salva o token JWT recebido, atualizando o estado.
   * @param token O token JWT da sua aplicação.
   * @returns true se o token foi salvo com sucesso, false caso contrário.
   */
  saveToken(token: string): boolean {
    if (!token) {
      console.error("AuthService: Tentativa de salvar token nulo ou vazio.");
      return false;
    }
    // Tenta decodificar para validar minimamente antes de salvar
    const decoded = this.decodeToken(token);
    if (!decoded || this.isTokenExpired(token, decoded)) {
      console.error("AuthService: Token inválido ou expirado recebido, não foi salvo.");
      this.clearTokenData(); // Limpa qualquer estado antigo
      return false;
    }

    try {
      this.storage.setItem(TOKEN_STORAGE_KEY, token);
      this.tokenSignal.set(token); // Atualiza o sinal
      console.log("AuthService: Token salvo com sucesso.");
      return true;
    } catch (error) {
      console.error("AuthService: Erro ao salvar token no storage.", error);
      this.clearTokenData();
      return false;
    }
  }

  /**
   * Retorna o token JWT bruto armazenado. Use com cuidado fora deste serviço.
   */
  getToken(): string | null {
    return this.tokenSignal(); // Lê diretamente do sinal
  }

  /**
   * Remove o token e limpa o estado de autenticação.
   */
  logout(): void {
    this.clearTokenData();
    console.log("AuthService: Logout realizado.");
    this.router.navigate(['/login']); // Redireciona para a página de login
  }

  // --- Métodos Auxiliares Privados ---

  /** Limpa o token do storage e reseta o sinal */
  private clearTokenData(): void {
    try {
      this.storage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
       console.error("AuthService: Erro ao remover token do storage.", error);
    }
    this.tokenSignal.set(null); // Reseta o sinal
  }

  /** Decodifica o token JWT */
  private decodeToken(token: string | null): UserInfo | null {
    if (!token) return null;
    try {
      return jwtDecode<UserInfo>(token);
    } catch (error) {
      console.error("AuthService: Falha ao decodificar token.", error);
      return null;
    }
  }

  /** Verifica se o token está expirado */
  private isTokenExpired(token: string | null, decoded?: UserInfo | null ): boolean {
    if (!token) return true; // Se não há token, considera expirado
    const user = decoded ?? this.decodeToken(token); // Decodifica se não foi passado
    if (!user?.exp) return false; // Se não tem 'exp', não podemos verificar (assume válido)

    const expirationDate = new Date(0); // O ponto zero (epoch)
    expirationDate.setUTCSeconds(user.exp); // Define a data com base no timestamp 'exp'
    const isExpired = expirationDate.valueOf() <= new Date().valueOf(); // Compara com a data/hora atual

    if (isExpired) {
        console.warn("AuthService: Token expirado detectado.");
        // Opcional: Limpar automaticamente o token expirado
        // this.clearTokenData();
    }
    return isExpired;
  }
}