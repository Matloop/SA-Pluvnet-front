// src/app/pages/medicao-form/medicao-form.component.ts
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core'; // MAT_DATE_LOCALE para pt-BR
import { MatIconModule } from '@angular/material/icon'; // Para o ícone do datepicker
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { PluviometroElement } from '../owner/owner.component';

// Interfaces (podem estar em outro arquivo)
export interface MedicaoFormData {
  medicao?: {
    id?: number;
    valor: number;
    dataHora: Date | string;
  };
  pluviometroId: number;
  isEditMode: boolean;
}

export interface MedicaoFormResult {
  id?: number;
  pluviometroId: number;
  valor: number;
  dataHora: Date
  EquipmentId: PluviometroElement
}


@Component({
  selector: 'app-medicao-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule, // Essencial para o MatDatepicker funcionar com objetos Date nativos
    MatIconModule
  ],
  templateUrl: './medicao-form.component.html',
  styleUrls: ['./medicao-form.component.scss'],
  providers: [
    // Opcional: se quiser forçar o locale do datepicker para pt-BR
    // { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ]
})
export class MedicaoFormComponent implements OnInit, OnDestroy {
  medicaoForm: FormGroup;
  isEditMode: boolean;
  dialogTitle: string;
  pluviometroId: number;
  private destroy$ = new Subject<void>();

  // Para facilitar o acesso aos controles no template
  get valorMedicao() { return this.medicaoForm.get('valorMedicao'); }
  get dataMedicao() { return this.medicaoForm.get('dataMedicao'); }
  get horaMedicao() { return this.medicaoForm.get('horaMedicao'); }


  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MedicaoFormComponent, MedicaoFormResult>, // Especifica o tipo de resultado
    @Inject(MAT_DIALOG_DATA) public data: MedicaoFormData
  ) {
    this.isEditMode = data.isEditMode;
    this.dialogTitle = this.isEditMode ? 'Editar Medição' : 'Adicionar Nova Medição';
    this.pluviometroId = data.pluviometroId;

    let initialDate = new Date();
    let initialTime = `${String(initialDate.getHours()).padStart(2, '0')}:${String(initialDate.getMinutes()).padStart(2, '0')}`;
    let initialValor: number | null = null;

    if (this.isEditMode && data.medicao) {
      const medicaoDataHora = typeof data.medicao.dataHora === 'string'
        ? new Date(data.medicao.dataHora)
        : data.medicao.dataHora;

      initialDate = medicaoDataHora;
      initialTime = `${String(medicaoDataHora.getHours()).padStart(2, '0')}:${String(medicaoDataHora.getMinutes()).padStart(2, '0')}`;
      initialValor = data.medicao.valor;
    }

    this.medicaoForm = this.fb.group({
      valorMedicao: [initialValor, [Validators.required, Validators.min(0)]],
      dataMedicao: [initialDate, Validators.required], // Campo para a data
      horaMedicao: [initialTime, [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]] // Campo para a hora "HH:mm"
    });
  }

  ngOnInit(): void {
    // Lógica de inicialização se necessário
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.medicaoForm.valid) {
      const formValue = this.medicaoForm.getRawValue();

      // Combinar data e hora em um único objeto Date
      const datePart: Date = formValue.dataMedicao;
      const timePart: string = formValue.horaMedicao; // Formato "HH:mm"

      const [hours, minutes] = timePart.split(':').map(Number);

      const combinedDateTime = new Date(
        datePart.getFullYear(),
        datePart.getMonth(),
        datePart.getDate(),
        hours,
        minutes
      );

      const result: MedicaoFormResult = {
        pluviometroId: this.pluviometroId,
        valor: parseFloat(formValue.valorMedicao),
        dataHora: combinedDateTime,
        EquipmentId: undefined
      };

      if (this.isEditMode && this.data.medicao?.id) {
        result.id = this.data.medicao.id;
      } else if (!this.isEditMode) {
        // Poderia gerar um ID temporário ou deixar para o backend
        // result.id = Date.now(); // Exemplo de ID temporário client-side
      }

      this.dialogRef.close(result);
    } else {
      this.medicaoForm.markAllAsTouched();
    }
  }
}