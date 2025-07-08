import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Ajuste o caminho se necessário

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Get the required role from the route's data property
  const requiredRole = route.data['requiredRole'];
  if (!requiredRole) {
    // This is a configuration error in your routes.ts, the guard can't work without it.
    console.error('RoleGuard: `requiredRole` não foi definido nos dados da rota.');
    router.navigate(['/']); // Navigate to a safe default page
    return false;
  }

  // 2. Get the current user info using the computed signal
  const currentUser = authService.currentUser();

  // 3. Check if the user's role matches the required role
  if (currentUser && currentUser.business_role === requiredRole) {
    return true; // Access granted!
  } else {
    // 4. If roles don't match, or there's no user, deny access and redirect
    console.warn(
      `RoleGuard: Acesso negado. Role requerida: '${requiredRole}', Role do usuário: '${currentUser?.business_role ?? 'nenhuma'}'`
    );
    // Redirect to a default page for logged-in users, like a dashboard or profile page.
    // Avoid redirecting back to login if they are already logged in.
    router.navigate(['/user']); // Or create a dedicated '/access-denied' page
    return false; // Block access
  }
};