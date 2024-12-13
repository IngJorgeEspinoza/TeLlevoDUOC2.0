import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private authService: AuthService,
    private storageService: StorageService
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    try {
      await this.storageService.init();
      if (this.platform.is('capacitor')) {
        await StatusBar.setBackgroundColor({ color: '#00162b' });
        await SplashScreen.hide();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }
}