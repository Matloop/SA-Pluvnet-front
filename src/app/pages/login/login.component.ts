import { Component, Input } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';

interface LoginForm{
  email : FormControl,
  password : FormControl
}
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [DefaultLoginLayoutComponent,
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
  @Input() showPassword: boolean = false;
  openEyeIcon: string = "../../assets/svg/open-eye.svg";
  closeEyeIcon: string = "../../assets/svg/close-eye.svg";
  
  constructor(private router : Router,
    private loginService : LoginService,
    private toast: ToastrService
  ){
    
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required,Validators.email]),
      password: new FormControl('', [Validators.required,Validators.minLength(6)])
    })
  }

  submit(){
    this.loginService.login(this.loginForm.value.email,this.loginForm.value.password).subscribe({
      next: () =>  {this.toast.success("Login feito com sucesso!");
        this.router.navigate(["/user"]);
        this.router.navigateByUrl('/user', { replaceUrl: true });

        },
      error: () => this.toast.error("Erro inesperado")
    })
  }

  navigate(){
    this.router.navigate(["/signup"])
  }

  loginWithGoogle(){
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  
  
}
