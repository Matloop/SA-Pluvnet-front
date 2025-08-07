import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { RoleTranslatePipe } from '../../pipes/role-translate.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatIconModule,RoleTranslatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  // Injeta o serviço de autenticação para ter acesso aos dados do usuário.
  // Deixamos como `public` para que o template possa acessá-lo diretamente.
  public authService = inject(AuthService);
}