import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatMenuModule }    from '@angular/material/menu';
import { MatButtonModule }  from '@angular/material/button';
import { MatIconModule }    from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { filter, map }      from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']   // <-- plural!
})
export class AppComponent implements OnInit {
  title = 'loginpageangular';
  showNavbar = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      map(url => url !== '/login')        // simples: só mostra se não for /login
    ).subscribe(show => this.showNavbar = show);
  }

  logout(): void {
    sessionStorage.setItem("auth-token", "");
    sessionStorage.setItem("username", "");
    this.router.navigate(['/login']);
  }
}
