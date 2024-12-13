import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Usuario } from '../interfaces/usuario.interface';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = environment.apiUrl;
  private token = environment.firebaseConfig.apiKey;

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) { }

  agregarUsuario(usuario: Usuario, imagen: File): Observable<any> {
    const formData = new FormData();
    
    // Agregar los campos requeridos exactamente como los espera la API
    formData.append('p_nombre', usuario.nombre);
    formData.append('p_correo_electronico', usuario.correo);
    formData.append('p_telefono', usuario.telefono);
    formData.append('token', this.token);
    formData.append('image_usuario', imagen);

    const headers = new HttpHeaders();
    // No establecer Content-Type, dejando que el navegador lo configure con el boundary correcto para FormData

    return this.http.post(`${this.apiUrl}user/agregar`, formData, { headers }).pipe(
      map(response => {
        console.log('Respuesta exitosa de la API:', response);
        this.guardarUsuarioLocal(usuario);
        return response;
      }),
      catchError(error => {
        console.error('Error detallado:', error);
        console.error('Request enviado:', {
          url: `${this.apiUrl}user/agregar`,
          formData: Array.from(formData.entries())
        });
        return throwError(() => error);
      })
    );
  }

  obtenerUsuario(correo?: string, id?: number): Observable<any> {
    let params = new HttpParams()
      .set('token', this.firebaseConfig.apiKey);
    
    if (id) {
      params = params.set('p_id', id.toString());
    } else if (correo) {
      params = params.set('p_correo', correo);
    }

    return this.http.get(`${this.apiUrl}user/obtener`, { params }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error en obtenerUsuario:', error);
        return throwError(() => error);
      })
    );
  }

  async guardarUsuarioLocal(usuario: Usuario): Promise<void> {
    try {
      await this.storage.set('usuario_actual', usuario);
    } catch (error) {
      console.error('Error al guardar usuario en storage:', error);
      throw error;
    }
  }

  async obtenerUsuarioLocal(): Promise<Usuario | null> {
    try {
      return await this.storage.get('usuario_actual');
    } catch (error) {
      console.error('Error al obtener usuario de storage:', error);
      throw error;
    }
  }

  async eliminarUsuarioLocal(): Promise<void> {
    try {
      await this.storage.remove('usuario_actual');
    } catch (error) {
      console.error('Error al eliminar usuario de storage:', error);
      throw error;
    }
  }
}