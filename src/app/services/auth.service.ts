import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn: boolean = false;

  constructor(private router: Router) { }

  // Este método verificará si el usuario está autenticado
  async isAuthenticated(): Promise<boolean> {
    // Por ahora, simplemente devolvemos el valor de isLoggedIn
    // Más adelante, esto verificará con Firebase
    return this.isLoggedIn;
  }

  // Este método se llamará cuando el usuario inicie sesión exitosamente
  async login(email: string, password: string): Promise<boolean> {
    // Por ahora es un método simple
    // Más adelante implementaremos la autenticación real con Firebase
    this.isLoggedIn = true;
    return true;
  }

  // Este método se llamará cuando el usuario cierre sesión
  async logout(): Promise<void> {
    this.isLoggedIn = false;
    await this.router.navigate(['/login']);
  }
}