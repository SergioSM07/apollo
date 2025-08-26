import { Injectable } from '@angular/core';
import { Auth, authState, signOut, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authState: Observable<User | null>;

  constructor(private auth: Auth) {
    this.authState = authState(this.auth);
  }

  // Método para registrar un nuevo usuario con correo y contraseña
  registerWithEmailAndPassword(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // Método para iniciar sesión con correo y contraseña
  loginWithEmailAndPassword(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Método para cerrar sesión
  logout() {
    return signOut(this.auth);
  }

  // Método para obtener el estado actual de autenticación
  getAuthState(): Observable<User | null> {
    return this.authState;
  }
}