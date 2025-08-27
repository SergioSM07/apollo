import { Component, OnDestroy } from '@angular/core'; // Importar OnDestroy
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators, AbstractControl, ValidatorFn } from '@angular/forms'; // Importar ValidatorFn
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card'; // Importar MatCardModule
import { MatIconModule } from '@angular/material/icon'; // Importar MatIconModule
import { ContentManagementService } from '../../core/services/content-management.service'; // Importar ContentManagementService
import { MatProgressBarModule } from '@angular/material/progress-bar'; // Importar MatProgressBarModule
import { MatSnackBar } from '@angular/material/snack-bar'; // Importar MatSnackBar
import { Subscription } from 'rxjs'; // Importar Subscription

// Validador personalizado para requerir un campo si otro tiene un valor específico
// No lo usaremos directamente en este enfoque, pero es una opción para validaciones cruzadas más complejas
// function requiredIfTypeIs(typeControlName: string, requiredControlName: string, requiredTypeValue: string): ValidatorFn {
//   return (formGroup: AbstractControl): { [key: string]: any } | null => {
//     const typeControl = formGroup.get(typeControlName);
//     const requiredControl = formGroup.get(requiredControlName);

//     if (!typeControl || !requiredControl) {
//       return null; // No aplicar validación si los controles no existen
//     }

//     if (typeControl.value === requiredTypeValue && !requiredControl.value) {
//       return { requiredIf: true }; // Devolver error si se cumple la condición y el campo está vacío
//     }

//     return null; // No hay error
//   };
// }
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
export class ContentUploadComponent implements OnDestroy { // Implementar OnDestroy
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
  private subscriptions: Subscription[] = []; // Para gestionar suscripciones
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

  ngOnDestroy() { // Implementar ngOnDestroy
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  // Getter para acceder al FormArray de capítulos fácilmente
  get chapters(): FormArray {
    return this.uploadForm.get('chapters') as FormArray;
  }

  // Nuevo getter que retorna los controles casteados como FormGroup[]
  get chapterFormGroups(): FormGroup[] {
    return this.chapters.controls as FormGroup[];
  }

  // Método para crear un FormGroup para un nuevo capítulo
  private createChapterFormGroup(): FormGroup {
    const chapterFormGroup = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      file: [null], // Campo para el objeto File (para video, pdf)
      content: [''], // Campo para el contenido de texto
      fileName: [''] // Nuevo campo para almacenar el nombre del archivo
    });

    // Gestionar validadores al cambiar el tipo
    this.manageChapterTypeChanges(chapterFormGroup); // Aplicar validadores iniciales

    return chapterFormGroup;
  }

  // Método para gestionar validadores al cambiar el tipo de capítulo
  private manageChapterTypeChanges(chapterFormGroup: FormGroup): void {
    const typeControl = chapterFormGroup.get('type');
    const fileControl = chapterFormGroup.get('file');
    const contentControl = chapterFormGroup.get('content');

    if (!typeControl || !fileControl || !contentControl) {
      return; // Salir si los controles no existen
    }

    // Desuscribir cualquier suscripción previa a los cambios de tipo para este control
    // Esto es importante para evitar múltiples suscripciones por capítulo
    // Esto requiere una forma de identificar la suscripción asociada a este control de tipo
    // Un enfoque más robusto requeriría almacenar las suscripciones por capítulo
    // Para el reto, el enfoque más sencillo es gestionar al añadir/eliminar.


    // Suscribirse a los cambios en el control 'type' de este capítulo específico
    this.subscriptions.push(typeControl.valueChanges.subscribe(type => {
      if (type === 'text') {
        // Si el tipo es texto, requerir 'content' y limpiar 'file'
        contentControl.setValidators(Validators.required);
        fileControl.clearValidators();
        fileControl.setValue(null); // Limpiar valor del archivo
        chapterFormGroup.get('fileName')?.setValue(''); // Limpiar nombre del archivo
      } else {
        // Si el tipo no es texto, requerir 'file' y limpiar 'content'
        fileControl.setValidators(Validators.required);
        contentControl.clearValidators();
        contentControl.setValue(''); // Limpiar valor del contenido de texto
      }
      // Actualizar el estado de validez del control y su padre
      // TODO: Add validation based on chapter type (e.g., file required for video/pdf, content required for text)
    }));
  }

  // Método para añadir un nuevo capítulo al FormArray
  addChapter(): void {
    this.chapters.push(this.createChapterFormGroup());
  }

  // Método para eliminar un capítulo del FormArray por índice
  removeChapter(index: number): void {
    // TODO: Desuscribir las suscripciones asociadas a este capítulo antes de eliminarlo
    this.chapters.removeAt(index);
  }

  // Método para manejar el cambio en el input de archivo
  onFileSelected(event: any, chapterIndex: number): void {
    const file: File = event.target.files[0];
    const chapterFormGroup = this.chapters.at(chapterIndex) as FormGroup; // Castear a FormGroup

    if (file) {
      chapterFormGroup.get('file')?.setValue(file); // Usar optional chaining
      chapterFormGroup.get('fileName')?.setValue(file.name); // Usar optional chaining
      console.log(`File selected for chapter ${chapterIndex + 1}:`, file.name);
    } else {
      chapterFormGroup.get('file')?.setValue(null); // Usar optional chaining
      chapterFormGroup.get('fileName')?.setValue(''); // Usar optional chaining
       console.log(`File selection cleared for chapter ${chapterIndex + 1}.`);
    }
     // Forzar revalidación después de la selección de archivo, ya que puede afectar la validez (si file es requerido)
  }


  // Método para manejar el envío del formulario
  onSubmit(): void {
    if (this.uploadForm.valid) {
      // Marcar todos los controles como 'touched' para mostrar errores de validación
      this.uploadForm.markAllAsTouched();

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
      // Marcar todos los controles como 'touched' para mostrar errores de validación
      this.uploadForm.markAllAsTouched();
      console.log('Form is invalid.');
    }
  }
}

