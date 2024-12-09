export interface Vehiculo {
    id?: number;
    id_usuario: number;
    patente: string;
    marca: string;
    modelo: string;
    anio: number;
    color: string;
    tipo_combustible: string;
    imagen?: string;
  }