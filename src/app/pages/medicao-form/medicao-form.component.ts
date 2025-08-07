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
import { Subject, takeUntil } from 'rxjs';
import { PluviometroElement } from '../owner/owner.component'; // Garanta que este caminho está correto
import { MeasurementService } from '../../services/measurement.service';
import { MeasurementRecordDTO } from '../../models/measurement-record.dto';

// Interface para os dados recebidos pelo diálogo
export interface MedicaoFormData {
  medicao?: MeasurementRecordDTO; // CORRIGIDO: Usar o DTO diretamente para consistência
  pluviometro: PluviometroElement;
  isEditMode: boolean;
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
  // providers: [] é correto, pois o MeasurementService é 'providedIn: root'
})
export class MedicaoFormComponent implements OnInit, OnDestroy {
  medicaoForm: FormGroup;
  isEditMode: boolean;
  dialogTitle: string;
  pluviometro: PluviometroElement;
  private destroy$ = new Subject<void>();

  // Getters para fácil acesso aos controles do formulário no template
  get valorMedicao() { return this.medicaoForm.get('valorMedicao'); }
  get dataMedicao() { return this.medicaoForm.get('dataMedicao'); }
  get horaMedicao() { return this.medicaoForm.get('horaMedicao'); }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MedicaoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MedicaoFormData,
    private measurementService: MeasurementService // Injeção de dependência
  ) {
    this.isEditMode = data.isEditMode;
    this.dialogTitle = this.isEditMode ? 'Editar Medição' : `Adicionar Medição para ${data.pluviometro.descricao}`;
    this.pluviometro = data.pluviometro;

    let initialDate = new Date();
    let initialTime = `${String(initialDate.getHours()).padStart(2, '0')}:${String(initialDate.getMinutes()).padStart(2, '0')}`;
    let initialValor: number | null = null;

    // CORRIGIDO: Lógica para preencher o formulário no modo de edição
    if (this.isEditMode && data.medicao) {
      // O backend retorna a data como uma string no formato ISO 8601, então criamos um objeto Date
      const medicaoDataHora = new Date(data.medicao.measurementDateTime);
      initialDate = medicaoDataHora;
      initialTime = `${String(medicaoDataHora.getHours()).padStart(2, '0')}:${String(medicaoDataHora.getMinutes()).padStart(2, '0')}`;
      // O valor da medição vem como string do backend
      initialValor = parseFloat(data.medicao.measurementValue);
    }

    // Inicialização do formulário reativo
    this.medicaoForm = this.fb.group({
      valorMedicao: [initialValor, [Validators.required, Validators.min(0)]],
      dataMedicao: [initialDate, Validators.required],
      horaMedicao: [initialTime, [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]]
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    // Boas práticas: emite um valor para completar os Observables e evitar memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.medicaoForm.invalid) {
      this.medicaoForm.markAllAsTouched(); // Mostra os erros de validação se o formulário for inválido
      return;
    }

    const formValue = this.medicaoForm.getRawValue();
    const datePart: Date = formValue.dataMedicao;
    const [hours, minutes] = formValue.horaMedicao.split(':').map(Number);

    const combinedDateTime = new Date(
      datePart.getFullYear(),
      datePart.getMonth(),
      datePart.getDate(),
      hours,
      minutes
    );

    // Cria o payload para enviar ao backend, usando os campos esperados pelo DTO
    const measurementPayload: Partial<MeasurementRecordDTO> = {
      measurementDateTime: combinedDateTime.toISOString(), // Formato padrão entendido pelo Spring Boot
      measurementValue: formValue.valorMedicao.toString(),
      equipmentID: this.pluviometro.id as number
    };

    if (this.isEditMode && this.data.medicao?.id) {
      // Modo de Edição: chama o serviço de atualização
      this.measurementService.updateMeasurement(this.data.medicao.id, measurementPayload)
        .pipe(takeUntil(this.destroy$)) // Cancela a subscription se o componente for destruído
        .subscribe({
          next: () => this.dialogRef.close(true), // Fecha o diálogo com sucesso
          error: (err) => console.error('Erro ao atualizar medição:', err)
        });
    } else {
      // Modo de Criação: chama o serviço de criação
      this.measurementService.createMeasurement(measurementPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.dialogRef.close(true), // Fecha o diálogo com sucesso
          error: (err) => console.error('Erro ao criar medição:', err)
        });
    }
  }
}