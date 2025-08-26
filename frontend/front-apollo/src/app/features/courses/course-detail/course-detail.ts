import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CoursesService } from '../../../core/services/courses.service';
import { Course, Chapter } from '../../../shared/models/course.models'; // Importar interfaces Course y Chapter
// Importar combineLatest como función
import { Observable, switchMap, tap, map, of, combineLatest, Subscription } from 'rxjs'; // Importar Observable, switchMap, tap, map, of
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion'; // Importar MatExpansionModule para lista expandible
import { MatButtonModule } from '@angular/material/button'; // Importar MatButtonModule
import { SafeUrlPipe } from '../../../shared/pipes/safe-url-pipe';
import { UserProgressService } from '../../../core/services/user-progress.service'; // Importar UserProgressService
import { UserProgress } from '../../../shared/models/course.models'; // Importar UserProgress
import { MatCheckboxModule } from '@angular/material/checkbox'; // Importar MatCheckboxModule
import { Auth, user, User } from '@angular/fire/auth'; // Importar Auth, user, User

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatExpansionModule, MatButtonModule, RouterModule, SafeUrlPipe, MatCheckboxModule],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.scss'
})

export class CourseDetailComponent {
  course$: Observable<Course | undefined>; // Observable para los detalles del curso
  //userProgress$: Observable<UserProgress | undefined>;
  chaptersWithProgress$: Observable<(Chapter & { completed?: boolean })[]>;
  overallProgress$: Observable<{ completed: number; total: number }>; // Nuevo observable para el progreso general

  private currentUser: User | null = null; // Propiedad para almacenar el usuario actual
  private chapters: Chapter[] = []; // Propiedad para almacenar la lista total de capítulos
  private subscriptions: Subscription[] = []; // Para gestionar suscripciones

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService,
    private userProgressService: UserProgressService,
    private auth : Auth
  ) {
    // Obtener el courseId del parámetro de ruta
    const courseId$ = this.route.paramMap.pipe(
      map(params => params.get('courseId'))
    );

    // Obtener detalles del curso usando switchMap
    this.course$ = courseId$.pipe(
      switchMap(courseId => {
        if (courseId) {
          return this.coursesService.getCourseDetails(courseId);
        } else {
          return of(undefined);
        }
      })
    );

    // Obtener capítulos del curso usando switchMap
    const chapters$ = courseId$.pipe(
      switchMap(courseId => {
        if (courseId) {
          return this.coursesService.getChaptersByCourse(courseId);
        } else {
          return of([]);
        }
      }),
      tap(chapters => this.chapters = chapters)
    );

    // Obtener el progreso del usuario loggeado para este curso
    const userProgress$ = courseId$.pipe(
      switchMap(courseId => {
        if (courseId) {
          return this.userProgressService.getLoggedInUserCourseProgress(courseId);
        } else {
          return of(undefined);
        }
      })
    );

    // Combinar los observables de capítulos y progreso
    // Usar combineLatest como función aplicada a un array
    this.chaptersWithProgress$ = combineLatest([chapters$, userProgress$]).pipe( // Aquí se usa la función combineLatest
      map(([chapters, userProgress]) => {
        if (!chapters) return [];
        return chapters.map(chapter => ({
          ...chapter,
          completed: userProgress?.completedChapters?.[chapter.id] || false
        }));
      })
    );

    // Calcular el progreso general a partir de chaptersWithProgress$
    this.overallProgress$ = this.chaptersWithProgress$.pipe(
      map(chapters => {
        const completedChapters = chapters.filter(chapter => chapter.completed).length;
        const totalChapters = chapters.length;
        return { completed: completedChapters, total: totalChapters };
      })
    );

    // Suscribirse al estado de autenticación para obtener el usuario actual
    this.subscriptions.push(user(this.auth).subscribe(user => {
      this.currentUser = user;
    }));
  }

  ngOnDestroy() { // Implementar ngOnDestroy para desuscribirse
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleChapterCompletion(chapter: Chapter & { completed?: boolean }) {

    if (!this.currentUser) {
      console.error('User not logged in.');
      // TODO: Show a message to the user indicating they need to log in
      return;
    }

    if (chapter.completed === undefined) {
      chapter.completed = false;
    }

    // TODO: Get current user ID. Ensure user is logged in.
    const currentUserId = this.currentUser.uid; // Reemplazar con el ID del usuario loggeado
    const currentCourseId = this.route.snapshot.paramMap.get('courseId');

    if (currentUserId && currentCourseId) {
       this.userProgressService.markChapterCompleted(currentUserId, currentCourseId, chapter.id)
         .then(() => {
           console.log(`Chapter ${chapter.name} completion status updated`);
           // TODO: Check if course is now completed
           this.userProgressService.checkAndMarkCourseCompleted(this.currentUser!.uid, currentCourseId, this.chapters) // Usar this.currentUser!.uid (usamos '!' porque ya verificamos que no es null)
             .then(() => {
               console.log('Course completion status checked.');
               // TODO: Update UI if course completion status changes
             })
             .catch(error => {
               console.error('Error checking course completion status:', error);
               // TODO: Show error message to user
             });
         })
         .catch(error => {
           console.error('Error updating chapter completion status:', error);
           // TODO: Show error message to user
         });
    } else {
      console.error('User ID or Course ID is missing.');
      // TODO: Show error message to user
    }
  }
  // TODO: Add logic to display overall course progress (e.g., X of Y chapters completed)
  // TODO: Add method to mark a chapter as completed
}
