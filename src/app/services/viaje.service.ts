import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Viaje } from '../interfaces/viaje.interface';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ViajeService {
  private apiUrl = environment.apiUrl;
  private mapsKey = environment.mapsKey;
  private firebaseConfig = environment.firebaseConfig;

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) { }

  agregarViaje(viaje: Viaje): Observable<any> {
    const body = {
      p_id_usuario: viaje.id_usuario,
      p_ubicacion_origen: viaje.ubicacion_origen,
      p_ubicacion_destino: viaje.ubicacion_destino,
      p_costo: viaje.costo,
      p_id_vehiculo: viaje.id_vehiculo,
      token: this.firebaseConfig.apiKey
    };

    return this.http.post(`${this.apiUrl}viaje/agregar`, body).pipe(
      map(response => {
        this.guardarViajeLocal(viaje);
        return response;
      }),
      catchError(error => {
        console.error('Error en agregarViaje:', error);
        return throwError(() => error);
      })
    );
  }

  obtenerViaje(id?: number, id_usuario?: number): Observable<any> {
    let params = new HttpParams()
      .set('token', this.firebaseConfig.apiKey);
    
    if (id) params = params.set('p_id', id.toString());
    if (id_usuario) params = params.set('p_id_usuario', id_usuario.toString());

    return this.http.get(`${this.apiUrl}viaje/obtener`, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error en obtenerViaje:', error);
        return throwError(() => error);
      })
    );
  }

  actualizarEstadoViaje(id: number, id_estado: number): Observable<any> {
    const body = {
      p_id: id,
      p_id_estado: id_estado,
      token: this.firebaseConfig.apiKey
    };

    return this.http.post(`${this.apiUrl}viaje/actualiza_estado_viaje`, body).pipe(
      map(response => {
        this.actualizarEstadoViajeLocal(id, id_estado);
        return response;
      }),
      catchError(error => {
        console.error('Error en actualizarEstadoViaje:', error);
        return throwError(() => error);
      })
    );
  }

  async guardarViajeLocal(viaje: Viaje): Promise<void> {
    try {
      let viajes = await this.obtenerViajesLocal();
      if (!viajes) viajes = [];
      viajes.push(viaje);
      await this.storage.set('viajes_usuario', viajes);
    } catch (error) {
      console.error('Error al guardar viaje en storage:', error);
      throw error;
    }
  }

  async obtenerViajesLocal(): Promise<Viaje[]> {
    try {
      const viajes = await this.storage.get('viajes_usuario');
      return viajes || [];
    } catch (error) {
      console.error('Error al obtener viajes de storage:', error);
      throw error;
    }
  }

  async actualizarEstadoViajeLocal(id: number, estado: number): Promise<void> {
    try {
      let viajes = await this.obtenerViajesLocal();
      viajes = viajes.map(v => {
        if (v.id === id) {
          return { ...v, estado };
        }
        return v;
      });
      await this.storage.set('viajes_usuario', viajes);
    } catch (error) {
      console.error('Error al actualizar estado de viaje en storage:', error);
      throw error;
    }
  }
}