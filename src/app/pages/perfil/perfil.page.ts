import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { UsuarioService } from '../../services/usuario.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { StorageService } from '../../services/storage.service';
import { Usuario } from '../../interfaces/usuario.interface';
import { Vehiculo } from '../../interfaces/vehiculo.interface';

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
      nombre: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+569\d{8}$/)]]
    });
  }

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    const loading = await this.loadingController.create({
      message: 'Cargando perfil...'
    });
    await loading.present();

    try {
      // Cargar usuario
      this.usuario = await this.usuarioService.obtenerUsuarioLocal();
      if (!this.usuario) {
        throw new Error('No se encontró información del usuario');
      }

      // Actualizar formulario
      this.perfilForm.patchValue({
        nombre: this.usuario.nombre,
        correo: this.usuario.correo,
        telefono: this.usuario.telefono
      });

      // Cargar vehículos
      const response = await this.vehiculoService.obtenerVehiculo().toPromise();
      this.vehiculos = response.filter((v: any) => v.id_usuario === this.usuario?.id);

      // TODO: Implementar carga de estadísticas desde el backend
      this.cargarEstadisticas();

    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.mostrarToast('Error al cargar los datos del perfil', 'danger');
    } finally {
      loading.dismiss();
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
    }
    this.imagenPreview = null;
    this.imagenFile = null;
  }

  seleccionarImagen() {
    this.fileInput.nativeElement.click();
  }

  async onImagenSeleccionada(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo y tamaño
    if (!file.type.startsWith('image/')) {
      this.mostrarToast('Por favor, selecciona una imagen', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.mostrarToast('La imagen debe ser menor a 5MB', 'warning');
      return;
    }

    this.imagenFile = file;
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagenPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async guardarCambios() {
    if (this.perfilForm.valid && this.usuario) {
      this.guardando = true;
      
      try {
        const datosActualizados = {
          ...this.usuario,
          ...this.perfilForm.value
        };

        // Actualizar usuario en la API
        await this.usuarioService.agregarUsuario(datosActualizados, this.imagenFile || undefined).toPromise();

        // Actualizar storage local
        await this.usuarioService.guardarUsuarioLocal(datosActualizados);
        
        this.usuario = datosActualizados;
        this.modoEdicion = false;
        this.mostrarToast('Perfil actualizado correctamente', 'success');
      } catch (error) {
        console.error('Error al actualizar perfil:', error);
        this.mostrarToast('Error al actualizar el perfil', 'danger');
      } finally {
        this.guardando = false;
      }
    }
  }

  async cargarEstadisticas() {
    // TODO: Implementar carga real de estadísticas
    this.estadisticas = {
      totalViajes: 12,
      calificacion: 4.5
    };
  }

  irAVehiculos() {
    this.router.navigate(['/vehiculos']);
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  ngOnDestroy() {
    if (this.imagenPreview) {
      URL.revokeObjectURL(this.imagenPreview);
    }
  }
}