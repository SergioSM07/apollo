import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service'; // Importar AuthService
import { Router } from '@angular/router'; // Importar Router
import { MatButtonModule } from '@angular/material/button'; // Importar MatButtonModule
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule // Añadir MatButtonModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent { // Cambiado de 'App' a 'DashboardComponent'
  // Puedes suscribirte al estado de autenticación aquí para mostrar info del usuario
  user$: Observable<User | null>;  // Observable del estado de autenticación

  constructor(private authService: AuthService, private router: Router) { 
    this.user$ = this.authService.getAuthState();
  } // Inyectar AuthService y Router

  logout() {
    this.authService.logout() // Llamar al método de cierre de sesión del servicio
      .then(() => {
        console.log('Logout successful!');
        this.router.navigate(['/login']); // Redirigir al login después del cierre de sesión
      })
      .catch((error) => {
        console.error('Logout failed:', error);
        // TODO: Mostrar un mensaje de error si el cierre de sesión falla
      });
  }
}
