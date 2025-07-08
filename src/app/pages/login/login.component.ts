import { Component } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

// 1. IMPORT THE AUTH SERVICE
import { AuthService } from '../../services/auth.service';

interface LoginForm{
  email : FormControl<string | null>,
  password : FormControl<string | null>
}

// Interface for the expected login response from your backend
interface LoginResponse {
  token: string;
  // you might also have other fields like 'name', etc.
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    PrimaryInputComponent,
  ],
  providers: [
    LoginService
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup<LoginForm>;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private toastr: ToastrService,
    // 2. INJECT THE AUTH SERVICE INTO THE CONSTRUCTOR
    private authService: AuthService
  ){
    this.loginForm = new FormGroup<LoginForm>({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  submit(){
    if (this.loginForm.invalid) {
      this.toastr.error("Por favor, preencha todos os campos corretamente.");
      return;
    }
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    if (email && password) {
      // 3. UPDATE THE SUBSCRIBE BLOCK
      this.loginService.login(email, password).subscribe({
        // The 'response' object (containing the token) is passed to 'next'
        next: (response: LoginResponse) =>  {
          // 4. SAVE THE TOKEN USING THE AUTH SERVICE AND CHECK IF IT WAS SUCCESSFUL
          const wasTokenSaved = this.authService.saveToken(response.token);

          if (wasTokenSaved) {
            // 5. ONLY NAVIGATE *AFTER* THE TOKEN IS SAVED
            this.toastr.success("Login feito com sucesso!");

            // Optional but recommended: Navigate based on the user's role
            const userRole = this.authService.currentUser()?.business_role;
            if (userRole === 'OWNER') {
              this.router.navigate(['/owner']);
            } else {
              this.router.navigate(['/user']); // Default page for other roles
            }

          } else {
            // This happens if the token from the backend is malformed or expired
            this.toastr.error("Ocorreu um problema de autenticação. Tente novamente.");
          }
        },
        error: (err) => {
          console.error("Login error:", err);
          if (err.status === 401 || err.status === 403) {
            this.toastr.error("Usuário ou senha inválidos, tente novamente!");
          } else {
            this.toastr.error("Erro inesperado durante o login.");
          }
        }
      });
    } else {
      this.toastr.error("Email ou senha não podem estar vazios.");
    }
  }

  navigate(){
    this.router.navigate(["/signup"]);
  }

  loginWithGoogle(){
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  navigateToForgotPassword() {
    this.toastr.info("Funcionalidade 'Esqueci minha senha' ainda não implementada.");
  }
}