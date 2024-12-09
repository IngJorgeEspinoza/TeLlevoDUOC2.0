import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Esta función se ejecuta cada vez que alguien intenta acceder a una ruta protegida
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    
    // Verificamos si hay un usuario autenticado
    const isAuthenticated = await this.authService.isAuthenticated();
    
    if (isAuthenticated) {
      // Si está autenticado, permitimos el acceso
      return true;
    } else {
      // Si no está autenticado, lo enviamos al login
      this.router.navigate(['/login']);
      return false;
    }
  }
}