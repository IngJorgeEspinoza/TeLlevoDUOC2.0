import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'mapa',
        loadChildren: () => import('../mapa/mapa.module').then(m => m.MapaPageModule)
      },
      {
        path: 'viajes',
        loadChildren: () => import('../viajes/viajes.module').then(m => m.ViajesPageModule)
      },
      {
        path: 'vehiculos',
        loadChildren: () => import('../vehiculos/vehiculos.module').then(m => m.VehiculosPageModule)
      },
      {
        path: '',
        redirectTo: 'mapa',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}