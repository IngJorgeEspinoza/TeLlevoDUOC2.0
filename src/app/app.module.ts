import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';

// Componentes
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Módulos personalizados
import { FirebaseModule } from './modules/firebase.module';

// Storage
import { IonicStorageModule } from '@ionic/storage-angular';

// Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Google Maps
import { GoogleMapsModule } from '@angular/google-maps';

// Service Worker para PWA
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, 
    IonicModule.forRoot({
      mode: 'md',
      backButtonText: 'Volver'
    }), 
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleMapsModule,
    IonicStorageModule.forRoot({
      name: 'tellevoduoc_db',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
    FirebaseModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }