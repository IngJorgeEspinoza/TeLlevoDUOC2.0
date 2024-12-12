import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss'],
})
export class RecuperarPasswordPage implements OnInit {
  recuperarForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.recuperarForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, this.validarCorreoDuoc]]
    });
  }

  ngOnInit() {}

  validarCorreoDuoc(control: any) {
    const email = control.value;
    if (email && !email.toLowerCase().endsWith('@duocuc.cl')) {
      return { duocEmail: true };
    }
    return null;
  }

  async onSubmit() {
    if (this.recuperarForm.valid) {
      this.isLoading = true;
      
      try {
        const { email } = this.recuperarForm.value;
        await this.authService.recuperarPassword(email);
        
        await this.showToast('Se han enviado las instrucciones a tu correo', 'success');
        this.router.navigate(['/login']);
      } catch (error: any) {
        let message = 'Error al enviar el correo de recuperación';
        
        if (error.code === 'auth/user-not-found') {
          message = 'No existe una cuenta con este correo';
        }
        
        await this.showToast(message, 'danger');
      } finally {
        this.isLoading = false;
      }
    } else {
      this.recuperarForm.markAllAsTouched();
      await this.showToast('Por favor, ingresa un correo válido', 'warning');
    }
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