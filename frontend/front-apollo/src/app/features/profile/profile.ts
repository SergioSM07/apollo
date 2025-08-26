import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { BadgesService } from '../../core/services/badges.service';
import { User } from '@angular/fire/auth';
import { Badge, UserBadge } from '../../shared/models/course.models';
import { Observable, Subscription, combineLatest, map, switchMap, of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';

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
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private badgesService: BadgesService
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

    // TODO: Add functionality to display user's course history
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  formatObtainedDate(date: Date): string {
    // TODO: Implement date formatting logic
    return date.toDateString();
  }
}
