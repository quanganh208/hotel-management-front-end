import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "@/lib/axios";
import { signIn, signOut } from "next-auth/react";

// Khai báo các interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginForm {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email: string;
  password: string;
}

interface VerifyForm {
  email: string;
  verificationCode: string;
}

// Interface chính cho AuthState
interface AuthState {
  // User state
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string;
  success: string;

  // Form states
  registerForm: RegisterForm;
  registerFormErrors: RegisterFormErrors;
  loginForm: LoginForm;
  loginFormErrors: LoginFormErrors;
  verifyForm: VerifyForm;
  verifyFormError: string;

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
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Form actions - Verification
  setVerificationCode: (code: string) => void;
  validateVerificationCode: () => boolean;
  verifyAccount: () => Promise<void>;
  verificationCode: () => Promise<void>;

  // Common actions
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  resetMessages: () => void;
}

// Khởi tạo giá trị mặc định
const initialState = {
  // User state
  user: null,
  token: null,
  isLoading: false,
  error: "",
  success: "",

  // Form states
  registerForm: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
  registerFormErrors: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
  loginForm: {
    email: "",
    password: "",
  },
  loginFormErrors: {
    email: "",
    password: "",
  },
  verifyForm: {
    email: "",
    verificationCode: "",
  },
  verifyFormError: "",
};

// Lỗi validation
const VALIDATION_ERRORS = {
  EMPTY_NAME: "Họ và tên không được để trống",
  SHORT_NAME: "Họ và tên phải có ít nhất 2 ký tự",
  EMPTY_EMAIL: "Email không được để trống",
  INVALID_EMAIL: "Email không hợp lệ",
  EMPTY_PASSWORD: "Mật khẩu không được để trống",
  SHORT_PASSWORD: "Mật khẩu phải có ít nhất 6 ký tự",
  EMPTY_CONFIRM: "Vui lòng xác nhận mật khẩu",
  MISMATCH_PASSWORD: "Mật khẩu xác nhận không khớp",
  EMPTY_CODE: "Vui lòng nhập mã xác thực",
  INVALID_CODE: "Mã xác thực chỉ được chứa các chữ số",
  INVALID_CODE_LENGTH: "Mã xác thực phải đủ 8 chữ số",
  MISSING_EMAIL: "Không tìm thấy email để xác thực",
};

// Lỗi API
const API_ERRORS = {
  CONNECTION:
    "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối hoặc thử lại sau.",
  REGISTER_FAILED: "Đăng ký không thành công. Vui lòng thử lại sau.",
  LOGIN_FAILED: "Đăng nhập không thành công. Vui lòng thử lại sau.",
  GOOGLE_LOGIN_FAILED:
    "Đăng nhập với Google không thành công. Vui lòng thử lại sau.",
  VERIFY_FAILED: "Xác thực tài khoản không thành công. Vui lòng thử lại sau.",
  CODE_FAILED: "Không thể gửi mã xác thực. Vui lòng thử lại sau.",
};

// Thông báo thành công
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Đăng nhập thành công",
  LOGOUT_SUCCESS: "Đăng xuất thành công",
  CODE_SUCCESS: "Đã gửi mã xác thực, vui lòng kiểm tra email của bạn",
};

// Tạo store với zustand
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // --- FORM ACTIONS: REGISTER ---
      setRegisterForm: (field, value) => {
        set((state) => ({
          registerForm: {
            ...state.registerForm,
            [field]: value,
          },
        }));
      },

      validateRegisterField: (field) => {
        const { registerForm } = get();
        let isValid = false;

        switch (field) {
          case "name":
            if (!registerForm.name) {
              set((state) => ({
                registerFormErrors: {
                  ...state.registerFormErrors,
                  name: VALIDATION_ERRORS.EMPTY_NAME,
                },
              }));
            } else if (registerForm.name.length < 2) {
              set((state) => ({
                registerFormErrors: {
                  ...state.registerFormErrors,
                  name: VALIDATION_ERRORS.SHORT_NAME,
                },
              }));
            } else {
              set((state) => ({
                registerFormErrors: {
                  ...state.registerFormErrors,
                  name: "",
                },
              }));
              isValid = true;
            }
            break;

          case "email":
            if (!registerForm.email) {
              set((state) => ({
                registerFormErrors: {
                  ...state.registerFormErrors,
                  email: VALIDATION_ERRORS.EMPTY_EMAIL,
                },
              }));
            } else {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(registerForm.email)) {
                set((state) => ({
                  registerFormErrors: {
                    ...state.registerFormErrors,
                    email: VALIDATION_ERRORS.INVALID_EMAIL,
                  },
                }));
              } else {
                set((state) => ({
                  registerFormErrors: {
                    ...state.registerFormErrors,
                    email: "",
                  },
                }));
                isValid = true;
              }
            }
            break;

          case "password":
            if (!registerForm.password) {
              set((state) => ({
                registerFormErrors: {
                  ...state.registerFormErrors,
                  password: VALIDATION_ERRORS.EMPTY_PASSWORD,
                },
              }));
            } else if (registerForm.password.length < 6) {
              set((state) => ({
                registerFormErrors: {
                  ...state.registerFormErrors,
                  password: VALIDATION_ERRORS.SHORT_PASSWORD,
                },
              }));
            } else {
              set((state) => ({
                registerFormErrors: {
                  ...state.registerFormErrors,
                  password: "",
                },
              }));
              isValid = true;
            }
            break;

          case "confirmPassword":
            if (!registerForm.confirmPassword) {
              set((state) => ({
                registerFormErrors: {
                  ...state.registerFormErrors,
                  confirmPassword: VALIDATION_ERRORS.EMPTY_CONFIRM,
                },
              }));
            } else if (registerForm.confirmPassword !== registerForm.password) {
              set((state) => ({
                registerFormErrors: {
                  ...state.registerFormErrors,
                  confirmPassword: VALIDATION_ERRORS.MISMATCH_PASSWORD,
                },
              }));
            } else {
              set((state) => ({
                registerFormErrors: {
                  ...state.registerFormErrors,
                  confirmPassword: "",
                },
              }));
              isValid = true;
            }
            break;
        }

        return isValid;
      },

      validateAllRegisterFields: () => {
        const fields: (keyof RegisterForm)[] = [
          "name",
          "email",
          "password",
          "confirmPassword",
        ];
        const results = fields.map((field) =>
          get().validateRegisterField(field)
        );
        return results.every((result) => result === true);
      },

      resetRegisterForm: () => {
        set(() => ({
          registerForm: initialState.registerForm,
          registerFormErrors: initialState.registerFormErrors,
        }));
      },

      // --- FORM ACTIONS: LOGIN ---
      setLoginForm: (field, value) => {
        set((state) => ({
          loginForm: {
            ...state.loginForm,
            [field]: value,
          },
        }));
      },

      validateLoginField: (field) => {
        const { loginForm } = get();
        let isValid = false;

        switch (field) {
          case "email":
            if (!loginForm.email) {
              set((state) => ({
                loginFormErrors: {
                  ...state.loginFormErrors,
                  email: VALIDATION_ERRORS.EMPTY_EMAIL,
                },
              }));
            } else {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(loginForm.email)) {
                set((state) => ({
                  loginFormErrors: {
                    ...state.loginFormErrors,
                    email: VALIDATION_ERRORS.INVALID_EMAIL,
                  },
                }));
              } else {
                set((state) => ({
                  loginFormErrors: {
                    ...state.loginFormErrors,
                    email: "",
                  },
                }));
                isValid = true;
              }
            }
            break;

          case "password":
            if (!loginForm.password) {
              set((state) => ({
                loginFormErrors: {
                  ...state.loginFormErrors,
                  password: VALIDATION_ERRORS.EMPTY_PASSWORD,
                },
              }));
            } else if (loginForm.password.length < 6) {
              set((state) => ({
                loginFormErrors: {
                  ...state.loginFormErrors,
                  password: VALIDATION_ERRORS.SHORT_PASSWORD,
                },
              }));
            } else {
              set((state) => ({
                loginFormErrors: {
                  ...state.loginFormErrors,
                  password: "",
                },
              }));
              isValid = true;
            }
            break;
        }

        return isValid;
      },

      validateAllLoginFields: () => {
        const fields: (keyof LoginForm)[] = ["email", "password"];
        const results = fields.map((field) => get().validateLoginField(field));
        return results.every((result) => result === true);
      },

      resetLoginForm: () => {
        set(() => ({
          loginForm: initialState.loginForm,
          loginFormErrors: initialState.loginFormErrors,
        }));
      },

      // --- FORM ACTIONS: VERIFICATION ---
      setVerificationCode: (code) => {
        set((state) => ({
          verifyForm: {
            ...state.verifyForm,
            verificationCode: code,
          },
        }));
      },

      validateVerificationCode: () => {
        const { verifyForm } = get();

        if (!verifyForm.verificationCode) {
          set(() => ({ verifyFormError: VALIDATION_ERRORS.EMPTY_CODE }));
          return false;
        }

        if (!/^\d+$/.test(verifyForm.verificationCode)) {
          set(() => ({ verifyFormError: VALIDATION_ERRORS.INVALID_CODE }));
          return false;
        }

        if (verifyForm.verificationCode.length !== 8) {
          set(() => ({ verifyFormError: "Mã xác thực phải đủ 8 chữ số" }));
          return false;
        }

        set(() => ({ verifyFormError: "" }));
        return true;
      },

      // --- API ACTIONS: REGISTER ---
      register: async () => {
        const { registerForm, validateAllRegisterFields } = get();

        if (!validateAllRegisterFields()) return;

        set(() => ({ isLoading: true, error: "", success: "" }));

        try {
          const data = {
            name: registerForm.name,
            email: registerForm.email,
            password: registerForm.password,
          };

          const response = await axiosInstance.post("/auth/register", data);

          if (response.data?.message) {
            if (typeof window !== "undefined") {
              localStorage.setItem("verificationEmail", registerForm.email);
            }

            set((state) => ({
              success: response.data.message,
              verifyForm: {
                ...state.verifyForm,
                email: registerForm.email,
              },
            }));
          }
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          let errorMessage = API_ERRORS.REGISTER_FAILED;

          if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err.code === "ECONNREFUSED") {
            errorMessage = API_ERRORS.CONNECTION;
          }

          set(() => ({ error: errorMessage }));
          console.error("Đăng ký lỗi:", err);
        } finally {
          set(() => ({ isLoading: false }));
        }
      },

      // --- API ACTIONS: LOGIN ---
      login: async () => {
        const { loginForm, validateAllLoginFields } = get();

        if (!validateAllLoginFields()) return false;

        set(() => ({ isLoading: true, error: "", success: "" }));

        try {
          const result = await signIn("credentials", {
            email: loginForm.email,
            password: loginForm.password,
            redirect: false,
          });

          if (result?.error) {
            // Save the email for verification if it's an inactive account error
            if (result.error.startsWith("INACTIVE_ACCOUNT:")) {
              if (typeof window !== "undefined") {
                localStorage.setItem("verificationEmail", loginForm.email);
              }
              // Also update the verification form email
              set((state) => ({
                verifyForm: {
                  ...state.verifyForm,
                  email: loginForm.email,
                },
              }));
            }

            set(() => ({ error: result.error as string }));
            return false;
          }

          set(() => ({ success: SUCCESS_MESSAGES.LOGIN_SUCCESS }));
          return true;
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          const errorMessage =
            err instanceof Error ? err.message : API_ERRORS.LOGIN_FAILED;

          set(() => ({ error: errorMessage }));
          console.error("Đăng nhập lỗi:", err);
          return false;
        } finally {
          set(() => ({ isLoading: false }));
        }
      },

      loginWithGoogle: async () => {
        set(() => ({ isLoading: true, error: "", success: "" }));

        try {
          await signIn("google", { callbackUrl: "/dashboard" });
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : API_ERRORS.GOOGLE_LOGIN_FAILED;

          set(() => ({ error: errorMessage }));
          console.error("Đăng nhập Google lỗi:", err);
        } finally {
          set(() => ({ isLoading: false }));
        }
      },

      logout: async () => {
        set(() => ({ isLoading: true }));

        try {
          await signOut({ redirect: false });

          set(() => ({
            user: null,
            token: null,
            success: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
          }));
        } catch (err) {
          console.error("Đăng xuất lỗi:", err);
        } finally {
          set(() => ({ isLoading: false }));
        }
      },

      // --- API ACTIONS: VERIFICATION ---
      verifyAccount: async () => {
        const { verifyForm, validateVerificationCode } = get();

        if (!verifyForm.email) {
          set(() => ({ error: VALIDATION_ERRORS.MISSING_EMAIL }));
          return;
        }

        if (!validateVerificationCode()) return;

        set(() => ({ isLoading: true, error: "", success: "" }));

        try {
          const data = {
            email: verifyForm.email,
            verificationCode: verifyForm.verificationCode,
          };

          const response = await axiosInstance.post("/auth/activate", data);

          if (response.data?.message) {
            set(() => ({
              success: response.data.message,
              verifyForm: {
                ...get().verifyForm,
                verificationCode: "",
              },
            }));

            if (typeof window !== "undefined") {
              localStorage.removeItem("verificationEmail");
            }
          }
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          let errorMessage = API_ERRORS.VERIFY_FAILED;

          if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err.code === "ECONNREFUSED") {
            errorMessage = API_ERRORS.CONNECTION;
          }

          set(() => ({ error: errorMessage }));
          console.error("Lỗi xác thực:", err);
        } finally {
          set(() => ({ isLoading: false }));
        }
      },

      verificationCode: async () => {
        const { verifyForm } = get();

        if (!verifyForm.email) {
          set(() => ({ error: VALIDATION_ERRORS.MISSING_EMAIL }));
          return;
        }

        set(() => ({ isLoading: true, error: "", success: "" }));

        try {
          const response = await axiosInstance.post("/auth/send-activation", {
            email: verifyForm.email,
          });

          if (response.data?.message) {
            set(() => ({ success: SUCCESS_MESSAGES.CODE_SUCCESS }));
          }
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          let errorMessage = API_ERRORS.CODE_FAILED;

          if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          }

          set(() => ({ error: errorMessage }));
          console.error("Lỗi gửi lại mã:", err);
        } finally {
          set(() => ({ isLoading: false }));
        }
      },

      // --- COMMON ACTIONS ---
      setError: (error) => set(() => ({ error })),
      setSuccess: (success) => set(() => ({ success })),
      resetMessages: () =>
        set(() => ({
          error: "",
          success: "",
          verifyFormError: "",
        })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        verifyForm: {
          email: state.verifyForm.email,
          verificationCode: "",
        },
        error: "",
        success: "",
        verifyFormError: "",
      }),
    }
  )
);
