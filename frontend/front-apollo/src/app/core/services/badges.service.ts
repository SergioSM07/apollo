import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, doc, setDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

import { Badge, UserBadge } from '../../shared/models/course.models';


@Injectable({
  providedIn: 'root'
})
export class BadgesService {

 constructor(private firestore: Firestore) { }

  // TODO: Refine data transformations (remove 'as any') once Firestore collection structures are finalized

  // Método para obtener todas las insignias disponibles
  getAllBadges(): Observable<Badge[]> {
    const badgesCollection = collection(this.firestore, 'badges');
    // Adjust data transformation to explicitly include doc.id
    return from(getDocs(badgesCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => {
        const data = doc.data() as any; // Usar any temporalmente
        return { id: doc.id, name: data['name'], description: data['description'], imageUrl: data['imageUrl'], criteria: data['criteria'], ...data }; // Combinar el ID del documento con campos específicos y luego el resto de los datos
      }))
    );
  }

  // Método para obtener las insignias obtenidas por un usuario específico
  getUserObtainedBadges(userId: string): Observable<UserBadge[]> {
    const userBadgesCollection = collection(this.firestore, 'userBadges');
    const q = query(userBadgesCollection, where('userId', '==', userId));
    // Adjust data transformation to explicitly include doc.id
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => {
        const data = doc.data() as any; // Usar any temporalmente
        return { id: doc.id, userId: data['userId'], badgeId: data['badgeId'], obtainedDate: data['obtainedDate'], courseId: data['courseId'], ...data }; // Combinar el ID del documento con campos específicos y luego el resto de los datos
      }))
    );
  }

}