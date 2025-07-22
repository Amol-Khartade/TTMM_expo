export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  const trimmedPassword = password.trim();
  
  if (trimmedPassword.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  
  if (trimmedPassword.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }
  
  return { isValid: true };
};

export const validateDisplayName = (displayName: string): { isValid: boolean; message?: string } => {
  const trimmedName = displayName.trim();
  
  if (trimmedName.length < 2) {
    return { isValid: false, message: 'Display name must be at least 2 characters long' };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, message: 'Display name must be less than 50 characters' };
  }
  
  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  return input.trim();
};

export const validateAuthInputs = (email: string, password: string, displayName?: string) => {
  const errors: string[] = [];
  
  const sanitizedEmail = sanitizeInput(email);
  const sanitizedPassword = sanitizeInput(password);
  const sanitizedDisplayName = displayName ? sanitizeInput(displayName) : undefined;
  
  if (!sanitizedEmail) {
    errors.push('Email is required');
  } else if (!validateEmail(sanitizedEmail)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!sanitizedPassword) {
    errors.push('Password is required');
  } else {
    const passwordValidation = validatePassword(sanitizedPassword);
    if (!passwordValidation.isValid) {
      errors.push(passwordValidation.message!);
    }
  }
  
  if (displayName !== undefined) {
    if (!sanitizedDisplayName) {
      errors.push('Display name is required');
    } else {
      const nameValidation = validateDisplayName(sanitizedDisplayName);
      if (!nameValidation.isValid) {
        errors.push(nameValidation.message!);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: {
      email: sanitizedEmail,
      password: sanitizedPassword,
      displayName: sanitizedDisplayName
    }
  };
};