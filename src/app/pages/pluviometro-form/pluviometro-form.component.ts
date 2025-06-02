import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PluviometroElement } from '../owner/owner.component'; // Adjust path if necessary

export interface PluviometroFormData {
  pluviometro?: PluviometroElement; // Optional: for editing
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
export class PluviometroFormComponent implements OnInit {
  pluviometroForm: FormGroup;
  isEditMode: boolean;
  dialogTitle: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PluviometroFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PluviometroFormData
  ) {
    this.isEditMode = data.isEditMode;
    this.dialogTitle = this.isEditMode ? 'Editar Pluviômetro' : 'Adicionar Novo Pluviômetro';

    // Initialize the form
    this.pluviometroForm = this.fb.group({
      proprietarioNome: [data.pluviometro?.proprietarioNome || '', Validators.required],
      email: [data.pluviometro?.email || '', [Validators.required, Validators.email]],
      descricao: [data.pluviometro?.descricao || '', Validators.required],
      localizacao: [data.pluviometro?.localizacao || '', Validators.required],
      cidade: [data.pluviometro?.cidade || '', Validators.required],
      bairro: [data.pluviometro?.bairro || '', Validators.required],
      rua: [data.pluviometro?.rua || '', Validators.required],
      numero: [data.pluviometro?.numero || '', Validators.required],
      complemento: [data.pluviometro?.complemento || ''],
      // Add proprietarioAvatarUrl if you intend to allow setting/changing it in the form
    });
  }

  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.pluviometroForm.valid) {
      // For a real app, you might want to merge with existing ID if editing
      const formData = this.pluviometroForm.value;
      let resultData: Partial<PluviometroElement> = {
        ...formData,
      };
      if (this.isEditMode && this.data.pluviometro) {
        resultData.id = this.data.pluviometro.id; // Keep original ID
        resultData.proprietarioAvatarUrl = this.data.pluviometro.proprietarioAvatarUrl; // Keep original avatar for simplicity
        resultData.localizacaoIcon = this.data.pluviometro.localizacaoIcon;
      } else {
        // For new items, you might generate an ID on the backend
        // or assign a temporary one here if needed before backend sync
        resultData.id = Date.now(); // Example temporary ID
        resultData.localizacaoIcon = 'map'; // Default icon
      }
      this.dialogRef.close(resultData);
    } else {
      this.pluviometroForm.markAllAsTouched(); // Show validation errors
    }
  }
}