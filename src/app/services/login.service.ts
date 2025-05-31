import { HttpClient, HttpHeaders } from '@angular/common/http'; // Adicione HttpHeaders se precisar explicitamente, embora para JSON simples muitas vezes não seja necessário
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs'; // Adicione Observable
import { LoginResponse } from '../types/login-response.type'; // Certifique-se que este tipo existe e está correto

// UserRole como string, para corresponder ao FormControl e ao que o backend espera no JSON
type UserRoleString = "USER" | "OWNER";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl: string = "http://localhost:8080/auth"; // Tornar private é uma boa prática

  constructor(private httpClient: HttpClient) {
  }

  login(email: string, password: string): Observable<LoginResponse> { // Adicione o tipo de retorno Observable
    return this.httpClient.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => { // Renomeado para 'response' para clareza
        // É mais seguro verificar se 'response' e 'response.token' / 'response.name' existem
        if (response && response.token && response.name) {
          sessionStorage.setItem("auth-token", response.token);
          sessionStorage.setItem("username", response.name);
          // Considere também armazenar a 'role' se ela vier na LoginResponse e for útil
          // if (response.role) { sessionStorage.setItem("user-role", response.role); }
        } else {
          console.error("Login response or token/name is missing:", response);
        }
      })
    );
  }

  signup(
    name: string,
    email: string,
    passwordCmd: string, // Renomeado para evitar sombreamento se 'password' fosse propriedade do objeto
    userRole: UserRoleString | null, // NOVO: Recebe o tipo de usuário como string
    cpf: string | null               // NOVO: Recebe o CPF
  ): Observable<LoginResponse> { // O signup também pode retornar LoginResponse para consistência (token + nome)
    const body = {
      name,
      email,
      password: passwordCmd, // O backend espera 'password' no corpo
      userRole,           // NOVO: Enviando userRole
      cpf                 // NOVO: Enviando cpf
    };

    console.log("LoginService - Enviando para /register:", body); // LOG CRUCIAL PARA DEPURAÇÃO!

    // Não precisa de HttpHeaders explícito se o backend aceita application/json por padrão para objetos
    return this.httpClient.post<LoginResponse>(`${this.apiUrl}/register`, body).pipe(
      tap((response) => {
        // Após o cadastro bem-sucedido, o usuário é normalmente redirecionado para o login
        // ou, se o backend já retornar um token aqui (como parece ser o caso), você pode logá-lo.
        // A lógica de redirecionamento para /login já está no SignUpComponent.
        if (response && response.token && response.name) {
          console.log("Signup successful, token received (but typically user logs in separately):", response.token);
          // Não é comum armazenar o token no sessionStorage diretamente do signup,
          // geralmente o usuário é redirecionado para login para obter um token "fresco" de login.
          // Mas se seu backend já retorna um token válido no signup e você quer usá-lo, pode manter.
          // sessionStorage.setItem("auth-token", response.token);
          // sessionStorage.setItem("username", response.name);
        } else {
          console.warn("Signup response or token/name is missing, or user will login next:", response);
        }
      })
    );
  }
}