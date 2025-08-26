import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, query, where } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

// Importar interfaces desde el archivo compartido
import { Module, Course, Chapter } from '../../shared/models/course.models';


@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  constructor(private firestore: Firestore) { }

  // TODO: Refine data transformations (remove 'as any') once Firestore collection structures are finalized

  // Método para obtener todos los módulos
  getModules(): Observable<Module[]> {
    const modulesCollection = collection(this.firestore, 'modules');
    return from(getDocs(modulesCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => {
        const data = doc.data() as any; return { id: doc.id, name: data['name'], ...data };
      }))
    );
  }

  // Método para obtener los cursos de un módulo específico
  getCoursesByModule(moduleId: string): Observable<Course[]> {
    const coursesCollection = collection(this.firestore, 'courses');
    const q = query(coursesCollection, where('moduleId', '==', moduleId));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => {
        const data = doc.data() as any; return { id: doc.id, name: data['name'], moduleId: data['moduleId'], ...data };
      }))
    );
  }

  // Método para obtener los detalles de un curso específico
  getCourseDetails(courseId: string): Observable<Course | undefined> {
    const courseDocRef = doc(this.firestore, 'courses', courseId);
    return from(getDoc(courseDocRef)).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as any; return { id: docSnapshot.id, name: data['name'], moduleId: data['moduleId'], ...data };
        } else { return undefined; }
      })
    );
  }

  // Método para obtener los capítulos de un curso específico
  getChaptersByCourse(courseId: string): Observable<Chapter[]> {
    const chaptersCollection = collection(this.firestore, 'chapters');
    const q = query(chaptersCollection, where('courseId', '==', courseId));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => {
        const data = doc.data() as any; // Usar any temporalmente
        return { id: doc.id, name: data['name'], courseId: data['courseId'], ...data }; // Combinar el ID del documento con campos específicos y luego el resto de los datos
      }))
    );
  }

  // TODO: Add methods for subida de contenido, seguimiento de progreso, insignias, notificaciones
}
