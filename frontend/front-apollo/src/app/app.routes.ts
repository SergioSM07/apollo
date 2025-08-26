import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { authGuard } from './core/guards/auth-guard'; // Importar authGuard
import { DashboardComponent } from './features/dashboard/dashboard';
// TODO: Create these components and their directories
import { ModulesListComponent } from './features/courses/modules-list/modules-list'; // Importar ModulesListComponent
import { ModuleDetailComponent } from './features/courses/module-detail/module-detail'; // Importar ModuleDetailComponent
import { CourseDetailComponent } from './features/courses/course-detail/course-detail'; // Importar CourseDetailComponent

export const routes: Routes = [ // Importar un componente de ejemplo para ruta protegida
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // Ruta protegida: Ejemplo de dashboard
 {
    path: 'dashboard',
    component: DashboardComponent, // Usar un componente para la ruta protegida
    canActivate: [authGuard] // Aplicar el guardia aquí
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }, // Redirigir de la raíz a dashboard (ahora protegido)
  // Rutas protegidas para el Portal de Capacitaciones
  {
    path: 'courses/modules',
    component: ModulesListComponent, // Componente para la lista de módulos
    canActivate: [authGuard] // Aplicar el guardia aquí
  },
  {
    path: 'courses/modules/:moduleId',
    component: ModuleDetailComponent, // Componente para el detalle del módulo/lista de cursos
    canActivate: [authGuard] // Aplicar el guardia aquí
  },
  {
    path: 'courses/courses/:courseId',
    component: CourseDetailComponent, // Componente para el detalle del curso/lista de capítulos
    canActivate: [authGuard] // Aplicar el guardia aquí
  },
  // TODO: Add a wildcard route for 404 page
  // TODO: Refine protected routes structure (e.g., child routes)
];
