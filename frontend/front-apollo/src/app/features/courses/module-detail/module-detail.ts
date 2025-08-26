import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CoursesService } from '../../../core/services/courses.service';
import { Course } from '../../../shared/models/course.models';
import { Observable, switchMap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-module-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, RouterModule],
  templateUrl: './module-detail.html',
  styleUrl: './module-detail.scss',
})
export class ModuleDetailComponent {
  courses$: Observable<Course[]>; // Observable para la lista de cursos
  moduleName: string | undefined; // Propiedad para almacenar el nombre del módulo (Opcional, requiere obtener el módulo)

  constructor(
    private route: ActivatedRoute, // Inyectar ActivatedRoute
    private coursesService: CoursesService // Inyectar CoursesService
  ) {
    // Obtener el moduleId del parámetro de ruta y luego obtener los cursos
    this.courses$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const moduleId = params.get('moduleId');
        if (moduleId) {
          // TODO: Optionally get module details here to display module name
          // For now, just get courses by module ID
          return this.coursesService.getCoursesByModule(moduleId);
        } else {
          // Handle case where moduleId is not available (e.g., return empty array or throw error)
          return new Observable<Course[]>(); // Retornar un observable vacío
        }
      })
    );

    // TODO: Fetch module details to display module name
    // This would involve another call to coursesService.getModuleDetails(moduleId)
  }
}
