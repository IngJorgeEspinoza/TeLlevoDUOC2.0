import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private firebaseConfig = environment.firebaseConfig;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    try {
      const storage = await this.storage.create();
      this._storage = storage;
    } catch (error) {
      console.error('Error al inicializar storage:', error);
      throw error;
    }
  }

  async set(key: string, value: any) {
    try {
      const encryptedValue = this.encryptData(value);
      const result = await this._storage?.set(key, encryptedValue);
      return result;
    } catch (error) {
      console.error('Error al guardar en storage:', error);
      throw error;
    }
  }

  async get(key: string) {
    try {
      const value = await this._storage?.get(key);
      if (!value) return null;
      return this.decryptData(value);
    } catch (error) {
      console.error('Error al obtener de storage:', error);
      throw error;
    }
  }

  async remove(key: string) {
    try {
      await this._storage?.remove(key);
    } catch (error) {
      console.error('Error al eliminar de storage:', error);
      throw error;
    }
  }

  async clear() {
    try {
      await this._storage?.clear();
    } catch (error) {
      console.error('Error al limpiar storage:', error);
      throw error;
    }
  }

  async keys() {
    try {
      const keys = await this._storage?.keys();
      return keys;
    } catch (error) {
      console.error('Error al obtener keys de storage:', error);
      throw error;
    }
  }

  // Método simple de encriptación para datos sensibles
  private encryptData(data: any): any {
    try {
      // Si es un objeto o array, convertirlo a string
      const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
      // Encriptación básica usando Base64
      return btoa(stringData);
    } catch (error) {
      console.error('Error al encriptar datos:', error);
      return data;
    }
  }

  // Método simple de desencriptación
  private decryptData(encryptedData: any): any {
    try {
      // Desencriptación básica desde Base64
      const decryptedString = atob(encryptedData);
      // Intentar parsear como JSON si es posible
      try {
        return JSON.parse(decryptedString);
      } catch {
        return decryptedString;
      }
    } catch (error) {
      console.error('Error al desencriptar datos:', error);
      return encryptedData;
    }
  }

  // Método para verificar si el storage está listo
  async isReady(): Promise<boolean> {
    return this._storage !== null;
  }

  // Método para obtener el espacio usado
  async getSize(): Promise<number> {
    try {
      const keys = await this.keys();
      if (!keys) return 0;
      
      let totalSize = 0;
      for (const key of keys) {
        const value = await this._storage?.get(key);
        totalSize += new Blob([JSON.stringify(value)]).size;
      }
      return totalSize;
    } catch (error) {
      console.error('Error al obtener tamaño del storage:', error);
      return 0;
    }
  }
}