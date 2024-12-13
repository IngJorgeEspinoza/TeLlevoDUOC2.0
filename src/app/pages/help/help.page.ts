import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

interface Faq {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {
  faqs: Faq[] = [
    {
      question: '¿Cómo puedo crear una cuenta en Te Llevo DUOC?',
      answer: 'Para crear una cuenta, dirígete a la sección de registro en la aplicación. Completa el formulario con tu correo institucional, una contraseña segura y la información personal requerida.',
      isOpen: false
    },
    {
      question: '¿Qué hago si olvidé mi contraseña?',
      answer: 'Si olvidaste tu contraseña, ve a la sección de recuperación en la pantalla de inicio de sesión. Ingresa tu correo electrónico institucional y recibirás un enlace para restablecer tu contraseña.',
      isOpen: false
    },
    {
      question: '¿Cómo registrar un vehículo?',
      answer: 'Para registrar un vehículo, accede a la sección "Mis Vehículos" desde el menú principal. Completa los datos requeridos como marca, modelo, año y patente.',
      isOpen: false
    },
    {
      question: '¿Cómo ofrecer un viaje?',
      answer: 'Si tienes un vehículo registrado, ve a la pestaña "Viajes" y selecciona "Nuevo Viaje". Define el destino, costo y horario.',
      isOpen: false
    },
    {
      question: '¿Cómo tomar un viaje?',
      answer: 'En la pestaña "Mapa", verás los viajes disponibles. Selecciona uno que te interese y confirma tu reserva.',
      isOpen: false
    }
  ];

  contactEmail: string = 'ma.henriquezq@duocuc.cl';

  constructor(private platform: Platform) { }

  ngOnInit() {}

  toggleAnswer(faq: Faq): void {
    faq.isOpen = !faq.isOpen;
  }

  openWhatsApp(): void {
    const phoneNumber = '+56991379473';
    const message = 'Hola, necesito ayuda con Te Llevo DUOC.';

    if (this.platform.is('capacitor')) {
      window.open(`whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`, '_system');
    } else {
      window.open(`https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
    }
  }
}