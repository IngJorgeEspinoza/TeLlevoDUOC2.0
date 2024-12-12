import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { VehiculoService } from '../../services/vehiculo.service';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.page.html',
  styleUrls: ['./vehiculos.page.scss'],
})
export class VehiculosPage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  vehiculos: any[] = [];
  vehiculoForm: FormGroup;
  modalAbierto: boolean = false;
  modoEdicion: boolean = false;
  vehiculoSeleccionado: any = null;
  imagenPreview: string | null = null;
  imagenFile: File | null = null;
  cargando: boolean = false;
  guardando: boolean = false;
  usuarioActual: any;

  constructor(
    private formBuilder: FormBuilder,
    private vehiculoService: VehiculoService,
    private storageService: StorageService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router
  ) {
    this.vehiculoForm = this.formBuilder.group({
      patente: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}\d{2}$/)]],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      anio: ['', [Validators.required, Validators.min(2000), Validators.max(new Date().getFullYear())]],
      color: ['', Validators.required],
      tipo_combustible: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.cargarUsuario();
    await this.cargarVehiculos();
  }

  async cargarUsuario() {
    this.usuarioActual = await this.storageService.get('usuario_actual');
    if (!this.usuarioActual) {
      this.router.navigate(['/login']);
    }
  }

  async cargarVehiculos() {
    this.cargando = true;
    try {
      const response = await this.vehiculoService.obtenerVehiculo().toPromise();
      this.vehiculos = response.filter((v: any) => v.id_usuario === this.usuarioActual.id);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
      this.mostrarToast('Error al cargar los vehículos', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async verDetalles(vehiculo: any) {
    const alert = await this.alertController.create({
      header: `${vehiculo.marca} ${vehiculo.modelo}`,
      message: `
        <p><strong>Patente:</strong> ${vehiculo.patente}</p>
        <p><strong>Año:</strong> ${vehiculo.anio}</p>
        <p><strong>Color:</strong> ${vehiculo.color}</p>
        <p><strong>Combustible:</strong> ${vehiculo.tipo_combustible}</p>
      `,
      buttons: ['OK']
    });
    await alert.present();
  }

  nuevoVehiculo() {
    this.modoEdicion = false;
    this.vehiculoSeleccionado = null;
    this.imagenPreview = null;
    this.imagenFile = null;
    this.vehiculoForm.reset();
    this.modalAbierto = true;
  }

  editarVehiculo(vehiculo: any) {
    this.modoEdicion = true;
    this.vehiculoSeleccionado = vehiculo;
    this.vehiculoForm.patchValue(vehiculo);
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.modoEdicion = false;
    this.vehiculoSeleccionado = null;
    this.imagenPreview = null;
    this.imagenFile = null;
    this.vehiculoForm.reset();
  }

  seleccionarImagen() {
    this.fileInput.nativeElement.click();
  }

  async onImagenSeleccionada(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.mostrarToast('Por favor, selecciona una imagen', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.mostrarToast('La imagen debe ser menor a 5MB', 'warning');
      return;
    }

    this.imagenFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagenPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async guardarVehiculo() {
    if (this.vehiculoForm.valid) {
      this.guardando = true;
      try {
        const vehiculo = {
          ...this.vehiculoForm.value,
          id_usuario: this.usuarioActual.id
        };

        if (this.modoEdicion && this.vehiculoSeleccionado) {
          vehiculo.id = this.vehiculoSeleccionado.id;
        }

        await this.vehiculoService.agregarVehiculo(vehiculo, this.imagenFile || undefined).toPromise();
        
        this.mostrarToast(
          `Vehículo ${this.modoEdicion ? 'actualizado' : 'agregado'} correctamente`,
          'success'
        );
        this.cerrarModal();
        this.cargarVehiculos();
      } catch (error) {
        console.error('Error al guardar vehículo:', error);
        this.mostrarToast(
          `Error al ${this.modoEdicion ? 'actualizar' : 'agregar'} el vehículo`,
          'danger'
        );
      } finally {
        this.guardando = false;
      }
    } else {
      this.vehiculoForm.markAllAsTouched();
    }
  }

  async eliminarVehiculo(vehiculo: any) {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: 'Esta acción no se puede deshacer',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              // TODO: Implementar eliminación en el servicio
              await this.vehiculoService.eliminarVehiculoLocal(vehiculo.id);
              this.mostrarToast('Vehículo eliminado correctamente', 'success');
              this.cargarVehiculos();
            } catch (error) {
              console.error('Error al eliminar vehículo:', error);
              this.mostrarToast('Error al eliminar el vehículo', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
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