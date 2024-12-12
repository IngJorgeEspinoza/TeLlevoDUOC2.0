import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RecuperarPasswordPageRoutingModule } from './recuperar-password-routing.module';
import { RecuperarPasswordPage } from './recuperar-password.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RecuperarPasswordPageRoutingModule
  ],
  declarations: [RecuperarPasswordPage]
})
export class RecuperarPasswordPageModule {}