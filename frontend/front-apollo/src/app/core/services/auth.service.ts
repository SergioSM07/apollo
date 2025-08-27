import { Injectable } from '@angular/core';
import { Auth, authState, signOut, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authState: Observable<User | null>;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.authState = authState(this.auth);
  }

  // Método para registrar un nuevo usuario con correo y contraseña
  register(email: string, password: string): Promise<User | null> {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then(async credential => {
        console.log('User registered:', credential.user);
        // Crear documento de usuario en Firestore después del registro
        await this.createUserDocument(credential.user);
        return credential.user;
      })
      .catch(error => {
        console.error('Registration failed:', error);
        throw error; // Propagar el error
      });
  }

  // Método para iniciar sesión con correo y contraseña
  login(email: string, password: string): Promise<User | null> {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(async credential => {
        console.log('User logged in:', credential.user);
        // Verificar y crear documento de usuario en Firestore después del login si no existe
        await this.ensureUserDocumentExists(credential.user);
        return credential.user;
      })
      .catch(error => {
        console.error('Login failed:', error);
        throw error;
      });
  }

  // Método para cerrar sesión
  logout(): Promise<void> {
    return signOut(this.auth)
      .then(() => {
        console.log('User logged out');
      })
      .catch(error => {
        console.error('Logout failed:', error);
        throw error;
      });
  }

  // Método para obtener el estado actual de autenticación
  getAuthState(): Observable<User | null> {
    return this.authState;
  }

  // Método para crear un documento de usuario en Firestore
  private async createUserDocument(user: User): Promise<void> {
    const userRef = doc(this.firestore, 'users', user.uid);
    // setDoc con merge: true para evitar sobrescribir si ya existe (ej: si se registra y luego se llama aquí de nuevo)
    // Aunque en el registro puro, no debería existir.
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      role: 'user' // Rol por defecto
      // TODO: Add other initial user data if needed
    }, { merge: true });
     console.log(`User document created/updated for UID: ${user.uid}`);
  }

  // Método para asegurar que el documento de usuario existe (crear si no existe)
  private async ensureUserDocumentExists(user: User): Promise<void> {
      const userRef = doc(this.firestore, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
          // Si el documento no existe, crearlo con datos iniciales
           await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              role: 'user' // Rol por defecto
              // TODO: Add other initial user data if needed
          });
           console.log(`User document created for new login UID: ${user.uid}`);
      } else {
          console.log(`User document already exists for UID: ${user.uid}`);
      }
  }
}