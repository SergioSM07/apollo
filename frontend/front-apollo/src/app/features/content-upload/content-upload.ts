import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card'; // Importar MatCardModule
import { MatIconModule } from '@angular/material/icon'; // Importar MatIconModule
import { ContentManagementService } from '../../core/services/content-management.service'; // Importar ContentManagementService
import { MatProgressBarModule } from '@angular/material/progress-bar'; // Importar MatProgressBarModule
import { MatSnackBar } from '@angular/material/snack-bar'; // Importar MatSnackBar para notificaciones
import { catchError, tap } from 'rxjs/operators'; // Importar operadores
import { of } from 'rxjs'; // Importar of

@Component({
  selector: 'app-content-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Añadir ReactiveFormsModule
    MatFormFieldModule, // Añadir MatFormFieldModule
    MatInputModule, // Añadir MatInputModule
    MatButtonModule, // Añadir MatButtonModule
    MatSelectModule, // Añadir MatSelectModule
    MatCardModule, // Añadir MatCardModule
    MatIconModule, // Añadir MatIconModule
    MatProgressBarModule // Añadir MatProgressBarModule
  ],
  templateUrl: './content-upload.html',
  styleUrl: './content-upload.scss'
})
export class ContentUploadComponent {
  uploadForm: FormGroup; // FormGroup principal

  // Opciones para los tipos de contenido de capítulo
  chapterTypes = [
    { value: 'video', viewValue: 'Video' },
    { value: 'pdf', viewValue: 'PDF' },
    { value: 'text', viewValue: 'Text' }
    // TODO: Add other content types as needed
  ];

  // Opciones para los módulos (esto eventualmente vendría de Firestore)
  moduleOptions = [
    { value: 'fullstack', viewValue: 'Fullstack Development' },
    { value: 'apis', viewValue: 'APIs e Integraciones' },
    { value: 'cloud', viewValue: 'Cloud' },
    { value: 'data', viewValue: 'Data Engineer' }
    // TODO: Fetch this from Firestore using CoursesService
  ];

  isUploading = false; // Indicador de si se está subiendo contenido
  uploadProgress: number = 0; // Progreso general de la subida (si implementamos seguimiento detallado)
  // O un mapa de progreso por capítulo si queremos mostrar progreso individual
  // chapterUploadProgress: { [index: number]: number } = {};

  constructor(private fb: FormBuilder, // Inyectar FormBuilder
    private contentManagementService: ContentManagementService, // Inyectar ContentManagementService
    private snackBar: MatSnackBar // Inyectar MatSnackBar
  ) {
    this.uploadForm = this.fb.group({
      course: this.fb.group({ // FormGroup para datos del curso
        name: ['', Validators.required],
        moduleId: ['', Validators.required]
      }),
      chapters: this.fb.array([]) // FormArray para la lista de capítulos
    });
  }

  // Getter para acceder al FormArray de capítulos fácilmente
  get chapters(): FormArray {
    return this.uploadForm.get('chapters') as FormArray;
  }

  // Método para crear un FormGroup para un nuevo capítulo
  private createChapterFormGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      file: [null], // Campo para el objeto File (para video, pdf)
      content: [''] // Campo para el contenido de texto
      // TODO: Add validation based on chapter type (e.g., file required for video/pdf, content required for text)
    });
  }

  // Método para añadir un nuevo capítulo al FormArray
  addChapter(): void {
    this.chapters.push(this.createChapterFormGroup());
  }

  // Método para eliminar un capítulo del FormArray por índice
  removeChapter(index: number): void {
    this.chapters.removeAt(index);
  }

  // Método para manejar el cambio en el input de archivo
  onFileSelected(event: any, chapterIndex: number): void {
    const file: File = event.target.files[0];
    if (file) {
      // Almacenar el objeto File en el control 'file' del FormGroup del capítulo
      this.chapters.at(chapterIndex).get('file')?.setValue(file);
      // TODO: Potentially display file name in the UI
      console.log(`File selected for chapter ${chapterIndex + 1}:`, file.name);
    }
  }


  // Método para manejar el envío del formulario
  onSubmit(): void {
    if (this.uploadForm.valid) {
      this.isUploading = true; // Indicar que la subida ha comenzado
      this.uploadProgress = 0; // Resetear progreso
      const formData = this.uploadForm.value;

      // Extraer datos del curso
      const courseData = formData.course;

      // Extraer datos y archivos de los capítulos
      const chaptersContent = formData.chapters.map((chapter: any, index: number) => ({
        name: chapter.name,
        type: chapter.type,
        file: chapter.file, // El objeto File está en el control 'file'
        content: chapter.content
      }));

      // Llamar al servicio para crear curso y capítulos
      this.contentManagementService.createCourseWithChapters(courseData, chaptersContent)
        .then(courseId => {
          console.log('Course and chapters created successfully with ID:', courseId);
          this.isUploading = false; // Subida completada
          this.uploadProgress = 100; // Marcar progreso como 100%
          this.snackBar.open('Course uploaded successfully!', 'Close', { duration: 3000 }); // Mostrar mensaje de éxito
          this.uploadForm.reset(); // Resetear el formulario
          this.chapters.clear(); // Limpiar el FormArray de capítulos
        })
        .catch(error => {
          console.error('Error during course upload:', error);
          this.isUploading = false; // Subida finalizada con error
          this.uploadProgress = 0; // Resetear progreso o mostrar último progreso conocido
          this.snackBar.open(`Error uploading course: ${error.message}`, 'Close', { duration: 5000 }); // Mostrar mensaje de error
        });

      // TODO: Implement detailed progress tracking by subscribing to uploadFile observable within createCourseWithChapters or here.
      // This would involve iterating over chapters and handling individual file upload observables.

    } else {
      // TODO: Show validation errors to the user
      console.log('Form is invalid.');
    }
  }
}

