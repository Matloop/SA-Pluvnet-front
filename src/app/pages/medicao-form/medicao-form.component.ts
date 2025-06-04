// src/app/pages/medicao-form/medicao-form.component.ts
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { PluviometroElement } from '../owner/owner.component'; // Assuming PluviometroElement has an 'id' property

// Interfaces
export interface MedicaoFormData {
  medicao?: {
    id?: number;
    valor: number;
    dataHora: Date | string;
  };
  // pluviometroId: number; // OLD: We'll pass the full object instead
  pluviometro: PluviometroElement; // NEW: Expect the full PluviometroElement object
  isEditMode: boolean;
}

export interface MedicaoFormResult {
  id?: number;
  pluviometroId: number; // The ID of the pluviometer
  valor: number;
  dataHora: Date;
  EquipmentId: PluviometroElement; // The Pluviometer object itself
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
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './medicao-form.component.html',
  styleUrls: ['./medicao-form.component.scss'],
  providers: []
})
export class MedicaoFormComponent implements OnInit, OnDestroy {
  medicaoForm: FormGroup;
  isEditMode: boolean;
  dialogTitle: string;
  // pluviometroId: number; // OLD
  pluviometro: PluviometroElement; // NEW: Store the passed PluviometroElement object
  private destroy$ = new Subject<void>();

  get valorMedicao() { return this.medicaoForm.get('valorMedicao'); }
  get dataMedicao() { return this.medicaoForm.get('dataMedicao'); }
  get horaMedicao() { return this.medicaoForm.get('horaMedicao'); }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MedicaoFormComponent, MedicaoFormResult>,
    @Inject(MAT_DIALOG_DATA) public data: MedicaoFormData // data now contains 'pluviometro' object
  ) {
    this.isEditMode = data.isEditMode;
    this.dialogTitle = this.isEditMode ? 'Editar Medição' : 'Adicionar Nova Medição';
    // this.pluviometroId = data.pluviometroId; // OLD
    this.pluviometro = data.pluviometro; // NEW: Store the PluviometroElement

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
      dataMedicao: [initialDate, Validators.required],
      horaMedicao: [initialTime, [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]]
    });
  }

  ngOnInit(): void {}

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

      const datePart: Date = formValue.dataMedicao;
      const timePart: string = formValue.horaMedicao;
      const [hours, minutes] = timePart.split(':').map(Number);

      const combinedDateTime = new Date(
        datePart.getFullYear(),
        datePart.getMonth(),
        datePart.getDate(),
        hours,
        minutes
      );

      // Ensure PluviometroElement has an 'id' property and it's a number, or can be parsed to one.
      let pId: number;
      if (typeof this.pluviometro.id === 'number') {
        pId = this.pluviometro.id;
      } else if (typeof this.pluviometro.id === 'string') {
        pId = parseInt(this.pluviometro.id, 10);
        if (isNaN(pId)) {
          console.error("Error: Pluviometro ID from PluviometroElement is a string and could not be parsed to a number:", this.pluviometro.id);
          // Optionally, handle this error more gracefully (e.g., show a message to the user)
          this.medicaoForm.setErrors({ invalidPluviometroId: true }); // Example of setting form error
          return; // Prevent closing dialog with invalid data
        }
      } else {
        console.error("Error: Pluviometro ID from PluviometroElement is of an unexpected type:", this.pluviometro.id);
        this.medicaoForm.setErrors({ invalidPluviometroId: true });
        return;
      }

      const result: MedicaoFormResult = {
        // pluviometroId: this.pluviometroId, // OLD
        pluviometroId: pId, // NEW: Use the ID from the PluviometroElement object
        valor: parseFloat(formValue.valorMedicao),
        dataHora: combinedDateTime,
        EquipmentId: this.pluviometro // NEW: Assign the actual PluviometroElement object
      };

      if (this.isEditMode && this.data.medicao?.id) {
        result.id = this.data.medicao.id;
      }

      this.dialogRef.close(result);
    } else {
      this.medicaoForm.markAllAsTouched();
    }
  }
}