// src/app/pages/pluviometro-form/pluviometro-form.component.ts
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ViaCepResponse, ViaCepService } from '../../services/via-cep.service';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, tap, catchError } from 'rxjs/operators';

// --- DEFINE OR IMPORT THE INTERFACE HERE ---
// This interface should be identical to the one in owner.component.ts
export interface PluviometroElement {
  id: number;
  proprietarioNome: string;
  email: string;
  descricao: string;
  cep: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento?: string;
  localizacaoIcon: string;
  // --- ADD THE MISSING PROPERTY ---
  proprietarioAvatarUrl?: string; 
}


export interface PluviometroFormData {
  pluviometro?: PluviometroElement;
  isEditMode: boolean;
}

// This interface defines the data that the form returns.
// It's a good practice to separate the form's output from the full element.
export interface PluviometroFormResult {
  proprietarioNome: string;
  email: string;
  descricao: string;
  cep: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento?: string;
}

@Component({
  selector: 'app-pluviometro-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule
  ],
  templateUrl: './pluviometro-form.component.html',
  styleUrls: ['./pluviometro-form.component.scss']
})
export class PluviometroFormComponent implements OnInit, OnDestroy {
  pluviometroForm: FormGroup;
  isEditMode: boolean;
  dialogTitle: string;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PluviometroFormComponent, PluviometroFormResult>, // <-- Note the return type
    @Inject(MAT_DIALOG_DATA) public data: PluviometroFormData,
    private viaCepService: ViaCepService
  ) {
    this.isEditMode = data.isEditMode;
    this.dialogTitle = this.isEditMode ? 'Editar Pluviômetro' : 'Adicionar Novo Pluviômetro';

    this.pluviometroForm = this.fb.group({
      proprietarioNome: [data.pluviometro?.proprietarioNome || '', Validators.required],
      email: [data.pluviometro?.email || '', [Validators.required, Validators.email]],
      descricao: [data.pluviometro?.descricao || '', Validators.required],
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

    if (this.isEditMode && this.data.pluviometro) {
      if (this.data.pluviometro.cep) {
        this.pluviometroForm.get('cep')?.setValue(this.data.pluviometro.cep);
      }
      if (this.data.pluviometro.cidade) this.pluviometroForm.get('cidade')?.enable();
      if (this.data.pluviometro.bairro) this.pluviometroForm.get('bairro')?.enable();
      if (this.data.pluviometro.rua) this.pluviometroForm.get('rua')?.enable();
    }
  }

  private setupCepLookup(): void {
    const cepControl: AbstractControl | null = this.pluviometroForm.get('cep');
    if (cepControl) {
      cepControl.valueChanges.pipe(
        takeUntil(this.destroy$),
        debounceTime(700),
        distinctUntilChanged(),
        filter((cepInput: string) => !!(cepInput && cepInput.replace(/\D/g, '').length === 8)),
        switchMap((cepInput: string) => {
          this.clearAddressFields(false);
          return this.viaCepService.buscarCep(cepInput.replace(/\D/g, ''));
        }),
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.pluviometroForm.valid) {
      // Return only the raw form values. The parent component will handle adding IDs.
      const result: PluviometroFormResult = this.pluviometroForm.getRawValue();
      this.dialogRef.close(result);
    } else {
      this.pluviometroForm.markAllAsTouched();
    }
  }
}