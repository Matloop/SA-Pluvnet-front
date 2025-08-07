import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';

import { MeasurementService } from '../../services/measurement.service';
import { MeasurementRecordDTO } from '../../models/measurement-record.dto';
import { DayMeasurementsDialogComponent, DayMeasurementsDialogData } from '../../dialogs/day-measurements/day-measurements.component';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarioComponent implements OnInit {
  private measurementService = inject(MeasurementService);
  private dialog = inject(MatDialog);

  isLoading = true;
  private allMeasurements: MeasurementRecordDTO[] = [];
  public dangerLevels = new Map<string, string>();
  
  public selectedDate: Date | null = null;

  ngOnInit(): void {
    this.loadAllMeasurements();
  }

  loadAllMeasurements(): void {
    this.isLoading = true;
    this.measurementService.getAllMeasurements()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (records) => {
          this.allMeasurements = records;
          this.processDangerLevels(records);
        },
        error: (err) => {
          console.error('Falha ao carregar medições para o calendário', err);
        }
      });
  }
  
  processDangerLevels(records: MeasurementRecordDTO[]): void {
    records.forEach(record => {
      if (!record.measurementDateTime) return;
      const recordDate = new Date(record.measurementDateTime);
      // **CORREÇÃO CRÍTICA 1: Usa a função UTC para gerar a chave**
      const dateKey = this.toUtcIsoDateString(recordDate);
      const currentDanger = this.dangerLevels.get(dateKey);
      const newDanger = (record.danger || 'BAIXO').toUpperCase();
      if (!currentDanger || this.getDangerValue(newDanger) > this.getDangerValue(currentDanger)) {
        this.dangerLevels.set(dateKey, newDanger);
      }
    });
  }

  getDateClass(date: Date): string {
    // **CORREÇÃO CRÍTICA 2: Usa a função UTC para buscar a classe**
    const dateKey = this.toUtcIsoDateString(date);
    const danger = this.dangerLevels.get(dateKey);
    if (!danger) return '';
    return `danger-${danger.toLowerCase()}`;
  }
  
  onDateSelected(date: Date | null): void {
    this.selectedDate = date;
  }
  
  verMedicoesDoDia(): void {
    if (!this.selectedDate) return;

    // **CORREÇÃO CRÍTICA 3: Filtra usando a função UTC**
    const dateKey = this.toUtcIsoDateString(this.selectedDate);
    const recordsForDay = this.allMeasurements.filter(
      record => this.toUtcIsoDateString(new Date(record.measurementDateTime)) === dateKey
    );

    const dialogData: DayMeasurementsDialogData = {
      date: this.selectedDate,
      records: recordsForDay
    };

    this.dialog.open(DayMeasurementsDialogComponent, {
      width: '600px',
      data: dialogData
    });
  }

  // **NOVA FUNÇÃO CORRIGIDA para gerar a string de data YYYY-MM-DD em UTC**
  toUtcIsoDateString(date: Date): string {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getDangerValue(danger: string): number {
    switch (danger) {
      case 'ALTO': return 3;
      case 'MÉDIO': return 2;
      case 'BAIXO': return 1;
      default: return 0;
    }
  }
}