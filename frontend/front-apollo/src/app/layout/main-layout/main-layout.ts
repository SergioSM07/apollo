import { Component, OnDestroy } from '@angular/core'; // Importar OnDestroy
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Importar Router
import { Observable, Subscription, combineLatest, of } from 'rxjs'; // Importar combineLatest, of
import { map, switchMap, tap } from 'rxjs/operators'; // Importar operadores

// Importar módulos de Angular Material para el layout
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Importar servicios de autenticación y usuario
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '@angular/fire/auth'; // Importar User


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Añadir RouterModule
    MatToolbarModule, // Añadir MatToolbarModule
    MatSidenavModule, // Añadir MatSidenavModule
    MatListModule, // Añadir MatListModule
    MatIconModule, // Añadir MatIconModule
    MatButtonModule // Añadir MatButtonModule
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent implements OnDestroy { // Implementar OnDestroy

  isAuthenticated$: Observable<boolean>; // Observable para el estado de autenticación
  isAdmin$: Observable<boolean>; // Observable para verificar si el usuario es admin
  currentUser$: Observable<User | null>; // Observable para el usuario loggeado
  private subscriptions: Subscription[] = []; // Para gestionar suscripciones

  // TODO: Add logic for responsive sidenav (optional)
  // TODO: Inject AuthService/UserService for user info/conditional navigation


  constructor(
    private router: Router, // Inyectar Router
    private authService: AuthService, // Inyectar AuthService
    private userService: UserService // Inyectar UserService
  ) {
    // Obtener el estado de autenticación
    this.currentUser$ = this.authService.getAuthState();
    this.isAuthenticated$ = this.currentUser$.pipe(
      map(user => !!user) // Mapear a true si hay usuario, false si es null
    );

    // Obtener el rol del usuario y verificar si es admin
    this.isAdmin$ = this.currentUser$.pipe(
      switchMap(user => {
        if (user) {
          // Si hay usuario, obtener su rol
          return this.userService.getCurrentUserRole().pipe(
             map(role => role === 'admin') // Mapear a true si el rol es 'admin'
          );
        } else {
          // Si no hay usuario, no es admin
          return of(false);
        }
      })
    );
  }

  ngOnDestroy() { // Implementar ngOnDestroy
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  // Método para cerrar sesión
  logout(): void {
    this.authService.logout()
      .then(() => {
        console.log('Logged out successfully');
        // Redirigir al login después de cerrar sesión
        this.router.navigate(['/login']);
      })
      .catch(error => {
        console.error('Logout failed:', error);
        // TODO: Show error message to user
      });
  }

}
