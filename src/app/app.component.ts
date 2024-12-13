import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  async initializeApp() {
    try {
      if (this.platform.is('capacitor')) {
        await StatusBar.setBackgroundColor({ color: '#00162b' });
        await SplashScreen.hide();
      }
    } catch (err) {
      console.error('Error in initializeApp:', err);
    }
  }
}