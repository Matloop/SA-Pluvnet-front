import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';

export function cpfFormatValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value: string = control.value;

    if (value === null || value === undefined || value.trim() === '') {
      return null;
    }

    const numericValue = value.replace(/\D/g, '');
    const formattedCpfRegex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;

    if (formattedCpfRegex.test(value)) {
      return null;
    }

    if (numericValue.length === 11) {
      return null;
    }

    return { 'cpfFormat': { value: value } };
  };
}