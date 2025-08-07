import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MeasurementRecordDTO } from '../../models/measurement-record.dto';

// Dados que este diálogo espera receber
export interface DayMeasurementsDialogData {
  date: Date;
  records: MeasurementRecordDTO[];
}

@Component({
  selector: 'app-day-measurements',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatDialogModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './day-measurements.component.html',
  styleUrls: ['./day-measurements.component.scss']
})
export class DayMeasurementsDialogComponent {
  displayedColumns: string[] = ['time', 'value', 'danger', 'equipment'];

  constructor(
    public dialogRef: MatDialogRef<DayMeasurementsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DayMeasurementsDialogData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}