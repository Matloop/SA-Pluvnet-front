import { Component, Inject, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ViaCepResponse, ViaCepService } from '../../services/via-cep.service';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, tap, catchError } from 'rxjs/operators';
import { PluviometroElement } from '../owner/owner.component';

// This is the data structure the form RETURNS. It no longer contains an ownerId.
export interface PluviometroFormResult {
  description: string;
  cep: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento?: string;
}

// This is the data PASSED TO the form.
export interface PluviometroFormData {
  pluviometro?: PluviometroElement; // PluviometroElement is defined in owner.component.ts
  isEditMode: boolean;
}

@Component({
  selector: 'app-pluviometro-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule
    // MatSelectModule is no longer needed here
  ],
  templateUrl: './pluviometro-form.component.html',
  styleUrls: ['./pluviometro-form.component.scss']
})
export class PluviometroFormComponent implements OnInit, OnDestroy {
  pluviometroForm: FormGroup;
  isEditMode: boolean;
  dialogTitle: string;
  private destroy$ = new Subject<void>();

  private fb = inject(FormBuilder);
  private viaCepService = inject(ViaCepService);

  constructor(
    public dialogRef: MatDialogRef<PluviometroFormComponent, PluviometroFormResult>,
    @Inject(MAT_DIALOG_DATA) public data: PluviometroFormData
  ) {
    this.isEditMode = data.isEditMode;
    this.dialogTitle = this.isEditMode ? 'Editar Pluviômetro' : 'Adicionar Novo Pluviômetro';

    // The form is now simpler and does not include an ownerId field.
    this.pluviometroForm = this.fb.group({
      description: [data.pluviometro?.descricao || '', Validators.required],
      cep: [data.pluviometro?.cep || '', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      cidade: [{ value: data.pluviometro?.cidade || '', disabled: true }, Validators.required],
      bairro: [{ value: data.pluviometro?.bairro || '', disabled: true }, Validators.required],
      rua: [{ value: data.pluviometro?.rua || '', disabled: true }, Validators.required],
      numero: [data.pluviometro?.numero || '', Validators.required],
      complemento: [data.pluviometro?.complemento || ''],
    });
  }

  ngOnInit(): void {
    this.setupCepLookup();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupCepLookup(): void {
    const cepControl: AbstractControl | null = this.pluviometroForm.get('cep');
    if (cepControl) {
      cepControl.valueChanges.pipe(
        takeUntil(this.destroy$),
        debounceTime(700),
        distinctUntilChanged(),
        filter((cepInput: string) => !!(cepInput && cepInput.replace(/\D/g, '').length === 8)),
        switchMap((cepInput: string) => this.viaCepService.buscarCep(cepInput.replace(/\D/g, ''))),
        tap((addressData: ViaCepResponse | null) => {
          if (addressData && !addressData.erro) {
            this.fillAddressFields(addressData);
            cepControl.setErrors(null);
          } else {
            this.clearAddressFields(true);
            cepControl.setErrors({ cepNaoEncontrado: true });
          }
        }),
        catchError(error => {
          console.error("Erro no fluxo de busca de CEP:", error);
          cepControl.setErrors({ cepConsultaFalhou: true });
          return of(null);
        })
      ).subscribe();
    }
  }

  fillAddressFields(data: ViaCepResponse): void {
    this.pluviometroForm.patchValue({
      cidade: data.localidade,
      bairro: data.bairro,
      rua: data.logradouro,
    });
  }

  clearAddressFields(resetAndDisable: boolean = true): void {
    this.pluviometroForm.patchValue({ cidade: '', bairro: '', rua: '' });
    if (resetAndDisable) {
        this.pluviometroForm.get('cidade')?.disable();
        this.pluviometroForm.get('bairro')?.disable();
        this.pluviometroForm.get('rua')?.disable();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.pluviometroForm.valid) {
      const result: PluviometroFormResult = this.pluviometroForm.getRawValue();
      this.dialogRef.close(result);
    } else {
      this.pluviometroForm.markAllAsTouched();
    }
  }
}