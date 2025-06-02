import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Import MatDialog
import { PluviometroFormComponent, PluviometroFormData } from '../pluviometro-form/pluviometro-form.component'; // Adjust path

// This interface might be better defined in a shared models file
export interface PluviometroElement {
  id: number;
  proprietarioNome: string;
  proprietarioAvatarUrl?: string;
  email: string;
  descricao: string;
  localizacao: string;
  localizacaoIcon: string;
}

const ELEMENT_DATA: PluviometroElement[] = [
  {
    id: 1,
    proprietarioNome: 'Max Augusto',
    email: 'lindsey.stroud@gmail.com',
    descricao: 'Descrição Padrão 1',
    localizacao: 'Rua 3',
    localizacaoIcon: 'map',
  },
  {
    id: 2,
    proprietarioNome: 'Sarah Brown',
    proprietarioAvatarUrl: 'https://i.pravatar.cc/40?u=sarah.brown@example.com',
    email: 'sarah.brown@gmail.com',
    descricao: 'Pluviômetro do Jardim',
    localizacao: 'Rua 5',
    localizacaoIcon: 'map',
  },
  {
    id: 3,
    proprietarioNome: 'Micheal Owen',
    proprietarioAvatarUrl: 'https://i.pravatar.cc/40?u=micheal.owen@example.com',
    email: 'michael.owen@gmail.com',
    descricao: 'Sensor Principal',
    localizacao: 'Rua 6',
    localizacaoIcon: 'map',
  },
  {
    id: 4,
    proprietarioNome: 'Mary Jane',
    proprietarioAvatarUrl: 'https://i.pravatar.cc/40?u=mary.jane@example.com',
    email: 'mary.jane@gmail.com',
    descricao: 'Estação Meteorológica Caseira',
    localizacao: 'Rua 8',
    localizacaoIcon: 'map',
  },
  {
    id: 5,
    proprietarioNome: 'Peter Doodle',
    proprietarioAvatarUrl: 'https://i.pravatar.cc/40?u=peter.doodle@example.com',
    email: 'peter.doodle@gmail.com',
    descricao: 'Ponto de Coleta Alpha',
    localizacao: 'Rua 89',
    localizacaoIcon: 'map',
  },
];

@Component({
  selector: 'app-owner', // Changed from app-pluviometro-list
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule // Add MatDialogModule here
  ],
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.scss']
})
export class OwnerComponent implements OnInit {
  displayedColumns: string[] = ['select', 'proprietario', 'email', 'descricao', 'localizacao', 'acoes'];
  dataSource = new MatTableDataSource<PluviometroElement>(ELEMENT_DATA);
  selection = new SelectionModel<PluviometroElement>(true, []);

  constructor(public dialog: MatDialog) { } // Inject MatDialog

  ngOnInit(): void {
  }

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
      pluviometro: pluviometro
    };

    const dialogRef = this.dialog.open(PluviometroFormComponent, {
      width: '500px', // Adjust width as needed
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (isEditMode && pluviometro) {
          // Update existing item
          const index = this.dataSource.data.findIndex(p => p.id === result.id);
          if (index > -1) {
            this.dataSource.data[index] = { ...this.dataSource.data[index], ...result };
            this.dataSource.data = [...this.dataSource.data]; // Trigger change detection
          }
        } else {
          // Add new item
          this.dataSource.data = [...this.dataSource.data, result as PluviometroElement];
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
    console.log('Excluir:', element);
    // Implement actual delete logic (e.g., call a service, then update dataSource)
    // For now, just remove from the local array
    this.dataSource.data = this.dataSource.data.filter(item => item.id !== element.id);
    this.selection.deselect(element); // Deselect if it was selected
  }

  fazerMedicao(): void {
    console.log('Fazer Medição clicado');
    // This would likely open another dialog or navigate to a new component/view
    // e.g., const dialogRef = this.dialog.open(FazerMedicaoFormComponent, {...});
  }

  verLocalizacao(element: PluviometroElement): void {
    console.log('Ver localização:', element.localizacao);
    // Implement map view logic, perhaps open a map in a dialog or navigate
  }
}