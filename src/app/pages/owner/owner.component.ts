import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SelectionModel } from "@angular/cdk/collections";
import { MatDialog, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { PluviometroFormComponent, PluviometroFormData } from "../pluviometro-form/pluviometro-form.component";
import { MedicaoFormComponent, MedicaoFormData, MedicaoFormResult } from "../medicao-form/medicao-form.component";
import { MeasurementService } from "../../services/measurement.service";
import { MatMenuModule } from "@angular/material/menu";
import { Subject, takeUntil, finalize } from "rxjs";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// --- NEW IMPORTS ---
import { EquipmentService, EquipmentDTO, CreateEquipmentPayload } from '../../services/equipment.service';
import { AuthService } from '../../services/auth.service';
import { MeasurementRecordDTO } from "../../models/measurement-record.dto";

// This is the VIEW MODEL for your table. It remains the same.
export interface PluviometroElement {
  id: number;
  proprietarioNome: string;
  email: string;
  descricao: string;
  cep: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento?: string;
  localizacaoIcon: string;
}

@Component({
  selector: "app-owner",
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatCheckboxModule, MatButtonModule,
    MatIconModule, MatTooltipModule, MatDialogModule, MatSnackBarModule,
    MatMenuModule, MatProgressSpinnerModule // Added for loading indicator
  ],
  templateUrl: "./owner.component.html",
  styleUrls: ["./owner.component.scss"],
})
export class OwnerComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ["select", "proprietario", "email", "descricao", "localizacao", "acoes"];
  dataSource = new MatTableDataSource<PluviometroElement>([]);
  selection = new SelectionModel<PluviometroElement>(true, []);
  isLoading = true; // Start with loading true

  private destroy$ = new Subject<void>();
  
  // Use modern `inject()` for cleaner dependency injection
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private measurementService = inject(MeasurementService);
  private equipmentService = inject(EquipmentService);
  private authService = inject(AuthService);

  constructor() {}

  ngOnInit(): void {
    this.loadPluviometros();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // This helper function converts the backend data (DTO) to the format your table needs (ViewModel)
  private mapDtoToViewModel(dto: EquipmentDTO): PluviometroElement {
    return {
      id: dto.id,
      descricao: dto.name,
      proprietarioNome: dto.owner.name,
      email: dto.owner.email,
      cep: dto.address.cep,
      cidade: dto.address.city,
      bairro: dto.address.neighborhood,
      rua: dto.address.street,
      numero: dto.address.number,
      complemento: dto.address.complement,
      localizacaoIcon: 'map'
    };
  }

  loadPluviometros(): void {
    const ownerId = this.authService.currentUser()?.userId;
    if (ownerId === undefined) {
      this.snackBar.open('Erro: ID do usuário não encontrado. Faça login novamente.', 'Fechar', { duration: 5000 });
      this.isLoading = false;
      return;
    }
    
    this.isLoading = true;
    this.equipmentService.getEquipmentsByOwnerId(ownerId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false) // Ensures spinner is turned off
      )
      .subscribe({
        next: (dtos) => {
          this.dataSource.data = dtos.map(this.mapDtoToViewModel);
          this.selection.clear();
        },
        error: (err) => {
          console.error("Erro ao carregar pluviômetros:", err);
          this.snackBar.open('Falha ao carregar pluviômetros do servidor.', 'Fechar', { duration: 5000 });
        }
      });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  checkboxLabel(row?: PluviometroElement): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'selected'} pluviomêtro ${row.descricao}`;
  }

  openPluviometroForm(isEditMode: boolean, pluviometro?: PluviometroElement): void {
    const dialogData: PluviometroFormData = { isEditMode, pluviometro };

    const dialogRef = this.dialog.open(PluviometroFormComponent, {
      width: "600px", data: dialogData, disableClose: true
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(formData => {
      if (!formData) return;

      const owner = this.authService.currentUser();
      if(!owner) {
        this.snackBar.open('Sessão expirada. Por favor, faça login novamente.', 'Fechar', { duration: 5000 });
        this.authService.logout();
        return;
      }
      
      const payload: CreateEquipmentPayload = {
        name: formData.descricao,
        ownerId: owner.userId,
        address: {
          cep: formData.cep.replace(/\D/g, ''), // Ensure CEP is only numbers
          street: formData.rua,
          number: formData.numero,
          complement: formData.complemento,
          city: formData.cidade,
          neighborhood: formData.bairro,
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
          this.loadPluviometros(); // Refresh the table
        },
        error: err => this.snackBar.open(`Erro ao adicionar: ${err.message}`, 'Fechar', { duration: 5000 })
      });
  }
  
  updatePluviometro(id: number, payload: CreateEquipmentPayload): void {
    this.isLoading = true;
    this.equipmentService.updateEquipment(id, payload)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.snackBar.open('Pluviômetro atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadPluviometros(); // Refresh the table with fresh data
        },
        error: err => this.snackBar.open(`Erro ao atualizar: ${err.message}`, 'Fechar', { duration: 5000 })
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
          this.loadPluviometros(); // Refresh the table
        },
        error: err => {
            this.snackBar.open(`Erro ao excluir: ${err.message}`, 'Fechar', { duration: 5000 });
        }
    });
  }

  fazerMedicao(): void {
    if (this.selection.selected.length !== 1) {
      this.snackBar.open('Selecione exatamente um pluviomêtro para registrar medição.', 'Fechar', { duration: 3000 });
      return;
    }

    const pluviometroSelecionado = this.selection.selected[0];
    const dialogData: MedicaoFormData = {
      pluviometro: pluviometroSelecionado, // pluviometroSelecionado is PluviometroElement
      isEditMode: false,
    };

    const dialogRef = this.dialog.open(
    MedicaoFormComponent, {
      width: "450px",
      data: dialogData,
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((formResult: MedicaoFormResult | undefined) => {
        if (formResult) {
          // Transform MedicaoFormResult to MeasurementRecordDTO payload
          // The 'id' in formResult.EquipmentId corresponds to the equipment's ID.
          // The 'pluviometroId' in formResult also holds this equipment ID.

          if (
            formResult.EquipmentId.id === null ||
            formResult.EquipmentId.id === undefined
          ) {
            this.snackBar.open(
              "Erro: ID do equipamento inválido ao tentar salvar medição.",
              "Fechar",
              { duration: 5000 }
            );
            console.error(
              "EquipmentId.id is null or undefined in formResult",
              formResult
            );
            return;
          }

          const newMeasurementPayload: Omit<MeasurementRecordDTO, "id"> = {
            measurementDateTime: formResult.dataHora.toISOString(),
            measurementValue: formResult.valor.toString(),
            equipmentID: formResult.EquipmentId.id, // Use the ID from the PluviometroElement
            danger: null, // Or determine based on value, e.g., formResult.valor > 50 ? 'HIGH' : 'LOW'
            // For now, let backend handle 'danger' or set a default if required by backend
          };

          this.measurementService
            .createMeasurement(newMeasurementPayload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (savedMeasurement) => {
                this.snackBar.open(
                  `Medição para '${formResult.EquipmentId.descricao}' salva!`,
                  "Fechar",
                  { duration: 3000 }
                );
                this.selection.clear();
              },
              error: (err) => {
                this.snackBar.open(
                  `Erro ao salvar medição: ${err.message}`,
                  "Fechar",
                  { duration: 5000 }
                );
                console.error("Erro ao salvar medição:", err);
              },
            });
        }
      });
  }

  verLocalizacao(element: PluviometroElement): void {
    const enderecoCompleto = `${element.rua}, ${element.numero}, ${element.bairro}, ${element.cidade}`;
    const url = `https://www.google.com/maps?q=${encodeURIComponent(
      enderecoCompleto
    )}`;
    window.open(url, "_blank");
  }

  verMedicoes(pluviometro: PluviometroElement): void {
    if (pluviometro.id === null || pluviometro.id === undefined) {
      this.snackBar.open(
        "Não é possível buscar medições: ID do pluviômetro inválido.",
        "Fechar",
        { duration: 4000 }
      );
      console.error(
        "Cannot fetch measurements, pluviometro.id is invalid",
        pluviometro
      );
      return;
    }

    this.snackBar.open(
      `Buscando medições para ${pluviometro.descricao}...`,
      "Fechar",
      { duration: 2000 }
    );
    this.measurementService
      .getMeasurementsByEquipmentId(pluviometro.id)
      .subscribe({
        next: (measurements) => {
          if (measurements && measurements.length > 0) {
            console.log(
              `Medições para '${pluviometro.descricao}':`,
              measurements
            );
            // TODO: Display these measurements, e.g., in a new dialog or navigate to a list component
            // For now, just log and show a count
            this.snackBar.open(
              `${measurements.length} medição(ões) encontradas para ${pluviometro.descricao}. Veja o console.`,
              "Fechar",
              { duration: 5000 }
            );
            // Example: Open a dialog to show measurements
            // this.dialog.open(MedicaoDisplayDialogComponent, { data: { measurements, pluviometroNome: pluviometro.descricao } });
          } else {
            this.snackBar.open(
              `Nenhuma medição encontrada para ${pluviometro.descricao}.`,
              "Fechar",
              { duration: 3000 }
            );
          }
        },
        error: (err) => {
          this.snackBar.open(
            `Erro ao buscar medições: ${err.message}`,
            "Fechar",
            { duration: 5000 }
          );
          console.error("Erro ao buscar medições:", err);
        },
      });
  }
}
