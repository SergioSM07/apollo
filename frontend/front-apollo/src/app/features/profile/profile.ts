import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { BadgesService } from '../../core/services/badges.service';
import { User } from '@angular/fire/auth';
import { Badge, UserBadge, UserProgress, Course } from '../../shared/models/course.models'; // Importar UserProgress y Course
import { Observable, Subscription, combineLatest, map, switchMap, of, filter } from 'rxjs'; // Importar filter
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { UserProgressService } from '../../core/services/user-progress.service'; // Importar UserProgressService
import { CoursesService } from '../../core/services/courses.service'; // Importar CoursesService

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatGridListModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnDestroy {
  user$: Observable<User | null>;
  obtainedBadgesWithDetails$: Observable<(UserBadge & { badgeDetails?: Badge })[]>;
  completedCoursesHistory$: Observable<(UserProgress & { courseDetails?: Course })[]>; // Nuevo observable para historial de cursos completados
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private badgesService: BadgesService,
    private userProgressService: UserProgressService, // Inyectar UserProgressService
    private coursesService: CoursesService // Inyectar CoursesService
  ) {
    this.user$ = this.authService.getAuthState();

    const allBadges$ = this.badgesService.getAllBadges();

    this.obtainedBadgesWithDetails$ = this.user$.pipe(
      switchMap(user => {
        if (user) {
          const userBadges$ = this.badgesService.getUserObtainedBadges(user.uid);
          return combineLatest([userBadges$, allBadges$]).pipe(
            map(([userBadges, allBadges]) => {
              return userBadges.map(userBadge => ({
                ...userBadge,
                badgeDetails: allBadges.find(badge => badge.id === userBadge.badgeId)
              }));
            })
          );
        } else {
          return of([]);
        }
      })
    );

    // Obtener todo el progreso del usuario loggeado
    const allUserProgress$ = this.user$.pipe(
      switchMap(user => {
        if (user) {
          // Asumimos que getCompletedCoursesProgress(userId) existe y retorna Observable<UserProgress[]>
          return this.userProgressService.getCompletedCoursesProgress(user.uid); // Asumimos este método existe
        } else {
          return of([]); // Si no hay usuario, retornar array vacío
        }
      })
    );

    // Obtener detalles de todos los cursos (para obtener nombres, etc.)
    const allCourses$ = this.coursesService.getAllCourses(); // Asumimos que getAllCourses() existe en CoursesService

    // Combinar progreso de cursos completados con detalles de cursos
    this.completedCoursesHistory$ = combineLatest([allUserProgress$, allCourses$]).pipe(
      map(([userProgressEntries, allCourses]) => {
        return userProgressEntries.map(progressEntry => ({
          ...progressEntry,
          // Encontrar los detalles completos del curso completado
          courseDetails: allCourses.find(course => course.id === progressEntry.courseId)
        }));
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  formatObtainedDate(date: Date): string {
    // TODO: Implement date formatting logic
     if (!date) return 'N/A';
    return date.toLocaleDateString(); // Ejemplo de formato localizado
  }

  formatCompletionDate(date: Date | undefined): string {
      if (!date) return 'N/A';
      return date.toLocaleDateString(); // Ejemplo de formato localizado
  }
}
