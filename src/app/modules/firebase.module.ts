import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initializeApp } from '@angular/fire/app';
import { getAuth } from '@angular/fire/auth';
import { getFirestore } from '@angular/fire/firestore';
import { getStorage } from '@angular/fire/storage';
import { environment } from '../../environments/environment';
import { IonicModule } from '@ionic/angular';
import { FirebaseAppModule, provideFirebaseApp } from '@angular/fire/app';
import { AuthModule, provideAuth } from '@angular/fire/auth';
import { FirestoreModule, provideFirestore } from '@angular/fire/firestore';
import { StorageModule, provideStorage } from '@angular/fire/storage';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    IonicModule,
    FirebaseAppModule,
    AuthModule,
    FirestoreModule,
    StorageModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ],
  exports: [
    FirebaseAppModule,
    AuthModule,
    FirestoreModule,
    StorageModule
  ]
})
export class FirebaseModule { }