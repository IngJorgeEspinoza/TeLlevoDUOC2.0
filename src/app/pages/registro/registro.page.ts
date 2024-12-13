import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  registroForm: FormGroup;
  showPassword: boolean = false;
  isLoading: boolean = false;
  imagenPreview: string | null = null;
  imagenFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.registroForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, this.validarCorreoDuoc]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+569\d{8}$/)]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      imagen: [null, [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {}

  validarCorreoDuoc(control: any) {
    const email = control.value;
    if (email && !email.toLowerCase().endsWith('&#64;duocuc.cl')) {
      return { duocEmail: true };
    }
    return null;
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      await this.showToast('Por favor, selecciona una imagen válida', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      await this.showToast('La imagen debe ser menor a 5MB', 'warning');
      return;
    }

    this.imagenFile = file;
    this.registroForm.patchValue({ imagen: file });
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagenPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.imagenPreview = null;
    this.imagenFile = null;
    this.fileInput.nativeElement.value = '';
    this.registroForm.patchValue({ imagen: null });
  }

  async onSubmit() {
    if (this.registroForm.valid && this.imagenFile) {
      this.isLoading = true;
      
      try {
        const { email, password, nombre, telefono } = this.registroForm.value;
        
        // Registro en Firebase
        const userCredential = await this.authService.registro(email, password);
        
        // Registro en la API
        await this.usuarioService.agregarUsuario({
          nombre,
          correo: email,
          telefono
        }, this.imagenFile).toPromise();
        
        await this.showToast('Registro exitoso', 'success');
        this.router.navigate(['/login']);
      } catch (error: any) {
        let message = 'Error en el registro';
        
        if (error.code === 'auth/email-already-in-use') {
          message = 'El correo ya está registrado';
        }
        
        await this.showToast(message, 'danger');
      } finally {
        this.isLoading = false;
      }
    } else {
      this.registroForm.markAllAsTouched();
      await this.showToast('Por favor, complete todos los campos correctamente', 'warning');
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

  ngOnDestroy() {
    if (this.imagenPreview) {
      URL.revokeObjectURL(this.imagenPreview);
    }
  }
}