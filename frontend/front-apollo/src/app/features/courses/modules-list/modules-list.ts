import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoursesService } from '../../../core/services/courses.service';
import { Module } from '../../../shared/models/course.models';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-modules-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, RouterModule],
  templateUrl: './modules-list.html',
  styleUrl: './modules-list.scss'
})
export class ModulesListComponent {
  modules$: Observable<Module[]>;

  constructor(private coursesService: CoursesService, private router: Router) {
    this.modules$ = this.coursesService.getModules();
  }

  navigateToModule(moduleId: string): void {
    console.log('Navigating to module:', moduleId);
    this.router.navigate(['/courses/modules', moduleId]);
  }
}

