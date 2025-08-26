import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, addDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL, StorageReference } from '@angular/fire/storage';
import { Course, Chapter } from '../../shared/models/course.models';
import { from, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContentManagementService {

  constructor(private firestore: Firestore, private storage: Storage) { }

  // Método para subir un archivo a Cloud Storage
  uploadFile(filePath: string, file: File): Observable<number | string> {
    const storageRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Observable<number | string>(subscriber => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          subscriber.next(progress);
        },
        (error) => {
          subscriber.error(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            subscriber.next(downloadURL);
            subscriber.complete();
          });
        }
      );
    }).pipe(
      finalize(() => console.log('File upload process completed.'))
    );
  }

  // Método para crear un nuevo documento de curso en Firestore
  createCourse(courseData: Omit<Course, 'id'>): Promise<string> {
    const coursesCollection = collection(this.firestore, 'courses');
    return addDoc(coursesCollection, courseData).then(docRef => docRef.id);
  }

  // Método para crear un nuevo documento de capítulo en Firestore
  createChapter(chapterData: Omit<Chapter, 'id'>): Promise<string> {
    const chaptersCollection = collection(this.firestore, 'chapters');
    return addDoc(chaptersCollection, chapterData).then(docRef => docRef.id);
  }

  // Método para crear un curso y sus capítulos, incluyendo subida de archivos
  // contentData podría ser un array de objetos representando los capítulos con su contenido
  async createCourseWithChapters(courseData: Omit<Course, 'id'>, chaptersContent: Array<{ name: string; type: string; file?: File; content?: string; }>): Promise<string> {
    try {
      // 1. Crear el documento del curso en Firestore
      const courseId = await this.createCourse(courseData);
      console.log('Course document created with ID:', courseId);

      // 2. Procesar y crear cada capítulo
      for (const chapterContent of chaptersContent) {
        let chapterData: Omit<Chapter, 'id'> = {
          name: chapterContent.name,
          courseId: courseId,
          type: chapterContent.type,
          url: undefined,
          content: undefined
        };

        if (chapterContent.type !== 'text' && chapterContent.file) {
          const filePath = `course-content/${courseId}/${chapterContent.name}_${Date.now()}.${chapterContent.file.name.split('.').pop()}`;
          console.log('Uploading file for chapter:', chapterContent.name);
          // Nota: toPromise() está deprecado en RxJS 7+. Considerar usar lastValueFrom o firstValueFrom.
          const downloadURL = await this.uploadFile(filePath, chapterContent.file).toPromise() as string;
          chapterData.url = downloadURL;
          console.log('File uploaded, download URL:', downloadURL);
        } else if (chapterContent.type === 'text' && chapterContent.content !== undefined) {
          chapterData.content = chapterContent.content;
          console.log('Storing text content for chapter:', chapterContent.name);
        } else {
            console.warn(`Chapter ${chapterContent.name}: Content type ${chapterContent.type} specified, but no file or text content provided.`);
            continue;
        }

        // 3. Crear el documento del capítulo en Firestore
        const chapterId = await this.createChapter(chapterData);
        console.log('Chapter document created with ID:', chapterId);
      }

      return courseId;
    } catch (error) {
      console.error('Error creating course with chapters:', error);
      throw error;
    }
  }

  // TODO: Add methods for updating and deleting courses/chapters
}