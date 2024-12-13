import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Vehiculo } from '../interfaces/vehiculo.interface';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private apiUrl = environment.apiUrl;
  private firebaseConfig = environment.firebaseConfig;

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) { }

  agregarVehiculo(vehiculo: Vehiculo, imagen?: File): Observable<any> {
    const formData = new FormData();
    formData.append('p_id_usuario', vehiculo.id_usuario.toString());
    formData.append('p_patente', vehiculo.patente);
    formData.append('p_marca', vehiculo.marca);
    formData.append('p_modelo', vehiculo.modelo);
    formData.append('p_anio', vehiculo.anio.toString());
    formData.append('p_color', vehiculo.color);
    formData.append('p_tipo_combustible', vehiculo.tipo_combustible);
    formData.append('token', this.firebaseConfig.apiKey);
    
    if (imagen) {
      formData.append('image', imagen);
    }

    return this.http.post(`${this.apiUrl}vehiculo/agregar`, formData).pipe(
      map(response => {
        this.guardarVehiculoLocal(vehiculo);
        return response;
      }),
      catchError(error => {
        console.error('Error en agregarVehiculo:', error);
        return throwError(() => error);
      })
    );
  }

  obtenerVehiculo(id?: number): Observable<any> {
    let params = new HttpParams()
      .set('token', this.firebaseConfig.apiKey);
    
    if (id) {
      params = params.set('p_id', id.toString());
    }

    return this.http.get(`${this.apiUrl}vehiculo/obtener`, { params }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error en obtenerVehiculo:', error);
        return throwError(() => error);
      })
    );
  }

  async guardarVehiculoLocal(vehiculo: Vehiculo): Promise<void> {
    try {
      let vehiculos = await this.obtenerVehiculosLocal();
      if (!vehiculos) vehiculos = [];
      vehiculos.push(vehiculo);
      await this.storage.set('vehiculos_usuario', vehiculos);
    } catch (error) {
      console.error('Error al guardar vehículo en storage:', error);
      throw error;
    }
  }

  async obtenerVehiculosLocal(): Promise<Vehiculo[]> {
    try {
      const vehiculos = await this.storage.get('vehiculos_usuario');
      return vehiculos || [];
    } catch (error) {
      console.error('Error al obtener vehículos de storage:', error);
      throw error;
    }
  }

  async eliminarVehiculoLocal(id: number): Promise<void> {
    try {
      let vehiculos = await this.obtenerVehiculosLocal();
      vehiculos = vehiculos.filter(v => v.id !== id);
      await this.storage.set('vehiculos_usuario', vehiculos);
    } catch (error) {
      console.error('Error al eliminar vehículo de storage:', error);
      throw error;
    }
  }
}