import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Verificar si ya hay una sesión activa
    this.authService.authState$.subscribe(user => {
      if (user) {
        this.router.navigate(['/home']);
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      try {
        const { email, password } = this.loginForm.value;
        await this.authService.login(email, password);
        
        await this.showToast('Inicio de sesión exitoso', 'success');
        this.router.navigate(['/home']);
      } catch (error: any) {
        let message = 'Error al iniciar sesión';
        
        if (error.code === 'auth/user-not-found') {
          message = 'Usuario no encontrado';
        } else if (error.code === 'auth/wrong-password') {
          message = 'Contraseña incorrecta';
        }
        
        await this.showToast(message, 'danger');
      } finally {
        this.isLoading = false;
      }
    } else {
      this.loginForm.markAllAsTouched();
      await this.showToast('Por favor, complete todos los campos correctamente', 'warning');
    }
  }

  goToRegistro() {
    this.router.navigate(['/registro']);
  }

  goToRecuperarPassword() {
    this.router.navigate(['/recuperar-password']);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
      buttons: [{
        text: 'OK',
        role: 'cancel'
      }]
    });
    await toast.present();
  }
}