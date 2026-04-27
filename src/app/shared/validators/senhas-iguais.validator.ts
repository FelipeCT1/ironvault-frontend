import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function senhasIguais(senhaKey: string, confirmacaoKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const senha = control.get(senhaKey);
    const confirmacao = control.get(confirmacaoKey);

    if (!senha || !confirmacao) {
      return null;
    }

    if (senha.value !== confirmacao.value) {
      confirmacao.setErrors({ ...confirmacao.errors, senhasDiferentes: true });
      return { senhasDiferentes: true };
    }

    if (confirmacao.hasError('senhasDiferentes')) {
      const errors = { ...confirmacao.errors };
      delete errors['senhasDiferentes'];
      confirmacao.setErrors(Object.keys(errors).length ? errors : null);
    }

    return null;
  };
}
