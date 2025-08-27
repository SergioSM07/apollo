/**
 * Import function triggers from their respective submodules:
 *
 * import { onCall } from "firebase-functions/v2/https";
 * import { onDocumentWritten } from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
// Importar triggers de Firestore v2
import {onDocumentUpdated} from "firebase-functions/v2/firestore";


// Importar interfaces desde el archivo de interfaces
import {UserProgress, UserBadge} from "./interfaces/models";


admin.initializeApp(); // Inicializar el SDK Admin

const db = admin.firestore();

// Definir las interfaces (deben coincidir con las de tu frontend)
// Eliminado: Interfaces movidas a ./interfaces/models
// interface UserProgress { ... }
// interface Badge { ... }
// interface UserBadge { ... }


// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});


// Cloud Function que se activa cuando se actualiza un documento
// en userProgress (Usando sintaxis v2)
export const checkAndAwardBadge = onDocumentUpdated( // Usar onDocumentUpdated de v2
  'userProgress/{userCourseId}',// Ruta del documento
  async (event) => { // El evento es diferente en v2
    
    // Datos del documento después de la actualización
    const snapshotAfter = event.data?.after; 
    const snapshotBefore = event.data?.before; // Datos del documento antes de la actualización

    if (!snapshotAfter || !snapshotBefore) {
      // Esto debería suceder solo en eliminaciones, pero es bueno verificar
      return null;
    }

    // Verificar si el curso fue marcado como completado en esta actualización
    const userProgressAfter = snapshotAfter.data() as UserProgress;
    const userProgressBefore = snapshotBefore.data() as UserProgress;
    if (userProgressAfter.courseCompleted === true && userProgressBefore.courseCompleted !== true) {
      console.log(`Curso ${userProgressAfter.courseId} completado por el usuario ${userProgressAfter.userId}. Verificando insignias...`);

      try {
        // 1. Obtener todas las insignias
        const badgesSnapshot = await db.collection('badges').get();
        const badges = badgesSnapshot.docs.map(doc => {
            const data = doc.data() as any; // Usar any temporalmente
             // Ajustar el mapeo para evitar sobre escritura del ID
            return { id: doc.id, name: data.name, description: data.description, imageUrl: data.imageUrl, criteria: data.criteria, ...data };
        });

        // 2. Filtrar insignias cuyos criterios coincidan con este evento
        const potentialBadges = badges.filter(badge => {
          // Ejemplo de criterio: completar un curso específico
          return badge.criteria &&
                 badge.criteria.type === 'courseCompleted' &&
                 badge.criteria.courseId === userProgressAfter.courseId;
          // TODO: Implementar lógica para otros tipos de criterios de insignia
        });

        console.log(`Found ${potentialBadges.length} potential badges for this event.`);

        // 3. Para cada insignia potencial, verificar si el usuario ya la tiene
        for (const badge of potentialBadges) {
          const userBadgeId = `${userProgressAfter.userId}_${badge.id}`;
          const userBadgeDocRef = db.collection('userBadges').doc(userBadgeId);
          const userBadgeDoc = await userBadgeDocRef.get();

          if (!userBadgeDoc.exists) {
            // 4. Si el usuario no tiene la insignia, otorgársela
            console.log(`Otorgando insignia ${badge.name} al usuario ${userProgressAfter.userId}`);
            const newUserBadge: UserBadge = {
              id: userBadgeId,
              userId: userProgressAfter.userId,
              badgeId: badge.id,
              obtainedDate: new Date(), // Usar la fecha actual
              courseId: userProgressAfter.courseId // Referenciar el curso que otorgó la insignia
            };
            await userBadgeDocRef.set(newUserBadge);
            console.log(`Insignia ${badge.name} otorgada.`);

            // TODO: Opcional: Enviar notificación al usuario
          } else {
            console.log(`Usuario ${userProgressAfter.userId} ya tiene la insignia ${badge.name}.`);
          }
        }

        return null; // La función se completó exitosamente

      } catch (error) {
        console.error('Error checking and awarding badge:', error);
        // Opcional: Registrar el error en un log o colección de errores
        return null; // Indicar que la función falló
      }
    }

    return null; // No hubo un cambio significativo que desencadene la lógica de insignias
  });

// TODO: Add other Cloud Functions as needed
