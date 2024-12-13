import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { Usuario } from '../../interfaces/usuario.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  usuario: Usuario | null = null;
  isDarkMode = false;
  fontSize = 'medium';

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private menuCtrl: MenuController,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.cargarUsuario();
    await this.cargarPreferencias();
  }

  async cargarUsuario() {
    this.usuario = await this.storageService.get('usuario_actual');
    if (!this.usuario) {
      this.router.navigate(['/login']);
    }
  }

  async cargarPreferencias() {
    this.isDarkMode = await this.storageService.get('dark-theme') || false;
    this.fontSize = await this.storageService.get('font-size') || 'medium';
    this.aplicarPreferencias();
  }

  aplicarPreferencias() {
    document.body.classList.toggle('dark-theme', this.isDarkMode);
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${this.fontSize}`);
  }

  async toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    await this.storageService.set('dark-theme', this.isDarkMode);
    this.aplicarPreferencias();
  }

  async cambiarTamanioFuente(size: 'small' | 'medium' | 'large') {
    this.fontSize = size;
    await this.storageService.set('font-size', size);
    this.aplicarPreferencias();
  }

  async cerrarSesion() {
    await this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}