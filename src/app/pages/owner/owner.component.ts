import { Component } from '@angular/core';
import { Owner } from '../../models/owner';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OwnerService } from '../../services/owner.service';
import { Subject, takeUntil } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-owner',
  standalone: true,
  imports: [ReactiveFormsModule,NgIf,NgFor],
  templateUrl: './owner.component.html',
  styleUrl: './owner.component.scss'
})
export class OwnerComponent {
    owners: Owner[] = []
    private destroy$ = new Subject<void>();
    showOwnerForm : boolean = false;
    ownerForm!: FormGroup
    constructor(private router : Router, private ownerService : OwnerService,private fb: FormBuilder){
  
    } 
    logout(){
      ss : void sessionStorage.setItem("auth-token", "");
      ss2 : void sessionStorage.setItem("username", "");
      this.router.navigate(["/login"]);
  
    }
  
    ngOnInit(): void {
      this.ownerForm = this.fb.group({
        // Controles para os campos que o usuário vai preencher
        // Não inclua 'id' ou 'proprietario' objeto aqui
        nome: ['', Validators.required], // Exemplo de validação simples
        email: ['', Validators.required, Validators.email],
        telefone: ['', Validators.required],
      });
      this.loadOwners()
    }
    
  
    // Hook ngOnDestroy: Chamado quando o componente é destruído
    ngOnDestroy(): void {
      this.destroy$.next(); // Emite um valor
      this.destroy$.complete(); // Completa o Subject para liberar recursos
    }
  
  
    loadOwners(): void {
      this.ownerService.getOwners()
      .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: Owner[]) => {
            console.log('DADOS RECEBIDOS DIRETAMENTE NA FUNÇÃO NEXT:', data); // <-- É ESTE log que mostra []?
            this.owners = data;
            console.log('THIS.ADDRESSES APÓS ATRIBUIÇÃO NA FUNÇÃO NEXT:', this.owners); // E este?
        },
          
          error: (err) => {
            console.error('Erro ao carregar locais:', err);
            
          }
        });
        console.log(this.owners)
    }
    saveOwner(){
      
      if (this.ownerForm.invalid) {
        console.log("Formulário inválido.");
        this.ownerForm.markAllAsTouched(); // Mostra erros se houver
        return; // Interrompe se inválido
      }
  
      const formData = this.ownerForm.value;
      const ownerDTO: any = {
        nome: formData.nome,
        email : formData.email,
        telefone : formData.telefone // Adiciona o ID do proprietário
      };
      this.ownerService.addOwner(ownerDTO)
      .pipe(
        takeUntil(this.destroy$),
         // Reseta o estado de submissão
      )
      .subscribe({
        next: (novoEnderecoSalvo) => {
          console.log('Endereço adicionado com sucesso:', novoEnderecoSalvo);
          this.owners.push(ownerDTO); // Adiciona na lista local
          this.showOwnerForm = false; // Esconde o formulário
          this.ownerForm.reset(); // Limpa os campos do formulário
        },
        error: (err) => {
          console.error('Erro ao salvar endereço:', err);
          // Adicione feedback de erro para o usuário aqui, se desejar
        }
      });
    }
  
    displayOwnerForm(){
      this.showOwnerForm = !this.showOwnerForm
    }
}
