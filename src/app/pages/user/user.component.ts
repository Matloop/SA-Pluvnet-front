import { Component, NgModule, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil, tap } from 'rxjs';
import { AddressService } from '../../services/address.service';
import { Address } from '../../models/address';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Owner } from '../../models/owner';
import { OwnerService } from '../../services/owner.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [MatMenuModule,
      MatButtonModule,
      MatIconModule,
    MatToolbarModule,],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {
  addresses: Address[] = []
  owners: Owner[] = []
  private destroy$ = new Subject<void>();
  showForm : boolean = false;
  addressForm!: FormGroup
  constructor(private router : Router){

  } 
  logout(){
    ss : void sessionStorage.setItem("auth-token", "");
    ss2 : void sessionStorage.setItem("username", "");
    this.router.navigate(["/login"]);

  }
  }

  
  

