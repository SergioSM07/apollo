import { AbstractControl, ValidatorFn, ValidationErrors, FormGroup } from '@angular/forms';

// Validador personalizado para verificar que las contraseñas coincidan
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  // Aseguramos que el control es un FormGroup para acceder a los controles hijos
  const formGroup = control as FormGroup;
  const passwordControl = formGroup.get('password');
  const confirmPasswordControl = formGroup.get('confirmPassword');

  // Si los controles no existen o no tienen valor, no validamos
  if (!passwordControl || !confirmPasswordControl || !passwordControl.value || !confirmPasswordControl.value) {
    return null;
  }

  // Si las contraseñas no coinciden, establecer el error 'passwordMismatch' en el control de confirmPassword
  if (passwordControl.value !== confirmPasswordControl.value) {
    // Solo establecemos el error si no está ya presente para evitar ciclos infinitos
    if (!confirmPasswordControl.errors || !confirmPasswordControl.errors['passwordMismatch']) {
         confirmPasswordControl.setErrors({ passwordMismatch: true });
    }
    return { passwordMismatch: true };
  } else {
    // Si coinciden, eliminar el error 'passwordMismatch' si está presente
    if (confirmPasswordControl.errors && confirmPasswordControl.errors['passwordMismatch']) {
        // Clonar errores para evitar modificar el objeto original y eliminar solo passwordMismatch
        const errors = { ...confirmPasswordControl.errors };
        delete errors['passwordMismatch'];
        confirmPasswordControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
    return null;
  }
};