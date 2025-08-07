import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import { MeasurementService } from '../../services/measurement.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltip
  ],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
  // Usamos ViewEncapsulation.None para permitir que nossos estilos SCSS
  // personalizem os elementos internos do mat-calendar mais facilmente.
  encapsulation: ViewEncapsulation.None,
})
export class CalendarioComponent implements OnInit {
  private measurementService = inject(MeasurementService);

  isLoading = true;
  // Usaremos um Map para armazenar o nível de perigo mais alto de cada dia
  // Chave: 'YYYY-MM-DD', Valor: 'ALTO' | 'MÉDIO' | 'BAIXO'
  public dangerLevels = new Map<string, string>();

  ngOnInit(): void {
    this.loadAllMeasurements();
  }

  loadAllMeasurements(): void {
    this.isLoading = true;
    this.measurementService.getAllMeasurements()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (records) => {
          // Processa todos os registros para determinar o maior perigo de cada dia
          records.forEach(record => {
            if (!record.measurementDateTime) return; // Pula registros sem data

            const recordDate = new Date(record.measurementDateTime);
            const dateKey = this.toIsoDateString(recordDate);
            const currentDanger = this.dangerLevels.get(dateKey);
            const newDanger = (record.danger || 'BAIXO').toUpperCase();

            // Se não houver perigo para este dia ou se o novo for maior, atualiza o mapa
            if (!currentDanger || this.getDangerValue(newDanger) > this.getDangerValue(currentDanger)) {
              this.dangerLevels.set(dateKey, newDanger);
            }
          });
        },
        error: (err) => {
          console.error('Falha ao carregar medições para o calendário', err);
          // Você pode adicionar uma snackbar de erro aqui, se desejar.
        }
      });
  }

  // Função que o template do calendário chamará para cada dia renderizado
  getDateClass(date: Date): string {
    const dateKey = this.toIsoDateString(date);
    const danger = this.dangerLevels.get(dateKey);

    if (!danger) {
      return ''; // Sem classe especial
    }

    switch (danger) {
      case 'ALTO': return 'danger-high';
      case 'MÉDIO': return 'danger-medium';
      case 'BAIXO': return 'danger-low';
      default: return '';
    }
  }

  // Converte uma data para o formato 'YYYY-MM-DD' para usar como chave do Map
   toIsoDateString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Atribui um valor numérico ao perigo para facilitar a comparação
  private getDangerValue(danger: string): number {
    switch (danger) {
      case 'ALTO': return 3;
      case 'MÉDIO': return 2;
      case 'BAIXO': return 1;
      default: return 0;
    }
  }
}
