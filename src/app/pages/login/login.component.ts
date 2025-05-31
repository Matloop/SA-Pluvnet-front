import { Component } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service'; // Assuming you have this service
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common'; // For *ngIf if needed

interface LoginForm{
  email : FormControl<string | null>, // It's good practice to type FormControl values
  password : FormControl<string | null>
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
    LoginService // Provide service here or at a higher level
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup<LoginForm>;

  constructor(
    private router : Router,
    private loginService : LoginService,
    private toastr: ToastrService // Renamed for clarity
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

    if (email && password) { // Ensure values are not null before sending
      this.loginService.login(email, password).subscribe({
        next: () =>  {
          this.toastr.success("Login feito com sucesso!");
          this.router.navigate(["/user"]); // Or navigateByUrl if needed
        },
        error: (err) => { // It's good to inspect the error
          console.error("Login error:", err);
          // Example: Check for specific error message for wrong credentials
          if (err.status === 401 || err.status === 403) {
             // This is where you'd trigger the red banner if you had a custom component for it
             // For now, a toastr message:
            this.toastr.error("Usuário ou senha errados, tente novamente!");
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

  // This method is no longer called by the template but kept as per "no logic change"
  loginWithGoogle(){
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  navigateToForgotPassword() {
    // Implement navigation if you have a forgot password page
    this.toastr.info("Funcionalidade 'Esqueci minha senha' ainda não implementada.");
    // this.router.navigate(['/forgot-password']);
  }
}