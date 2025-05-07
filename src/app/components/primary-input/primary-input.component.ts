import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from "../../pages/login/login.component";
import { CommonModule } from '@angular/common';

type InputTypes = "text" | "email" | "password"
@Component({
  selector: 'app-primary-input',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule],
  providers:[
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PrimaryInputComponent),
      multi: true
    }
  ],
  templateUrl: './primary-input.component.html',
  styleUrl: './primary-input.component.scss'
})
export class PrimaryInputComponent implements ControlValueAccessor {
  writeValue(obj: any): void {
    this.value = obj;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  showPassword = false;  
  @Input() type: InputTypes = "text";
  @Input() placeholder: string = "";
  @Input() label : string = "oi";
  @Input() inputName : string = "";
  openEyeIcon: string = "assets/svg/open-eye.svg";
  closeEyeIcon: string = "assets/svg/closed-eye.svg";

  value: string = ''
  onChange: any = () => {}
  onTouched: any = () => {}

  onInput(event: Event){
    const value = (event.target as HTMLInputElement).value
    this.onChange(value)
  }

  registerOnChange(fn: any): void {
      this.onChange = fn;
  }

  setDisabledState(isDisabled: boolean): void {
  }
  get eyeIconClass(): string {
    let eyePath: string = "assets/svg/close-eye.svg";
    return this.showPassword ? eyePath + 'open-eye.svg' : eyePath + 'closed-eye.svg';
  }

  changeShowPassword(){
    this.showPassword = !this.showPassword
  }
}
