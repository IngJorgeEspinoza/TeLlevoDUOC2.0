export interface Viaje {
  id?: number;
  id_usuario: number;
  ubicacion_origen: string;
  ubicacion_destino: string;
  costo: number;
  id_vehiculo: number;
  estado?: number; // 1: Activo, 2: En progreso, 3: Finalizado
}