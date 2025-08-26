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
// TODO: Add more interfaces related to courses and training portal