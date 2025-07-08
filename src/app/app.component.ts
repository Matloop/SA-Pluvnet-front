import { Component, OnInit, inject } from '@angular/core'; // <-- Import inject
import { NavigationEnd, Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'loginpageangular';
  showAppShell = true;

  // 2. INJECT THE AUTH SERVICE. Make it `public` so the template can access it.
  public authService = inject(AuthService);
  private router = inject(Router);

  // The constructor is now handled by the `inject()` function above.

  ngOnInit(): void {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      map(url => !['/login', '/signup'].includes(url)),
    ).subscribe(show => this.showAppShell = show);
  }

  logout(): void {
    this.authService.logout();
  }
}