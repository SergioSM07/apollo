import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { authGuard } from './core/guards/auth-guard';
import { DashboardComponent } from './features/dashboard/dashboard';
import { ModulesListComponent } from './features/courses/modules-list/modules-list';
import { ModuleDetailComponent } from './features/courses/module-detail/module-detail';
import { CourseDetailComponent } from './features/courses/course-detail/course-detail';
import { ProfileComponent } from './features/profile/profile';
import { ContentUploadComponent } from './features/content-upload/content-upload';
import { AdminGuard } from './core/guards/admin.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout';


export const routes: Routes = [
  // Rutas de Autenticación (SIN el Layout Principal)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Ruta principal que utiliza el Layout
  {
    path: '', // La ruta principal será el punto de entrada al layout
    component: MainLayoutComponent,
    canActivate: [authGuard], // Proteger el acceso al layout mismo
    children: [ // Rutas Hijas que se cargarán DENTRO del <router-outlet> del Layout
      { path: 'dashboard', component: DashboardComponent },
      { path: 'courses/modules', component: ModulesListComponent },
      { path: 'courses/modules/:moduleId', component: ModuleDetailComponent },
      { path: 'courses/courses/:courseId', component: CourseDetailComponent },
      { path: 'profile', component: ProfileComponent },
      // Ruta de subida de contenido (protegida adicionalmente por AdminGuard)
      {
        path: 'content-upload',
        component: ContentUploadComponent,
        canActivate: [AdminGuard] // AdminGuard se aplica AQUÍ como guardia hija
      },
      // Redirigir la ruta raíz protegida ('' dentro del layout) al dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // TODO: Add a wildcard route for 404 page
];