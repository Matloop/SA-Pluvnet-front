// pages/signup/signup.component.ts
import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

// UserRole como string, para corresponder ao enum do backend ao enviar
type UserRoleString = "USER" | "OWNER"; // Poderia ser "ADMIN" também se permitido

interface SignupForm {
  name: FormControl<string | null>;
  email: FormControl<string | null>;
  userRole: FormControl<UserRoleString | null>; // MUDANÇA: de isOwner para userRole (string)
  cpf: FormControl<string | null>;
  password: FormControl<string | null>;
  passwordConfirm: FormControl<string | null>;
}
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    PrimaryInputComponent,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignUpComponent implements OnInit, AfterViewInit {
  signupForm: FormGroup<SignupForm>;

  constructor(
    private router : Router,
    private loginService : LoginService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ){
    console.time("SignUp CONSTRUCTOR");
    this.signupForm = new FormGroup<SignupForm>({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      userRole: new FormControl('USER', [Validators.required]), // MUDANÇA: Campo userRole, default 'USER'
      cpf: new FormControl('', [Validators.required /*, validador de CPF */]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordConfirm: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
    console.timeEnd("SignUp CONSTRUCTOR");
  }

  ngOnInit(): void {
    console.time("SignUp ONINIT");
    console.timeEnd("SignUp ONINIT");
  }

  ngAfterViewInit(): void {
    console.log("SignUp ngAfterViewInit - Agendando detecção de mudanças");
    setTimeout(() => {
      console.log("SignUp ngAfterViewInit - EXECUTANDO detecção de mudanças via setTimeout");
      this.cdr.detectChanges();
    }, 0);
  }

  submit(){
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.toastr.error("Por favor, preencha todos os campos obrigatórios corretamente.");
      return;
    }

    if (this.signupForm.value.password !== this.signupForm.value.passwordConfirm) {
      this.toastr.error("As senhas não coincidem.");
      this.signupForm.controls.passwordConfirm.setErrors({'mismatch': true});
      return;
    }

    // Extrai todos os valores do formulário
    const { name, email, password, userRole, cpf } = this.signupForm.value; // MUDANÇA: userRole em vez de isOwner

    if (name && email && password && cpf && userRole ) { // Verifica userRole
      // A chamada ao serviço será modificada para enviar userRole
      this.loginService.signup(name, email, password, userRole, cpf).subscribe({
        next: () =>  {
          this.toastr.success("Cadastro realizado com sucesso! Faça login para continuar.");
          this.router.navigate(["/login"]);
        },
        error: (err) => {
          console.error("Signup error:", err);
          let errorMessage = "Erro inesperado durante o cadastro.";
          if (err.error && typeof err.error === 'string') {
              errorMessage = err.error;
          } else if (err.status === 409) {
            errorMessage = "Este email já está cadastrado.";
          } else if (err.status === 400) {
            errorMessage = "Dados inválidos. Verifique os campos preenchidos.";
          }
          this.toastr.error(errorMessage);
        }
      });
    } else {
        this.toastr.error("Um ou mais campos obrigatórios não foram preenchidos ou são inválidos.");
    }
  }

  navigate(){
    this.router.navigate(["/login"]);
  }
}