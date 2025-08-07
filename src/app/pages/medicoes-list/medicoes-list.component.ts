import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs/operators';

import { MeasurementService } from '../../services/measurement.service';
import { MeasurementRecordDTO } from '../../models/measurement-record.dto';
import { PluviometroElement } from '../owner/owner.component';

// Dados que este diálogo espera receber
export interface MedicoesListData {
  pluviometro: PluviometroElement;
}

@Component({
  selector: 'app-medicoes-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe, // Importe o DatePipe para formatar datas
    MatDialogModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './medicoes-list.component.html',
  styleUrls: ['./medicoes-list.component.scss']
})
export class MedicoesListComponent implements OnInit {
  displayedColumns: string[] = ['measurementDateTime', 'measurementValue', 'danger'];
  dataSource = new MatTableDataSource<MeasurementRecordDTO>([]);
  isLoading = true;
  errorMessage: string | null = null;
  pluviometro: PluviometroElement;

  constructor(
    public dialogRef: MatDialogRef<MedicoesListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MedicoesListData,
    private measurementService: MeasurementService
  ) {
    this.pluviometro = data.pluviometro;
  }

  ngOnInit(): void {
    this.loadMedicoes();
  }

  loadMedicoes(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.measurementService.getMeasurementsByEquipmentId(this.pluviometro.id)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (records) => {
          this.dataSource.data = records;
        },
        error: (err) => {
          console.error("Erro ao carregar medições:", err);
          this.errorMessage = 'Não foi possível carregar as medições. Tente novamente mais tarde.';
        }
      });
  }

  // Função para aplicar classes CSS com base no nível de perigo
  getDangerClass(danger: string | null): string {
    if (!danger) return '';
    switch (danger.toUpperCase()) {
      case 'ALTO': return 'danger-high';
      case 'MÉDIO': return 'danger-medium';
      case 'BAIXO': return 'danger-low';
      default: return '';
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}