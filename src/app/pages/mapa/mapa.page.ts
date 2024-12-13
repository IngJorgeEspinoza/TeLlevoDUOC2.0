import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { ViajeService } from '../../services/viaje.service';
import { UsuarioService } from '../../services/usuario.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit {
  @ViewChild(GoogleMap) map!: GoogleMap;

  // Configuración del mapa
  center: google.maps.LatLngLiteral = {
    lat: -33.4970965,
    lng: -70.6161632 
  };
  zoom = 15;
  mapOptions: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    mapTypeId: 'roadmap',
    maxZoom: 20,
    minZoom: 8,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  // Marcador de DUOC
  duocPosition: google.maps.LatLngLiteral = {
    lat: -33.4970965,
    lng: -70.6161632
  };
  duocMarkerOptions: google.maps.MarkerOptions = {
    icon: {
      url: 'assets/imgs/duoc-marker.png',
      scaledSize: new google.maps.Size(40, 40)
    }
  };

  // Opciones de la ruta
  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#00162b',
    strokeOpacity: 0.8,
    strokeWeight: 3
  };

  // Variables de estado
  viajes: any[] = [];
  viajeSeleccionado: any = null;
  rutaSeleccionada: google.maps.LatLngLiteral[] = [];
  conductorInfo: any = null;
  vehiculoInfo: any = null;
  tiempoEstimado: string = '';
  distanciaEstimada: string = '';
  cargando: boolean = false;
  cargandoViaje: boolean = false;

  constructor(
    private viajeService: ViajeService,
    private usuarioService: UsuarioService,
    private vehiculoService: VehiculoService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarViajes();
  }

  async cargarViajes() {
    this.cargando = true;
    try {
      const viajes = await firstValueFrom(this.viajeService.obtenerViaje());
      this.viajes = viajes.filter((v: any) => v.estado === 1);
    } catch (error) {
      await this.mostrarToast('Error al cargar los viajes', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  getPosition(ubicacion: string): google.maps.LatLngLiteral {
    // Aquí deberías implementar la geocodificación usando la API de Google Maps
    return {
      lat: this.duocPosition.lat + (Math.random() - 0.5) * 0.01,
      lng: this.duocPosition.lng + (Math.random() - 0.5) * 0.01
    };
  }

  async mostrarDetallesViaje(viaje: any) {
    this.viajeSeleccionado = viaje;
    this.cargando = true;

    try {
      // Cargar información del conductor
      const conductor = await firstValueFrom(this.usuarioService.obtenerUsuario(undefined, viaje.id_usuario));
      this.conductorInfo = conductor;

      // Cargar información del vehículo
      const vehiculo = await firstValueFrom(this.vehiculoService.obtenerVehiculo(viaje.id_vehiculo));
      this.vehiculoInfo = vehiculo;

      // Calcular ruta
      await this.calcularRuta(viaje.ubicacion_destino);
    } catch (error) {
      await this.mostrarToast('Error al cargar los detalles', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async calcularRuta(destino: string) {
    const directionsService = new google.maps.DirectionsService();
    
    try {
      const result = await directionsService.route({
        origin: this.duocPosition,
        destination: this.getPosition(destino),
        travelMode: google.maps.TravelMode.DRIVING
      });

      if (result.routes.length > 0) {
        this.rutaSeleccionada = result.routes[0].overview_path.map(point => ({
          lat: point.lat(),
          lng: point.lng()
        }));

        const route = result.routes[0].legs[0];
        this.tiempoEstimado = route.duration?.text || '';
        this.distanciaEstimada = route.distance?.text || '';
      }
    } catch (error) {
      await this.mostrarToast('Error al calcular la ruta', 'danger');
    }
  }

  async tomarViaje() {
    if (!this.viajeSeleccionado) return;

    const alert = await this.alertController.create({
      header: 'Confirmar viaje',
      message: '¿Estás seguro de que deseas tomar este viaje?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            this.cargandoViaje = true;
            try {
              await firstValueFrom(this.viajeService.actualizarEstadoViaje(this.viajeSeleccionado.id, 2));
              await this.mostrarToast('Viaje tomado exitosamente', 'success');
              this.viajeSeleccionado = null;
              await this.cargarViajes();
            } catch (error) {
              await this.mostrarToast('Error al tomar el viaje', 'danger');
            } finally {
              this.cargandoViaje = false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async chatearConductor() {
    await this.mostrarToast('Función de chat en desarrollo', 'warning');
  }

  async actualizarViajes() {
    await this.cargarViajes();
    await this.mostrarToast('Viajes actualizados', 'success');
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