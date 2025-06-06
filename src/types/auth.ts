export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  captchaToken?: string;
}

export interface RegisterFormErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginForm {
  email: string;
  password: string;
  captchaToken?: string;
}

export interface LoginFormErrors {
  email: string;
  password: string;
}

export interface TwoFactorForm {
  userId: string;
  code: string;
}

export interface TwoFactorFormErrors {
  code: string;
}

export interface VerifyForm {
  email: string;
  verificationCode: string;
}

export interface ForgotPasswordForm {
  email: string;
  captchaToken?: string;
}

export interface ResetPasswordForm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordFormErrors {
  newPassword: string;
  confirmPassword: string;
}

export interface AuthState {
  // User state
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string;
  success: string;

  // 2FA state
  requiresTwoFactor: boolean;
  pendingUserId: string | null;
  twoFactorForm: TwoFactorForm;
  twoFactorFormErrors: TwoFactorFormErrors;

  // Form states
  registerForm: RegisterForm;
  registerFormErrors: RegisterFormErrors;
  loginForm: LoginForm;
  loginFormErrors: LoginFormErrors;
  verifyForm: VerifyForm;
  verifyFormError: string;
  forgotPasswordForm: ForgotPasswordForm;
  forgotPasswordFormError: string;
  resetPasswordForm: ResetPasswordForm;
  resetPasswordFormErrors: ResetPasswordFormErrors;

  // Form actions - Register
  setRegisterForm: (field: keyof RegisterForm, value: string) => void;
  validateRegisterField: (field: keyof RegisterForm) => boolean;
  validateAllRegisterFields: () => boolean;
  resetRegisterForm: () => void;
  register: () => Promise<void>;

  // Form actions - Login
  setLoginForm: (field: keyof LoginForm, value: string) => void;
  validateLoginField: (field: keyof LoginForm) => boolean;
  validateAllLoginFields: () => boolean;
  resetLoginForm: () => void;
  login: () => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;

  // Form actions - 2FA
  setTwoFactorForm: (field: keyof TwoFactorForm, value: string) => void;
  validateTwoFactorField: (field: keyof TwoFactorForm) => boolean;
  validateAllTwoFactorFields: () => boolean;
  resetTwoFactorForm: () => void;
  verifyTwoFactor: () => Promise<boolean>;
  setRequiresTwoFactor: (requires: boolean, userId?: string) => void;

  // Form actions - Verification
  setVerificationCode: (code: string) => void;
  validateVerificationCode: () => boolean;
  verifyAccount: () => Promise<void>;
  verificationCode: () => Promise<void>;

  // Form actions - Forgot Password
  setForgotPasswordEmail: (email: string) => void;
  validateForgotPasswordEmail: () => boolean;
  resetForgotPasswordForm: () => void;
  forgotPassword: () => Promise<void>;
  setForgotPasswordCaptchaToken: (token: string) => void;

  // Form actions - Reset Password
  setResetPasswordForm: (field: keyof ResetPasswordForm, value: string) => void;
  validateResetPasswordField: (field: keyof ResetPasswordForm) => boolean;
  validateAllResetPasswordFields: () => boolean;
  resetResetPasswordForm: () => void;
  resetPassword: () => Promise<void>;

  // Common actions
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  resetMessages: () => void;
}
