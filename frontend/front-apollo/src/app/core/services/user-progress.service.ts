import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Auth, user, User } from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { take } from 'rxjs/operators';

import { UserProgress, Chapter } from '../../shared/models/course.models';


@Injectable({
  providedIn: 'root'
})
export class UserProgressService {
  
  private currentUser: User | null = null;

  constructor(private firestore: Firestore, private auth: Auth) {
    user(this.auth).subscribe(user => {
      this.currentUser = user;
    });
  }

  getUserProgress(userId: string, courseId: string): Observable<UserProgress | undefined> {
    const progressDocRef = doc(this.firestore, 'userProgress', `${userId}_${courseId}`);
    return from(getDoc(progressDocRef)).pipe(
      map(docSnapshot => docSnapshot.exists() ? docSnapshot.data() as UserProgress : undefined)
    );
  }

  markChapterCompleted(userId: string, courseId: string, chapterId: string): Promise<void> {
    const progressDocRef = doc(this.firestore, 'userProgress', `${userId}_${courseId}`);
    return setDoc(progressDocRef, { userId: userId, courseId: courseId, completedChapters: { [chapterId]: true } }, { merge: true });
  }

  markCourseCompleted(userId: string, courseId: string): Promise<void> {
    const progressDocRef = doc(this.firestore, 'userProgress', `${userId}_${courseId}`);
    return setDoc(progressDocRef, { courseCompleted: true, completionDate: new Date() }, { merge: true });
  }

  getLoggedInUserCourseProgress(courseId: string): Observable<UserProgress | undefined> {
    return user(this.auth).pipe(
      switchMap(user => {
        if (user) {
          return this.getUserProgress(user.uid, courseId);
        } else {
          return of(undefined);
        }
      })
    );
  }

  // Method to check and mark the course as completed/incomplete
  checkAndMarkCourseCompleted(userId: string, courseId: string, totalChapters: Chapter[]): Promise<void> {
    const progressDocRef = doc(this.firestore, 'userProgress', `${userId}_${courseId}`);

    return from(getDoc(progressDocRef)).pipe(
      take(1), // Take only the first value
      switchMap(docSnapshot => {
        const userProgress = docSnapshot.exists() ? docSnapshot.data() as UserProgress : undefined;
        const completedChapters = userProgress?.completedChapters || {};
        const numberOfCompletedChapters = Object.keys(completedChapters).length;
        const totalNumberOfChapters = totalChapters.length;

        // A course with 0 chapters is not considered "completed"
        const isCourseCompleted = numberOfCompletedChapters === totalNumberOfChapters && totalNumberOfChapters > 0;

        // If the course completion status in Firestore needs to be updated
        if (docSnapshot.exists() && userProgress?.courseCompleted !== isCourseCompleted) {
             return setDoc(progressDocRef, {
                 courseCompleted: isCourseCompleted,
                 completionDate: isCourseCompleted ? new Date() : null // Set date if completed, null if unmarked
             }, { merge: true });
         } else if (!docSnapshot.exists() && isCourseCompleted) {
            // If the progress document doesn't exist and the course is now complete (rare, but possible if chapters are marked very quickly)
             return setDoc(progressDocRef, {
                userId: userId,
                courseId: courseId,
                completedChapters: completedChapters, // Include existing completed chapters
                courseCompleted: true,
                completionDate: new Date()
             }, { merge: true });
         }

        return Promise.resolve(); // No Firestore update needed
      })
    ).toPromise(); // Convert the resulting Observable back to a Promise
  }

  // Nuevo método para obtener el progreso de cursos completados de un usuario
  getCompletedCoursesProgress(userId: string): Observable<UserProgress[]> {
    const userProgressCollection = collection(this.firestore, 'userProgress');
    // Consultar documentos de progreso donde userId coincida Y courseCompleted sea true
    const q = query(userProgressCollection,
                    where('userId', '==', userId),
                    where('courseCompleted', '==', true));

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => doc.data() as UserProgress)) // Mapear a UserProgress (asumimos que el ID del documento no es crucial aquí)
    );
  }

  // TODO: Implement logic to check if course is completed based on completed chapters
}



