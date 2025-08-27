import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private firestore: Firestore, private auth: Auth) { }

  getCurrentUserRole(): Observable<string | null> {
    return user(this.auth).pipe(
      switchMap(user => {
        if (user) {
          const userDocRef = doc(this.firestore, 'users', user.uid);
          return from(getDoc(userDocRef)).pipe(
            map(docSnapshot => {
              if (docSnapshot.exists()) {
                const userData = docSnapshot.data() as any;
                return userData['role'] || null;
              } else {
                console.warn(`User document not found for UID: ${user.uid}`);
                return null;
              }
            })
          );
        } else {
          return of(null);
        }
      })
    );
  }

  // TODO: Add methods to create/update user documents in Firestore (e.g., when a user registers)
}