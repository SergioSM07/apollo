import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { Auth, user } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private router: Router,
    private auth: Auth
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // TODO: Handle case where user is not logged in if authGuard is not applied before
    // If authGuard IS applied before, request.auth will not be null here.

    return this.userService.getCurrentUserRole().pipe(
      take(1),
      map(role => {
        if (role === 'admin') {
          console.log('AdminGuard: Access granted.');
          return true;
        } else {
          console.warn('AdminGuard: Access denied. User role:', role);
          return this.router.createUrlTree(['/dashboard']);
        }
      })
    );
  }
}