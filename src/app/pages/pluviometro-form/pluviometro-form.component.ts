// src/app/pages/pluviometro-form/pluviometro-form.component.ts
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Adicionado AbstractControl
import { PluviometroElement } from '../owner/owner.component'; // Ajuste este caminho se necessário
import { ViaCepResponse, ViaCepService } from '../../services/via-cep.service'; // Ajuste este caminho se necessário
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, tap, catchError } from 'rxjs/operators';

export interface PluviometroFormData {
  pluviometro?: PluviometroElement;
  isEditMode: boolean;
}

@Component({
  selector: 'app-pluviometro-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
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
    public dialogRef: MatDialogRef<PluviometroFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PluviometroFormData,
    private viaCepService: ViaCepService
  ) {
    this.isEditMode = data.isEditMode;
    this.dialogTitle = this.isEditMode ? 'Editar Pluviômetro' : 'Adicionar Novo Pluviômetro';

    this.pluviometroForm = this.fb.group({
      proprietarioNome: [data.pluviometro?.proprietarioNome || '', Validators.required],
      email: [data.pluviometro?.email || '', [Validators.required, Validators.email]],
      descricao: [data.pluviometro?.descricao || '', Validators.required],
      localizacao: [data.pluviometro?.cep || '', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
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
      if (this.data.pluviometro.cep && this.pluviometroForm.get('localizacao')) {
         const cepValue = this.data.pluviometro.cep;
         if (/^\d{8}$/.test(cepValue)) {
            this.pluviometroForm.get('localizacao')?.setValue(`${cepValue.substring(0,5)}-${cepValue.substring(5)}`);
         } else {
            this.pluviometroForm.get('localizacao')?.setValue(cepValue);
         }
      }
      if (this.data.pluviometro.cidade) this.pluviometroForm.get('cidade')?.enable();
      if (this.data.pluviometro.bairro) this.pluviometroForm.get('bairro')?.enable();
      if (this.data.pluviometro.rua) this.pluviometroForm.get('rua')?.enable();
    }
  }

  private setupCepLookup(): void {
    const cepControl: AbstractControl | null = this.pluviometroForm.get('localizacao');
    if (cepControl) {
      cepControl.valueChanges.pipe(
        takeUntil(this.destroy$),
        debounceTime(700),
        distinctUntilChanged(),
        filter((cepInput: string) => {
          if (!cepInput) return false;
          const numericCep = cepInput.toString().replace(/\D/g, '');
          return numericCep.length === 8;
        }),
        switchMap((cepInput: string) => {
          const numericCep = cepInput.toString().replace(/\D/g, '');
          this.clearAddressFields(false);
          return this.viaCepService.buscarCep(numericCep);
        }),
        // =========================================================================
        // AQUI ESTÁ A CORREÇÃO:
        // O tipo de 'addressData' deve ser 'ViaCepResponse | null' para corresponder
        // ao que o serviço pode retornar (os dados do endereço ou nulo).
        // =========================================================================
        tap((addressData: ViaCepResponse | null) => {
          if (addressData) {
            this.fillAddressFields(addressData);
            if (cepControl.hasError('cepNaoEncontrado')) {
              const errors = { ...cepControl.errors };
              delete errors['cepNaoEncontrado'];
              cepControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
            }
          } else {
            this.clearAddressFields(true);
            cepControl.setErrors({ cepNaoEncontrado: true });
          }
        }),
        catchError(error => {
          console.error("Erro crítico no fluxo de busca de CEP:", error);
          this.clearAddressFields(true);
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
    this.pluviometroForm.get('cidade')?.enable();
    this.pluviometroForm.get('bairro')?.enable();
    this.pluviometroForm.get('rua')?.enable();
  }

  clearAddressFields(disableFields: boolean = true): void {
    this.pluviometroForm.patchValue({
      cidade: '',
      bairro: '',
      rua: '',
    });
    if (disableFields) {
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
      const formData = this.pluviometroForm.getRawValue();
      let resultData: Partial<PluviometroElement> = {
        ...formData,
        localizacao: formData.localizacao.toString().replace(/\D/g, ''),
      };
      if (this.isEditMode && this.data.pluviometro) {
        resultData.id = this.data.pluviometro.id;
        resultData.proprietarioAvatarUrl = this.data.pluviometro.proprietarioAvatarUrl;
        resultData.localizacaoIcon = this.data.pluviometro.localizacaoIcon;
      } else {
        resultData.id = Date.now();
        resultData.localizacaoIcon = 'map';
      }
      this.dialogRef.close(resultData);
    } else {
      this.pluviometroForm.markAllAsTouched();
    }
  }
}