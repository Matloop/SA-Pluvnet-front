import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router'; // Added RouterLinkActive
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav'; // Import MatSidenavModule
import { MatListModule } from '@angular/material/list';       // Import MatListModule
import { MatTooltipModule } from '@angular/material/tooltip'; // For tooltips
import { filter, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, // CommonModule before router modules often helps
    RouterOutlet,
    RouterLink,
    RouterLinkActive, // Added
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule, // Added
    MatListModule,    // Added
    MatTooltipModule  // Added
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'loginpageangular';
  showAppShell = true; // Renamed from showNavbar for clarity, controls the whole shell

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      // Hide the entire app shell (sidebar + topbar) for login/signup
      map(url => url !== '/login' && url !== '/signup'),
    ).subscribe(show => this.showAppShell = show);
  }

  logout(): void {
    // sessionStorage.setItem("auth-token", ""); // Consider using a service for auth
    // sessionStorage.setItem("username", "");
    console.log('Logout clicked');
    this.router.navigate(['/login']);
  }
}