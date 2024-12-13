import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { UsuarioService } from '../../services/usuario.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { StorageService } from '../../services/storage.service';
import { Usuario } from '../../interfaces/usuario.interface';
import { Vehiculo } from '../../interfaces/vehiculo.interface';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  perfilForm: FormGroup;
  usuario: Usuario | null = null;
  vehiculos: Vehiculo[] = [];
  modoEdicion: boolean = false;
  guardando: boolean = false;
  imagenPreview: string | null = null;
  imagenFile: File | null = null;
  estadisticas = {
    totalViajes: 0,
    calificacion: 0
  };

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private vehiculoService: VehiculoService,
    private storageService: StorageService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router
  ) {
    this.perfilForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+569\d{8}$/)]]
    });
  }

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    const loading = await this.loadingController.create({
      message: 'Cargando perfil...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      this.usuario = await this.usuarioService.obtenerUsuarioLocal();
      if (!this.usuario) {
        throw new Error('No se encontró información del usuario');
      }

      this.perfilForm.patchValue({
        nombre: this.usuario.nombre,
        correo: this.usuario.correo,
        telefono: this.usuario.telefono
      });

      if (this.usuario.id) {
        const response = await firstValueFrom(this.vehiculoService.obtenerVehiculo(this.usuario.id));
        if (Array.isArray(response)) {
          this.vehiculos = response;
        }
      }

      await this.cargarEstadisticas();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      await this.mostrarToast('Error al cargar los datos del perfil', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  toggleEdicion() {
    this.modoEdicion = !this.modoEdicion;
    if (!this.modoEdicion) {
      this.resetearFormulario();
    }
  }

  resetearFormulario() {
    if (this.usuario) {
      this.perfilForm.patchValue({
        nombre: this.usuario.nombre,
        correo: this.usuario.correo,
        telefono: this.usuario.telefono
      });
      this.imagenPreview = this.usuario.imagen || null;
    }
    this.imagenFile = null;
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  seleccionarImagen() {
    if (this.modoEdicion && this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  async onImagenSeleccionada(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!tiposPermitidos.includes(file.type)) {
      await this.mostrarToast('Por favor, selecciona una imagen en formato JPG o PNG', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      await this.mostrarToast('La imagen debe ser menor a 5MB', 'warning');
      return;
    }

    this.imagenFile = file;
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error al crear preview:', error);
      await this.mostrarToast('Error al procesar la imagen', 'danger');
    }
  }

  async guardarCambios() {
    if (!this.perfilForm.valid || !this.usuario) {
      await this.mostrarToast('Por favor, completa todos los campos correctamente', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const datosActualizados: Usuario = {
        ...this.usuario,
        nombre: this.perfilForm.get('nombre')?.value,
        correo: this.perfilForm.get('correo')?.value,
        telefono: this.perfilForm.get('telefono')?.value
      };

      if (this.imagenFile) {
        await firstValueFrom(this.usuarioService.agregarUsuario(datosActualizados, this.imagenFile));
      } else if (this.usuario.imagen) {
        const imagenExistente = await this.obtenerImagenExistente();
        await firstValueFrom(this.usuarioService.agregarUsuario(datosActualizados, imagenExistente));
      }

      await this.usuarioService.guardarUsuarioLocal(datosActualizados);
      this.usuario = datosActualizados;
      this.modoEdicion = false;
      await this.mostrarToast('Perfil actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      await this.mostrarToast('Error al actualizar el perfil', 'danger');
    } finally {
      await loading.dismiss();
      this.guardando = false;
    }
  }

  private async obtenerImagenExistente(): Promise<File> {
    try {
      const response = await fetch(this.usuario?.imagen || '');
      const blob = await response.blob();
      return new File([blob], 'profile-image.jpg', { type: 'image/jpeg' });
    } catch (error) {
      console.error('Error al obtener imagen existente:', error);
      throw new Error('No se pudo procesar la imagen existente');
    }
  }

  async cargarEstadisticas() {
    this.estadisticas = {
      totalViajes: 0,
      calificacion: 0
    };
  }

  irAVehiculos() {
    this.router.navigate(['/vehiculos']);
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom',
      buttons: [{
        text: 'OK',
        role: 'cancel'
      }]
    });
    await toast.present();
  }

  ngOnDestroy() {
    if (this.imagenPreview && !this.imagenPreview.includes('data:image')) {
      URL.revokeObjectURL(this.imagenPreview);
    }
  }
}