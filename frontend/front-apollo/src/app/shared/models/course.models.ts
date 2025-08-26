// src/app/shared/models/course.models.ts

export interface Module {
  id: string;
  name: string;
  // Add other necessary fields (e.g., description, image)
}

export interface Course {
  id: string;
  name: string;
  moduleId: string; // To relate courses to modules
  // Add other necessary fields (e.g., description, duration)
}

export interface Chapter {
  id: string;
  name: string;
  courseId: string; // To relate chapters to courses
  type: string; // Type of content (e.g., 'video', 'pdf', 'text')
  url?: string; // URL of the content (for video, pdf, etc.)
  content?: string; // Direct text content (for type 'text')
}

// Interfaz para el progreso del usuario
export interface UserProgress {
  userId: string;
  courseId: string;
  completedChapters: { [chapterId: string]: boolean }; // Mapa de capítulos completados
  courseCompleted: boolean;
  completionDate?: Date; // Timestamp de finalización (puede ser un timestamp de Firestore)
  // Añadir otros campos si son necesarios (ej: tiempo dedicado, puntuación)
}

// Interfaz para la definición de una insignia
export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  criteria: any; // Criterios para obtener la insignia (ej: { type: 'courseCompleted', courseId: 'abc' }) - Usar 'any' por ahora, refinar después
  // Añadir otros campos si son necesarios
}

// Interfaz para una insignia obtenida por un usuario
export interface UserBadge {
  id: string; // Puede ser la combinación userId_badgeId
  userId: string;
  badgeId: string;
  obtainedDate: Date; // Timestamp de cuándo se obtuvo
  courseId?: string; // Opcional: referenciar el curso que otorgó la insignia
  // Añadir otros campos si son necesarios
}