// Definir la interfaz para el progreso del usuario
export interface UserProgress {
    userId: string;
    courseId: string;
    completedChapters: { [chapterId: string]: boolean };
    courseCompleted: boolean;
    completionDate?: Date;
  }
  
  // Definir la interfaz para una insignia
  export interface Badge {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    criteria: any; // Criterios para obtener la insignia
  }
  
  // Definir la interfaz para una insignia obtenida por un usuario
  export interface UserBadge {
    id: string; // userId_badgeId
    userId: string;
    badgeId: string;
    obtainedDate: Date;
    courseId?: string;
  }
  
  // TODO: Add other interfaces used in Cloud Functions
  