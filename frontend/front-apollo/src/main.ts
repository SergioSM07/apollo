import { getAuth, provideAuth } from '@angular/fire/auth';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app'; // Import Firebase App
import { environment } from './environments/environment'; // Import the environment

bootstrapApplication(App, {
    providers: [
      ...appConfig.providers,
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideAuth(() => getAuth()) // Añadir provideAuth
    ]
  }).catch((err) => console.error(err));