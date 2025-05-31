import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

type InputTypes = "text" | "email" | "password";

@Component({
  selector: 'app-primary-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
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
  @Input() type: InputTypes = "text";
  @Input() placeholder: string = "";
  @Input() label : string = "";
  @Input() inputName : string = "";

  // Ensure these paths are correct for your project structure
  @Input() openEyeIcon: string = "assets/svg/open-eye.svg";
  @Input() closeEyeIcon: string = "assets/svg/closed-eye.svg";

  value: string = '';
  showPassword = false;

  // ControlValueAccessor methods
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // You can implement this if you need to disable the input programmatically
  }

  onInput(event: Event){
    const value = (event.target as HTMLInputElement).value;
    this.value = value; // Keep internal value in sync for display
    this.onChange(value);
    this.onTouched();
  }

  changeShowPassword(){
    this.showPassword = !this.showPassword;
  }
}