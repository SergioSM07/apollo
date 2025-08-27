# Plataforma de Capacitaciones Apollo

Este proyecto es una plataforma de capacitaciones desarrollada como parte de un reto, utilizando Angular para el frontend, Firebase para los servicios backend (Authentication, Firestore, Cloud Storage, Cloud Functions), y Angular Material para la interfaz de usuario.

## Prerrequisitos

Antes de empezar, asegúrate de tener instalado lo siguiente:

*   Node.js (20.19.4)
*   npm o yarn (administrador de paquetes)
*   Angular CLI (20.0.x)
*   Firebase CLI (`npm install -g firebase-tools` o `yarn global add firebase-tools`)

## Configuración del Proyecto Firebase

1.  **Crea un Proyecto Firebase:** Ve a la [consola de Firebase](https://console.firebase.google.com/) y crea un nuevo proyecto.
2.  **Actualiza al Plan Blaze:** Cloud Functions (requerido para la lógica de asignación de insignias) necesita el plan de pago por uso Blaze. Actualiza el plan de facturación de tu proyecto.
3.  **Habilita los Servicios de Firebase:** En la consola de Firebase, habilita los siguientes servicios:
    *   **Authentication:** Configura la autenticación por correo electrónico y contraseña.
    *   **Firestore Database:** Inicia en modo producción y configura las reglas de seguridad (ver abajo).
    *   **Cloud Storage:** Crea un bucket de almacenamiento y configura las reglas de seguridad (ver abajo).
    *   **Cloud Functions:** Habilita Cloud Functions.
4.  **Configura Firebase en el Frontend:** Obtén el objeto de configuración de tu proyecto Firebase desde la consola (Configuración del proyecto -> General -> Tus apps -> Selecciona tu app web -> Fragmento del SDK de Firebase -> Configuración). Actualiza los archivos `environment.ts` y `environment.prod.ts` en el directorio `frontend/front-apollo/src/environments/` con la configuración de tu proyecto.

## Reglas de Seguridad

Debes configurar reglas de seguridad para Firestore y Cloud Storage en la consola de Firebase para controlar el acceso a tus datos y archivos. Consulta los ejemplos discutidos durante el desarrollo para configurar reglas que permitan a los usuarios autenticados leer datos y a los usuarios autorizados (administradores) escribir datos y subir archivos.

*   **Reglas de Firestore:** Navega a "Firestore Database" -> "Rules".
*   **Reglas de Cloud Storage:** Navega a "Storage" -> "Rules".

## Despliegue de Cloud Functions

1.  **Navega al directorio `functions`:** `cd functions`
2.  **Instala dependencias:** `npm install` o `yarn install`
3.  **Compila el código TypeScript:** `npm run build`
4.  **Autentica Firebase CLI:** `firebase login`
5.  **Selecciona tu proyecto Firebase:** `firebase use --add` y selecciona tu proyecto.
6.  **Despliega funciones:** Navega de regreso al directorio raíz del proyecto (`cd ..`) y ejecuta `firebase deploy --only functions`. Asegúrate de que el Agente de Servicio de Eventarc tenga los permisos necesarios si encuentras errores.

## Ejecución Local del Frontend

1.  **Navega al directorio del frontend:** `cd frontend/front-apollo`
2.  **Instala dependencias:** `npm install` o `yarn install`
3.  **Inicia el servidor de desarrollo:** `ng serve`
4.  **Abre en el navegador:** Abre tu navegador web y navega a `http://localhost:4200/`.

## Estructura del Proyecto (Directorios Clave)

*   `frontend/front-apollo`: Contiene la aplicación frontend Angular.
    *   `src/app/core`: Servicios principales (Auth, User, Courses, Content Management, User Progress), guardias.
    *   `src/app/features`: Módulos/componentes de funcionalidades (Auth, Courses, Profile, Content Upload).
    *   `src/app/shared`: Componentes compartidos, pipes, modelos, etc.
    *   `src/environments`: Configuración de Firebase.
*   `functions`: Contiene el código de Cloud Functions.
    *   `src`: Archivos fuente TypeScript.
    *   `src/interfaces`: Interfaces compartidas para funciones.
