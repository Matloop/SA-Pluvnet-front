// src/app/pages/owner/owner.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Import MatSnackBar

import { PluviometroFormComponent, PluviometroFormData } from '../pluviometro-form/pluviometro-form.component';
import { MedicaoFormComponent, MedicaoFormData, MedicaoFormResult } from '../medicao-form/medicao-form.component';

// Services
import { MeasurementService } from '../../services/measurement.service'; // Adjust path
// import { OwnerService } from '../../services/owner.service'; // If you were loading owners from backend

// Models
import { MeasurementRecordDTO } from '../../models/measurement-record.dto'; // Adjust path

export interface PluviometroElement {
  id: number; // This must be the ID used by the backend for equipment
  proprietarioNome: string;
  proprietarioAvatarUrl?: string;
  email: string;
  descricao: string;
  cep: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento: string;
  localizacaoIcon: string;
}

const ELEMENT_DATA: PluviometroElement[] = [
  { id: 1, proprietarioNome: 'Max Augusto', email: 'max.augusto@gmail.com', descricao: 'Central Estação', cep: '12345-678', cidade: 'Blumenau', bairro: 'Centro', rua: 'Rua das Palmeiras', numero: '100', complemento: 'Ap 101', localizacaoIcon: 'map' },
  { id: 2, proprietarioNome: 'Sarah Brown', email: 'sarah.brown@gmail.com', descricao: 'Jardim Monitor', cep: '98765-432', cidade: 'Blumenau', bairro: 'Itoupava', rua: 'Rua dos Pinheiros', numero: '200', complemento: '', localizacaoIcon: 'map' },
  // Add more sample data or ensure your backend provides these IDs for equipment
];


@Component({
  selector: 'app-owner',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule // Add MatSnackBarModule here
  ],
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.scss']
})
export class OwnerComponent implements OnInit {
  displayedColumns: string[] = ['select', 'proprietario', 'email', 'descricao', 'localizacao', 'acoes'];
  dataSource = new MatTableDataSource<PluviometroElement>(ELEMENT_DATA);
  selection = new SelectionModel<PluviometroElement>(true, []);

  constructor(
    public dialog: MatDialog,
    private measurementService: MeasurementService, // Inject MeasurementService
    private snackBar: MatSnackBar // Inject MatSnackBar
    // private ownerService: OwnerService // Uncomment if loading owners from backend
  ) { }

  ngOnInit(): void {
    // If loading owners from backend:
    // this.loadOwners();
  }

  // Example: loadOwners() {
  //   this.ownerService.getOwners().subscribe({
  //     next: (data) => {
  //       this.dataSource.data = data.map(owner => ({
  //         id: owner.id, // Ensure your Owner model from backend has 'id'
  //         proprietarioNome: owner.name, // Map backend fields to PluviometroElement fields
  //         email: owner.email,
  //         descricao: owner.defaultPluviometerDescription || `Pluviômetro de ${owner.name}`,
  //         // ... map other fields for cep, cidade, bairro, rua, numero, complemento
  //         // For simplicity, I'm keeping the existing ELEMENT_DATA structure.
  //         // You'd need to ensure PluviometroElement matches what your Owner backend provides,
  //         // or that Owner includes an 'equipmentId' or similar.
  //         cep: 'N/A',
  //         cidade: 'N/A',
  //         bairro: 'N/A',
  //         rua: 'N/A',
  //         numero: 'N/A',
  //         complemento: '',
  //         localizacaoIcon: 'map'
  //       }));
  //     },
  //     error: (err) => {
  //       this.snackBar.open(`Erro ao carregar proprietários: ${err.message}`, 'Fechar', { duration: 5000 });
  //     }
  //   });
  // }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: PluviometroElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  openPluviometroForm(isEditMode: boolean, pluviometro?: PluviometroElement): void {
    const dialogData: PluviometroFormData = {
      isEditMode: isEditMode,
      pluviometro: pluviometro // This pluviometro is of type PluviometroElement
    };

    const dialogRef = this.dialog.open(PluviometroFormComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // result here is also PluviometroElement if PluviometroFormComponent returns it directly
        // TODO: Integrate with OwnerService for add/update PluviometroElement (which represents an Owner with an associated default equipment)
        if (isEditMode && pluviometro) {
          // Call ownerService.updateOwner(...)
          const index = this.dataSource.data.findIndex(p => p.id === result.id);
          if (index > -1) {
            this.dataSource.data[index] = { ...this.dataSource.data[index], ...result };
            this.dataSource.data = [...this.dataSource.data];
            this.snackBar.open('Pluviômetro atualizado com sucesso!', 'Fechar', { duration: 3000 });
          }
        } else {
          // Call ownerService.addOwner(...)
          // For now, assuming result.id is present and correct
          this.dataSource.data = [...this.dataSource.data, result as PluviometroElement];
          this.snackBar.open('Pluviômetro adicionado com sucesso!', 'Fechar', { duration: 3000 });
        }
      }
    });
  }

  adicionarPluviometro(): void {
    this.openPluviometroForm(false);
  }

  editarItem(element: PluviometroElement): void {
    this.openPluviometroForm(true, element);
  }

  excluirItem(element: PluviometroElement): void {
    // TODO: Call ownerService.deleteOwner(element.id)
    // Consider implications if measurements exist for this pluviometer (backend should handle or provide feedback)
    console.log('Excluir Pluviômetro:', element);
    this.dataSource.data = this.dataSource.data.filter(item => item.id !== element.id);
    this.selection.deselect(element);
    this.snackBar.open(`Pluviômetro '${element.descricao}' excluído.`, 'Fechar', { duration: 3000 });
  }

   fazerMedicao(): void {
    if (this.selection.selected.length !== 1) {
      const message = this.selection.selected.length === 0
        ? 'Por favor, selecione um pluviômetro para registrar uma medição.'
        : 'Por favor, selecione apenas um pluviômetro por vez para registrar uma medição.';
      this.snackBar.open(message, 'Fechar', { duration: 4000 });
      return;
    }

    const pluviometroSelecionado = this.selection.selected[0];
    const dialogData: MedicaoFormData = {
      pluviometro: pluviometroSelecionado, // pluviometroSelecionado is PluviometroElement
      isEditMode: false,
    };

    const dialogRef = this.dialog.open<MedicaoFormComponent, MedicaoFormData, MedicaoFormResult>(
      MedicaoFormComponent,
      {
        width: '450px',
        data: dialogData,
        disableClose: true
      }
    );

    dialogRef.afterClosed().subscribe((formResult: MedicaoFormResult | undefined) => {
      if (formResult) {
        // Transform MedicaoFormResult to MeasurementRecordDTO payload
        // The 'id' in formResult.EquipmentId corresponds to the equipment's ID.
        // The 'pluviometroId' in formResult also holds this equipment ID.

        if (formResult.EquipmentId.id === null || formResult.EquipmentId.id === undefined) {
            this.snackBar.open('Erro: ID do equipamento inválido ao tentar salvar medição.', 'Fechar', { duration: 5000 });
            console.error('EquipmentId.id is null or undefined in formResult', formResult);
            return;
        }

        const newMeasurementPayload: Omit<MeasurementRecordDTO, 'id'> = {
          measurementDateTime: formResult.dataHora.toISOString(),
          measurementValue: formResult.valor.toString(),
          equipmentID: formResult.EquipmentId.id, // Use the ID from the PluviometroElement
          danger: null // Or determine based on value, e.g., formResult.valor > 50 ? 'HIGH' : 'LOW'
                       // For now, let backend handle 'danger' or set a default if required by backend
        };

        this.measurementService.createMeasurement(newMeasurementPayload).subscribe({
          next: (savedMeasurement) => {
            this.snackBar.open(`Medição para '${formResult.EquipmentId.descricao}' salva!`, 'Fechar', { duration: 3000 });
            console.log('Medição salva com sucesso no backend:', savedMeasurement);
            // Optionally, refresh a list of measurements if they are displayed elsewhere
          },
          error: (err) => {
            this.snackBar.open(`Erro ao salvar medição: ${err.message}`, 'Fechar', { duration: 5000 });
            console.error('Erro ao salvar medição:', err);
          }
        });
      }
    });
  }

  verLocalizacao(element: PluviometroElement): void {
    const enderecoCompleto = `${element.rua}, ${element.numero}, ${element.bairro}, ${element.cidade}`;
    const url = `https://www.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}`;
    window.open(url, '_blank');
  }

  verMedicoes(pluviometro: PluviometroElement): void {
    if (pluviometro.id === null || pluviometro.id === undefined) {
        this.snackBar.open('Não é possível buscar medições: ID do pluviômetro inválido.', 'Fechar', { duration: 4000 });
        console.error('Cannot fetch measurements, pluviometro.id is invalid', pluviometro);
        return;
    }

    this.snackBar.open(`Buscando medições para ${pluviometro.descricao}...`, 'Fechar', { duration: 2000 });
    this.measurementService.getMeasurementsByEquipmentId(pluviometro.id).subscribe({
      next: (measurements) => {
        if (measurements && measurements.length > 0) {
          console.log(`Medições para '${pluviometro.descricao}':`, measurements);
          // TODO: Display these measurements, e.g., in a new dialog or navigate to a list component
          // For now, just log and show a count
          this.snackBar.open(`${measurements.length} medição(ões) encontradas para ${pluviometro.descricao}. Veja o console.`, 'Fechar', { duration: 5000 });
          // Example: Open a dialog to show measurements
          // this.dialog.open(MedicaoDisplayDialogComponent, { data: { measurements, pluviometroNome: pluviometro.descricao } });
        } else {
          this.snackBar.open(`Nenhuma medição encontrada para ${pluviometro.descricao}.`, 'Fechar', { duration: 3000 });
        }
      },
      error: (err) => {
        this.snackBar.open(`Erro ao buscar medições: ${err.message}`, 'Fechar', { duration: 5000 });
        console.error('Erro ao buscar medições:', err);
      }
    });
  }
}