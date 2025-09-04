import { RegisterRequest, LoginRequest } from '../types';

export class ValidationUtils {
  static validateRegister(data: RegisterRequest): string[] {
    const errors: string[] = [];

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Email invalide');
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (!data.first_name || data.first_name.trim().length < 2) {
      errors.push('Le prénom est requis');
    }

    if (!data.last_name || data.last_name.trim().length < 2) {
      errors.push('Le nom est requis');
    }

    return errors;
  }

  static validateLogin(data: LoginRequest): string[] {
    const errors: string[] = [];

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Email invalide');
    }

    if (!data.password) {
      errors.push('Le mot de passe est requis');
    }

    return errors;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}