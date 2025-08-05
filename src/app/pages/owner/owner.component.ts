import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SelectionModel } from "@angular/cdk/collections";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";

// Import all the necessary services and interfaces
import { EquipmentService, EquipmentDTO, CreateEquipmentPayload } from '../../services/equipment.service';
import { PluviometroFormComponent, PluviometroFormData, PluviometroFormResult } from "../pluviometro-form/pluviometro-form.component";
import { MedicaoFormComponent, MedicaoFormData } from "../medicao-form/medicao-form.component"; // Assuming MedicaoForm exists
import { MeasurementService } from "../../services/measurement.service";

// This is the VIEW MODEL for your table. It flattens the DTO for easy display.
export interface PluviometroElement {
  id: number;
  ownerId: number;
  proprietarioNome: string;
  email: string;
  descricao: string;
  cep: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento?: string;
}

@Component({
  selector: "app-owner",
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatCheckboxModule, MatButtonModule,
    MatIconModule, MatTooltipModule, MatDialogModule, MatSnackBarModule,
    MatMenuModule, MatProgressSpinnerModule
  ],
  templateUrl: "./owner.component.html",
  styleUrls: ["./owner.component.scss"],
})
export class OwnerComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ["select", "proprietario", "email", "descricao", "localizacao", "acoes"];
  dataSource = new MatTableDataSource<PluviometroElement>([]);
  selection = new SelectionModel<PluviometroElement>(true, []);
  isLoading = true;

  // --- THE CRITICAL FIX ---
  // This now represents the ID of the user who is currently logged in and viewing this page.
  // We will use this ID for BOTH loading data AND creating new data.
  // Set this to the ID of an owner that exists in your database (e.g., 1 or 2).
  private loggedInOwnerId: number = 2; // Make sure Owner with ID 2 exists in your DB

  private destroy$ = new Subject<void>();
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private equipmentService = inject(EquipmentService);
  private measurementService = inject(MeasurementService);

  constructor() {}

  ngOnInit(): void {
    if (!this.loggedInOwnerId) {
      this.snackBar.open('ID do proprietário não encontrado. Simulação de login falhou.', 'Fechar', { duration: 5000 });
      this.isLoading = false;
      return;
    }
    this.loadPluviometros();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private mapDtoToViewModel(dto: EquipmentDTO): PluviometroElement {
    return {
      id: dto.id,
      ownerId: dto.ownerId,
      descricao: dto.description,
      proprietarioNome: dto.owner.name,
      email: dto.owner.email,
      cep: dto.address.cep,
      cidade: dto.address.city,
      bairro: dto.address.neighborhood,
      rua: dto.address.street,
      numero: dto.address.number,
      complemento: dto.address.complement,
    };
  }

  loadPluviometros(): void {
    this.isLoading = true;
    this.equipmentService.getEquipmentsByOwnerId(this.loggedInOwnerId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (dtos) => {
          this.dataSource.data = dtos.map(dto => this.mapDtoToViewModel(dto));
          this.selection.clear(); // Clear selection after reloading data
        },
        error: (err) => {
          console.error("Erro ao carregar pluviômetros:", err);
          this.snackBar.open('Falha ao carregar pluviômetros do servidor.', 'Fechar', { duration: 5000 });
        }
      });
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: PluviometroElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  openPluviometroForm(isEditMode: boolean, pluviometro?: PluviometroElement): void {
    const dialogData: PluviometroFormData = { isEditMode, pluviometro };
    const dialogRef = this.dialog.open(PluviometroFormComponent, {
      width: "600px", data: dialogData, disableClose: true
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: PluviometroFormResult | undefined) => {
      if (!result) return;

      const payload: CreateEquipmentPayload = {
        ownerId: this.loggedInOwnerId, // Use the consistent ID of the logged-in user
        description: result.description,
        address: {
          cep: result.cep.replace(/\D/g, ''),
          street: result.rua,
          number: result.numero,
          complement: result.complemento,
          city: result.cidade,
          neighborhood: result.bairro,
        },
      };

      if (isEditMode && pluviometro) {
        this.updatePluviometro(pluviometro.id, payload);
      } else {
        this.createPluviometro(payload);
      }
    });
  }

  createPluviometro(payload: CreateEquipmentPayload): void {
    this.isLoading = true;
    this.equipmentService.createEquipment(payload)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.snackBar.open('Pluviômetro adicionado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadPluviometros();
        },
        error: err => this.snackBar.open(`Erro ao adicionar: ${err.message || 'Erro desconhecido'}`, 'Fechar', { duration: 5000 })
      });
  }
  
  updatePluviometro(id: number, payload: CreateEquipmentPayload): void {
    this.isLoading = true;
    this.equipmentService.updateEquipment(id, payload)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.snackBar.open('Pluviômetro atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadPluviometros();
        },
        error: err => this.snackBar.open(`Erro ao atualizar: ${err.message || 'Erro desconhecido'}`, 'Fechar', { duration: 5000 })
      });
  }

  adicionarPluviometro(): void {
    this.openPluviometroForm(false);
  }

  editarItem(element: PluviometroElement): void {
    this.openPluviometroForm(true, element);
  }

  excluirItem(element: PluviometroElement): void {
    this.isLoading = true;
    this.equipmentService.deleteEquipment(element.id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.snackBar.open(`Pluviômetro '${element.descricao}' excluído.`, 'Fechar', { duration: 3000 });
          this.loadPluviometros();
        },
        error: err => this.snackBar.open(`Erro ao excluir: ${err.message || 'Erro desconhecido'}`, 'Fechar', { duration: 5000 })
    });
  }
  
  fazerMedicao(): void {
    if (this.selection.selected.length !== 1) {
      this.snackBar.open('Selecione exatamente um pluviômetro para registrar a medição.', 'Fechar', { duration: 3000 });
      return;
    }
    const selectedEquipment = this.selection.selected[0];
    const dialogData: MedicaoFormData = {
      isEditMode: false,
      pluviometro: selectedEquipment
    };
    this.dialog.open(MedicaoFormComponent, { width: "450px", data: dialogData, disableClose: true });
  }

  verMedicoes(pluviometro: PluviometroElement): void {
    this.snackBar.open(`Funcionalidade "Ver Medições" para '${pluviometro.descricao}' ainda não implementada.`, 'Fechar', { duration: 3000 });
  }

  verLocalizacao(element: PluviometroElement): void {
    const enderecoCompleto = `${element.rua}, ${element.numero}, ${element.bairro}, ${element.cidade}`;
    const url = `https://www.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}`;
    window.open(url, "_blank");
  }
}