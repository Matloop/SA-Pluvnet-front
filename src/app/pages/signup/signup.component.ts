// pages/signup/signup.component.ts
import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

type UserRoleString = "USER" | "OWNER";

interface SignupForm {
  name: FormControl<string | null>;
  email: FormControl<string | null>;
  userRole: FormControl<UserRoleString | null>;
  cpf: FormControl<string | null>;
  password: FormControl<string | null>;
  passwordConfirm: FormControl<string | null>;
}

// Validador síncrono para formato básico do CPF (11 dígitos numéricos)
export function cpfBasicFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;
    if (!value) { return null; }
    const numericValue = value.replace(/\D/g, '');
    return numericValue.length === 11 ? null : { 'cpfBasicFormat': true };
  };
}

// Validador cross-field para confirmação de senha
export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const passwordControl = group.get('password');
  const passwordConfirmControl = group.get('passwordConfirm');

  if (!passwordControl || !passwordConfirmControl) { return null; }

  // Limpa o erro 'mismatch' se ele existir e as condições para erro não são mais atendidas
  // Isso é importante para quando o usuário corrige a senha
  if (passwordConfirmControl.hasError('mismatch') &&
      (!passwordConfirmControl.value || passwordControl.value === passwordConfirmControl.value)) {
    const errors = { ...passwordConfirmControl.errors };
    delete errors['mismatch']; // CORRIGIDO: Acesso com colchetes
    passwordConfirmControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
  }

  if (passwordConfirmControl.value && passwordControl.value !== passwordConfirmControl.value) {
    passwordConfirmControl.setErrors({ ...passwordConfirmControl.errors, 'mismatch': true });
    return { 'passwordsMismatch': true }; // Invalida o FormGroup
  }
  // Se as senhas coincidem ou um dos campos está vazio (após a limpeza acima),
  // e o erro 'mismatch' foi tratado, o FormGroup não é invalidado por este validador.
  return null;
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

  private apiToken = '5ae973d7a997af13f0aaf2bf60e65803';
  private pacoteId = 1;
  private apiUrl = 'https://api.cpfcnpj.com.br';

  constructor(
    private router : Router,
    private loginService : LoginService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ){
    this.signupForm = new FormGroup<SignupForm>({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      userRole: new FormControl<UserRoleString | null>('USER', [Validators.required]),
      cpf: new FormControl('', {
        validators: [Validators.required, cpfBasicFormatValidator()],
        asyncValidators: [this.validateCpfApi.bind(this)],
        updateOn: 'blur'
      }),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordConfirm: new FormControl('', [Validators.required, Validators.minLength(6)])
    }, {
         validators: [passwordMatchValidator]
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  validateCpfApi(control: AbstractControl): Observable<ValidationErrors | null> {
    const value: string = control.value;
    let currentErrors = control.errors ? { ...control.errors } : {};

    // Sempre limpa erros assíncronos anteriores ANTES de uma nova validação ou se não for validar
    delete currentErrors['cpfApiInvalid'];    // CORRIGIDO
    delete currentErrors['cpfApiSystemError']; // CORRIGIDO

    if (!value || value.trim() === '' || control.hasError('required') || control.hasError('cpfBasicFormat')) {
      // Se houver apenas erros síncronos, currentErrors os conterá. Se não, será {}
      // Se currentErrors estiver vazio após deletar os assíncronos, setErrors(null) é chamado.
      control.setErrors(Object.keys(currentErrors).length > 0 ? currentErrors : null);
      return of(null);
    }

    const numericCpf = value.replace(/\D/g, '');
    const requestUrl = `${this.apiUrl}/${this.apiToken}/${this.pacoteId}/${numericCpf}`;

    return this.http.get<any>(requestUrl).pipe(
      map(response => {
        currentErrors = control.errors ? { ...control.errors } : {}; // Pega os erros atuais (incluindo síncronos)
        delete currentErrors['cpfApiInvalid'];    // Limpa para garantir que não haja duplicação
        delete currentErrors['cpfApiSystemError']; // Limpa para garantir que não haja duplicação

        if (response && response.status === 1) {
          control.setErrors(Object.keys(currentErrors).length > 0 ? currentErrors : null);
          return null;
        } else {
          const errorCode = response?.erroCodigo;
          const apiMessage = response?.erro || 'CPF inválido ou não encontrado.';
          if (errorCode === 100 || errorCode === 102 || errorCode === 1005) {
            currentErrors['cpfApiInvalid'] = apiMessage; // CORRIGIDO
          } else {
            currentErrors['cpfApiSystemError'] = apiMessage; // CORRIGIDO
            this.toastr.warning(`API CPF: ${apiMessage}`, 'Aviso Validação');
          }
          control.setErrors(currentErrors);
          // Retorna os erros para que o status do controle seja 'INVALID'
          // Não precisa retornar currentErrors daqui se o setErrors já atualizou o controle.
          // Retornar um objeto de erro aqui faria o validador assíncrono adicionar esse erro ao controle.
          // Já fizemos isso com control.setErrors.
          return currentErrors; // Ou { [Object.keys(currentErrors)[0]]: currentErrors[Object.keys(currentErrors)[0]] } se quiser retornar só o erro da API
        }
      }),
      catchError(error => {
        console.error('Erro HTTP API CPF:', error);
        currentErrors = control.errors ? { ...control.errors } : {}; // Pega os erros atuais
        delete currentErrors['cpfApiInvalid'];
        const httpErrorMessage = 'Falha ao validar CPF. Tente novamente.';
        currentErrors['cpfApiSystemError'] = httpErrorMessage; // CORRIGIDO
        control.setErrors(currentErrors);
        this.toastr.error(httpErrorMessage, 'Erro de Conexão');
        return of(currentErrors); // Retorna os erros para que o status seja 'INVALID'
      })
    );
  }

  submit(){
    this.signupForm.markAllAsTouched();

    if (this.signupForm.invalid || this.signupForm.pending) {
       if (this.signupForm.pending) {
           this.toastr.info("Aguardando validação do CPF...", "Validação em Andamento");
       } else {
           // --- INÍCIO DA MUDANÇA: Logar os erros específicos ---
           console.log("Formulário Inválido. Erros:", this.signupForm.errors);
           Object.keys(this.signupForm.controls).forEach(key => {
             const controlErrors: ValidationErrors | null = this.signupForm.get(key)!.errors;
             if (controlErrors != null) {
               console.log('Campo:', key, 'Erros do Campo:', controlErrors);
             }
           });
           // --- FIM DA MUDANÇA: Logar os erros específicos ---
           this.toastr.error("Por favor, corrija os erros no formulário.", "Formulário Inválido");
       }
      return;
    }

    const formValue = this.signupForm.getRawValue(); // Usa getRawValue para incluir campos desabilitados, se houver
    const { name, email, password, userRole, cpf } = formValue;

    const numericCpfForBackend = cpf ? cpf.replace(/\D/g, '') : null;

    this.loginService.signup(name!, email!, password!, userRole!, numericCpfForBackend!).subscribe({
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
            errorMessage = err.error.message;
            if(err.error.message.includes('email')) {
              const emailControl = this.signupForm.get('email');
              if (emailControl) {
                  emailControl.setErrors({ ...emailControl.errors, 'alreadyExists': true });
                  emailControl.markAsTouched();
              }
            }
            if(err.error.message.includes('cpf')) {
              const cpfControl = this.signupForm.get('cpf');
              if (cpfControl) {
                  cpfControl.setErrors({ ...cpfControl.errors, 'alreadyExists': true });
                  cpfControl.markAsTouched();
              }
            }
            
          } else if (err.status === 400) {
            errorMessage = "Dados inválidos. Verifique os campos preenchidos.";
          }
          this.toastr.error(errorMessage, "Erro no Cadastro");
        }
      });
  }

  navigate(){
    this.router.navigate(["/login"]);
  }
}