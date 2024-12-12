import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UsuarioService } from '../services/usuario.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  userImage: string | null = null;
  userName: string | null = null;
  userEmail: string | null = null;
  isDarkTheme: boolean = false;
  selectedFontSize: 'small' | 'medium' | 'large' = 'medium';
  fontSizeModalOpen: boolean = false;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private storageService: StorageService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadUserData();
    await this.loadPreferences();
  }

  async loadUserData() {
    try {
      const user = await this.storageService.get('usuario_actual');
      if (user) {
        this.userName = user.nombre;
        this.userEmail = user.correo;
        this.userImage = user.imagen;
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  }

  async loadPreferences() {
    try {
      const theme = await this.storageService.get('theme');
      const fontSize = await this.storageService.get('fontSize');
      
      this.isDarkTheme = theme === 'dark';
      this.selectedFontSize = fontSize || 'medium';
      
      this.applyTheme();
      this.applyFontSize();
    } catch (error) {
      console.error('Error al cargar preferencias:', error);
    }
  }

  async toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    await this.storageService.set('theme', this.isDarkTheme ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
  }

  openFontSizeModal() {
    this.fontSizeModalOpen = true;
  }

  async changeFontSize(event: any) {
    this.selectedFontSize = event.detail.value;
    await this.storageService.set('fontSize', this.selectedFontSize);
    this.applyFontSize();
  }

  private applyFontSize() {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${this.selectedFontSize}`);
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login'], { replaceUrl: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}