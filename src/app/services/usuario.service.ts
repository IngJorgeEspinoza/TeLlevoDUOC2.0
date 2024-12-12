import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
  private mapsKey = environment.mapsKey;
  private firebaseConfig = environment.firebaseConfig;

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) { }

  agregarUsuario(usuario: Usuario, imagen: File): Observable<any> {
    const formData = new FormData();
    formData.append('p_nombre', usuario.nombre);
    formData.append('p_correo_electronico', usuario.correo);
    formData.append('p_telefono', usuario.telefono);
    formData.append('token', this.firebaseConfig.apiKey);
    formData.append('image_usuario', imagen);

    return this.http.post(`${this.apiUrl}user/agregar`, formData).pipe(
      map(response => {
        this.guardarUsuarioLocal(usuario);
        return response;
      }),
      catchError(error => {
        console.error('Error en agregarUsuario:', error);
        return throwError(() => error);
      })
    );
  }

  obtenerUsuario(correo?: string, id?: number): Observable<any> {
    let params = new HttpParams()
      .set('token', this.firebaseConfig.apiKey);
    
    if (correo) params = params.set('p_correo', correo);
    if (id) params = params.set('p_id', id.toString());

    return this.http.get(`${this.apiUrl}user/obtener`, { params }).pipe(
      map(response => {
        return response;
      }),
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
}