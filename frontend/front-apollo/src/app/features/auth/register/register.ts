import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service'; // Importar AuthService
import { confirmPasswordValidator } from '../../../shared/validators/password-match.validator'; // Importar validador personalizado
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, // Import CommonModule
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  errorMessage: string | null = null; // Propiedad para el mensaje de error
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { // Inyectar AuthService y Router
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validators: confirmPasswordValidator }); // Añadir validador personalizado
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.errorMessage = null; // Limpiar errores anteriores
      const { email, password } = this.registerForm.value;
      this.authService.register(email, password) // Llamar al servicio de autenticación
        .then((userCredential) => {
          // Registro exitoso
          console.log('Registration successful!', userCredential?.email);
          // Redirigir al usuario después del registro exitoso (por ejemplo, al login o al dashboard)
          this.router.navigate(['/']); // Ejemplo: navegar a la raíz
        })
        .catch((error) => {
          // Manejar errores de registro
          console.error('Registration failed:', error);
          this.errorMessage = error.message; // Asignar el mensaje de error de Firebase
        });
    }
  }
}