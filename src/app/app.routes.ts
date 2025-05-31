// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component'; // Carregado diretamente (eager)
// NÃO importe SignUpComponent aqui diretamente para lazy loading
import { UserComponent } from './pages/user/user.component';
import { AuthGuard } from './services/authguard.service';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { OwnerComponent } from './pages/owner/owner.component';
import { AddressComponent } from './pages/address/address.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'auth/callback',
        component: AuthCallbackComponent
    },
    {
        path: "login",
        component : LoginComponent, // Login pode ser carregado ansiosamente, pois é a primeira tela
    },
    {
        path: "signup",
        // ISSO É O QUE IMPORTA - CARREGAMENTO PREGUIÇOSO DO COMPONENTE!
        loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignUpComponent),
    },
    {
        path: "user",
        // Exemplo de lazy loading para UserComponent também, se for pesado
        loadComponent: () => import('./pages/user/user.component').then(m => m.UserComponent),
        canActivate: [AuthGuard]
    },
    {
        path: "owner",
        loadComponent: () => import('./pages/owner/owner.component').then(m => m.OwnerComponent),
        canActivate: [AuthGuard]
    },
    {
        path: "address",
        loadComponent: () => import('./pages/address/address.component').then(m => m.AddressComponent),
        canActivate: [AuthGuard]
    }
    // { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundPageComponent) }, // Para 404
];