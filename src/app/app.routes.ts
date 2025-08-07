import { Routes } from '@angular/router';

// Guards
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

// Componentes para rotas específicas (sem lazy loading aqui)
import { LoginComponent } from './pages/login/login.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';

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
        component : LoginComponent,
    },
    {
        path: "signup",
        // Carregamento preguiçoso para o componente de cadastro
        loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignUpComponent),
    },

    // --- ROTAS PROTEGIDAS DA APLICAÇÃO ---

    {
        path: "user",
        loadComponent: () => import('./pages/user/user.component').then(m => m.UserComponent),
        canActivate: [authGuard] // Utilizando o AuthGuard funcional
    },
    {
        path: "owner",
        loadComponent: () => import('./pages/owner/owner.component').then(m => m.OwnerComponent),
        canActivate: [authGuard, roleGuard], // Protegido por autenticação e por perfil (role)
        data: {
            requiredRole: 'OWNER' // Apenas usuários com a role 'OWNER' podem acessar
        }
    },
    {
        path: "address",
        loadComponent: () => import('./pages/address/address.component').then(m => m.AddressComponent),
        canActivate: [authGuard]
    },

    // --- NOVAS ROTAS ADICIONADAS AQUI ---

    {
        path: "profile",
        // Carregamento preguiçoso para o componente de Perfil
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard] // Qualquer usuário logado pode ver seu próprio perfil
    },
    

    // --- ROTA CURINGA (WILD CARD) ---
    // Deve ser a última rota da lista. Redireciona qualquer URL não encontrada.
    // Você pode criar um componente de 'Página não encontrada' ou redirecionar para uma rota principal.
    {
      path: '**',
      redirectTo: '/login' // Redireciona para o login se a rota não for encontrada
    }
];