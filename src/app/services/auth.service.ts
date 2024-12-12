import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, authState, sendPasswordResetEmail, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public authState$ = authState(this.auth);

  constructor(
    private auth: Auth,
    private router: Router,
    private storage: StorageService
  ) {}

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.storage.set('user', userCredential.user);
      this.router.navigate(['/home']);
    } catch (error) {
      throw error;
    }
  }

  async registro(email: string, password: string): Promise<any> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async recuperarPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      await this.storage.remove('user');
      this.router.navigate(['/login']);
    } catch (error) {
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.storage.get('user');
    return user !== null;
  }
}