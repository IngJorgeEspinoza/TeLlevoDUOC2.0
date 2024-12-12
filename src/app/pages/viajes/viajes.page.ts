import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViajeService } from '../../services/viaje.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-viajes',
  templateUrl: './viajes.page.html',
  styleUrls: ['./viajes.page.scss'],
})
export class ViajesPage implements OnInit {
  segmentoSeleccionado: 'activos' | 'historial' = 'activos';
  viajes: any[] = [];
  vehiculos: any[] = [];
  cargando: boolean = false;
  modalAbierto: boolean = false;
  guardando: boolean = false;
  viajeForm: FormGroup;
  usuarioActual: any;

  constructor(
    private formBuilder: FormBuilder,
    private viajeService: ViajeService,
    private vehiculoService: VehiculoService,
    private storageService: StorageService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router
  ) {
    this.viajeForm = this.formBuilder.group({
      id_vehiculo: ['', Validators.required],
      ubicacion_destino: ['', Validators.required],
      costo: ['', [Validators.required, Validators.min(500)]],
    });
  }

  async ngOnInit() {
    await this.cargarUsuario();
    await this.cargarVehiculos();
    await this.cargarViajes();
  }

  async cargarUsuario() {
    this.usuarioActual = await this.storageService.get('usuario_actual');
    if (!this.usuarioActual) {
      this.router.navigate(['/login']);
    }
  }

  async cargarVehiculos() {
    try {
      const response = await this.vehiculoService.obtenerVehiculo().toPromise();
      this.vehiculos = response.filter((v: any) => v.id_usuario === this.usuarioActual.id);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
      this.mostrarToast('Error al cargar vehículos', 'danger');
    }
  }

  async cargarViajes() {
    this.cargando = true;
    try {
      const response = await this.viajeService.obtenerViaje(undefined, this.usuarioActual.id).toPromise();
      if (this.segmentoSeleccionado === 'activos') {
        this.viajes = response.filter((v: any) => v.estado === 1 || v.estado === 2);
      } else {
        this.viajes = response.filter((v: any) => v.estado === 3);
      }
    } catch (error) {
      console.error('Error al cargar viajes:', error);
      this.mostrarToast('Error al cargar viajes', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  cambiarFiltro() {
    this.cargarViajes();
  }

  async actualizarViajes(event?: any) {
    await this.cargarViajes();
    if (event) {
      event.target.complete();
    }
  }

  obtenerImagenVehiculo(id_vehiculo: number): string {
    const vehiculo = this.vehiculos.find(v => v.id === id_vehiculo);
    return vehiculo?.imagen || 'assets/imgs/default-car.png';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString();
  }

  obtenerEstado(estado: number): string {
    const estados = {
      1: 'Publicado',
      2: 'En progreso',
      3: 'Finalizado'
    };
    return estados[estado as keyof typeof estados] || 'Desconocido';
  }

  obtenerColorEstado(estado: number): string {
    const colores = {
      1: 'primary',
      2: 'warning',
      3: 'success'
    };
    return colores[estado as keyof typeof colores] || 'medium';
  }

  async nuevoViaje() {
    if (this.vehiculos.length === 0) {
      const alert = await this.alertController.create({
        header: 'No tienes vehículos registrados',
        message: 'Debes registrar un vehículo antes de publicar un viaje',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Registrar Vehículo',
            handler: () => {
              this.router.navigate(['/vehiculos']);
            }
          }
        ]
      });
      await alert.present();
      return;
    }
    this.viajeForm.reset();
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  async guardarViaje() {
    if (this.viajeForm.valid) {
      this.guardando = true;
      try {
        const viaje = {
          ...this.viajeForm.value,
          id_usuario: this.usuarioActual.id,
          ubicacion_origen: 'DUOC UC San Joaquín',
          estado: 1
        };
        
        await this.viajeService.agregarViaje(viaje).toPromise();
        this.mostrarToast('Viaje publicado exitosamente', 'success');
        this.cerrarModal();
        this.cargarViajes();
      } catch (error) {
        console.error('Error al guardar viaje:', error);
        this.mostrarToast('Error al publicar el viaje', 'danger');
      } finally {
        this.guardando = false;
      }
    } else {
      this.viajeForm.markAllAsTouched();
      this.mostrarToast('Por favor, complete todos los campos correctamente', 'warning');
    }
  }

  async cancelarViaje(viaje: any) {
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
              await this.viajeService.actualizarEstadoViaje(viaje.id, 3).toPromise();
              this.mostrarToast('Viaje cancelado exitosamente', 'success');
              this.cargarViajes();
            } catch (error) {
              console.error('Error al cancelar viaje:', error);
              this.mostrarToast('Error al cancelar el viaje', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async verDetalleViaje(viaje: any) {
    const alert = await this.alertController.create({
      header: 'Detalles del Viaje',
      message: `
        <p><strong>Destino:</strong> ${viaje.ubicacion_destino}</p>
        <p><strong>Costo:</strong> $${viaje.costo}</p>
        <p><strong>Estado:</strong> ${this.obtenerEstado(viaje.estado)}</p>
        <p><strong>Fecha:</strong> ${this.formatearFecha(viaje.fecha_creacion)}</p>
      `,
      buttons: ['OK']
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
    // Limpiar recursos si es necesario
  }
}