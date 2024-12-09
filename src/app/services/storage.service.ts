import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // Si ya está inicializado, no hacemos nada
    if (this._storage !== null) {
      return;
    }
    // Crear el storage
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Guardar un dato
  async set(key: string, value: any) {
    await this._storage?.set(key, value);
  }

  // Obtener un dato
  async get(key: string) {
    return await this._storage?.get(key);
  }

  // Eliminar un dato
  async remove(key: string) {
    await this._storage?.remove(key);
  }

  // Limpiar todo el storage
  async clear() {
    await this._storage?.clear();
  }
}