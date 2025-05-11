import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "@/lib/axios";
import { signIn, signOut } from "next-auth/react";
import type {
  AuthState,
  RegisterForm,
  LoginForm,
  ResetPasswordForm,
  TwoFactorForm,
} from "@/types/auth";

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
  EMPTY_2FA_CODE: "Vui lòng nhập mã xác thực 2FA",
  INVALID_2FA_CODE: "Mã xác thực 2FA phải là 6 chữ số",
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
  FORGOT_PASSWORD_FAILED:
    "Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.",
  RESET_PASSWORD_FAILED:
    "Không thể đặt lại mật khẩu. Token không hợp lệ hoặc đã hết hạn.",
  TWO_FACTOR_FAILED: "Xác thực 2FA không thành công. Vui lòng thử lại.",
};

// Thông báo thành công
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Đăng nhập thành công",
  LOGOUT_SUCCESS: "Đăng xuất thành công",
  CODE_SUCCESS: "Đã gửi mã xác thực, vui lòng kiểm tra email của bạn",
  FORGOT_PASSWORD_SUCCESS:
    "Đã gửi email hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.",
  RESET_PASSWORD_SUCCESS: "Đặt lại mật khẩu thành công",
  TWO_FACTOR_SUCCESS: "Xác thực 2FA thành công",
};

// Khởi tạo giá trị mặc định
const initialState = {
  // User state
  user: null,
  token: null,
  isLoading: false,
  error: "",
  success: "",

  // 2FA state
  requiresTwoFactor: false,
  pendingUserId: null,
  twoFactorForm: {
    userId: "",
    code: "",
  },
  twoFactorFormErrors: {
    code: "",
  },

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
  forgotPasswordForm: {
    email: "",
  },
  forgotPasswordFormError: "",
  resetPasswordForm: {
    token: "",
    newPassword: "",
    confirmPassword: "",
  },
  resetPasswordFormErrors: {
    newPassword: "",
    confirmPassword: "",
  },
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
          loginForm: {
            email: "",
            password: "",
          },
          loginFormErrors: {
            email: "",
            password: "",
          },
        }));
      },

      login: async () => {
        const { loginForm, validateAllLoginFields } = get();

        // Validate all fields first
        if (!validateAllLoginFields()) {
          return false;
        }

        // Start loading
        set({ isLoading: true, error: "", success: "" });

        try {
          const result = await signIn("credentials", {
            email: loginForm.email,
            password: loginForm.password,
            redirect: false,
          });

          // Xử lý kết quả
          if (result?.error) {
            // Kiểm tra nếu lỗi là yêu cầu 2FA
            if (result.error.startsWith("REQUIRES_2FA:")) {
              const userId = result.error.replace("REQUIRES_2FA:", "");
              set({
                requiresTwoFactor: true,
                pendingUserId: userId,
                twoFactorForm: {
                  userId: userId,
                  code: "",
                },
                isLoading: false,
              });
              return false;
            }

            set({
              error: result.error,
              isLoading: false,
            });
            return false;
          }

          // Đăng nhập thành công
          set({
            success: SUCCESS_MESSAGES.LOGIN_SUCCESS,
            isLoading: false,
            requiresTwoFactor: false,
            pendingUserId: null,
          });
          return true;
        } catch (error) {
          console.error("Lỗi khi đăng nhập:", error);
          set({
            error: API_ERRORS.CONNECTION,
            isLoading: false,
          });
          return false;
        }
      },

      loginWithGoogle: async () => {
        set(() => ({ isLoading: true, error: "", success: "" }));

        try {
          const result = await signIn("google", {
            redirect: false,
            callbackUrl: "/dashboard",
          });

          if (result?.error) {
            set(() => ({ error: result.error as string }));
            return false;
          }

          set(() => ({ success: SUCCESS_MESSAGES.LOGIN_SUCCESS }));
          return true;
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          // Xử lý lỗi từ URL error param nếu có
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            const errorParam = url.searchParams.get("error");

            if (errorParam) {
              const decodedError = decodeURIComponent(errorParam);
              set(() => ({ error: decodedError }));

              // Xóa param error khỏi URL để không hiển thị trong địa chỉ
              url.searchParams.delete("error");
              window.history.replaceState({}, document.title, url.toString());

              return false;
            }
          }

          const errorMessage =
            err instanceof Error ? err.message : API_ERRORS.GOOGLE_LOGIN_FAILED;

          set(() => ({ error: errorMessage }));
          return false;
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
        } finally {
          set(() => ({ isLoading: false }));
        }
      },

      // --- FORM ACTIONS: 2FA ---
      setTwoFactorForm: (field, value) => {
        set((state) => ({
          twoFactorForm: {
            ...state.twoFactorForm,
            [field]: value,
          },
        }));
      },

      validateTwoFactorField: (field) => {
        const { twoFactorForm } = get();
        let isValid = false;

        switch (field) {
          case "code":
            if (!twoFactorForm.code) {
              set((state) => ({
                twoFactorFormErrors: {
                  ...state.twoFactorFormErrors,
                  code: VALIDATION_ERRORS.EMPTY_2FA_CODE,
                },
              }));
            } else {
              const codeRegex = /^\d{6}$/;
              if (!codeRegex.test(twoFactorForm.code)) {
                set((state) => ({
                  twoFactorFormErrors: {
                    ...state.twoFactorFormErrors,
                    code: VALIDATION_ERRORS.INVALID_2FA_CODE,
                  },
                }));
              } else {
                set((state) => ({
                  twoFactorFormErrors: {
                    ...state.twoFactorFormErrors,
                    code: "",
                  },
                }));
                isValid = true;
              }
            }
            break;

          case "userId":
            isValid = !!twoFactorForm.userId;
            break;
        }

        return isValid;
      },

      validateAllTwoFactorFields: () => {
        const fields: (keyof TwoFactorForm)[] = ["userId", "code"];
        const results = fields.map((field) =>
          get().validateTwoFactorField(field)
        );
        return results.every((result) => result === true);
      },

      resetTwoFactorForm: () => {
        set(() => ({
          twoFactorForm: {
            userId: "",
            code: "",
          },
          twoFactorFormErrors: {
            code: "",
          },
        }));
      },

      verifyTwoFactor: async () => {
        const { twoFactorForm, validateAllTwoFactorFields } = get();

        // Validate all fields first
        if (!validateAllTwoFactorFields()) {
          return false;
        }

        // Start loading
        set({ isLoading: true, error: "", success: "" });

        try {
          const response = await axiosInstance.post("/auth/2fa/authenticate", {
            userId: twoFactorForm.userId,
            code: twoFactorForm.code,
          });

          if (response.data && response.data.access_token) {
            // Đăng nhập với token nhận được
            const result = await signIn("credentials", {
              twoFactorToken: response.data.access_token,
              redirect: false,
            });

            if (result?.error) {
              set({
                error: result.error,
                isLoading: false,
              });
              return false;
            }

            // Xác thực 2FA thành công
            set({
              success: SUCCESS_MESSAGES.TWO_FACTOR_SUCCESS,
              isLoading: false,
              requiresTwoFactor: false,
              pendingUserId: null,
            });
            return true;
          }

          set({
            error: API_ERRORS.TWO_FACTOR_FAILED,
            isLoading: false,
          });
          return false;
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          // Xử lý lỗi từ API
          if (error.response?.data?.message) {
            set({
              error: error.response.data.message,
              isLoading: false,
            });
          } else {
            set({
              error: API_ERRORS.TWO_FACTOR_FAILED,
              isLoading: false,
            });
          }
          return false;
        }
      },

      setRequiresTwoFactor: (requires: boolean, userId?: string) => {
        set({
          requiresTwoFactor: requires,
          pendingUserId: userId || null,
          twoFactorForm: {
            userId: userId || "",
            code: "",
          },
        });
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
        } finally {
          set(() => ({ isLoading: false }));
        }
      },

      // --- FORM ACTIONS: FORGOT PASSWORD ---
      setForgotPasswordEmail: (email) => {
        set((state) => ({
          forgotPasswordForm: {
            ...state.forgotPasswordForm,
            email,
          },
        }));
      },

      validateForgotPasswordEmail: () => {
        const { forgotPasswordForm } = get();
        let isValid = false;

        if (!forgotPasswordForm.email) {
          set(() => ({
            forgotPasswordFormError: VALIDATION_ERRORS.EMPTY_EMAIL,
          }));
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(forgotPasswordForm.email)) {
            set(() => ({
              forgotPasswordFormError: VALIDATION_ERRORS.INVALID_EMAIL,
            }));
          } else {
            set(() => ({
              forgotPasswordFormError: "",
            }));
            isValid = true;
          }
        }

        return isValid;
      },

      resetForgotPasswordForm: () => {
        set(() => ({
          forgotPasswordForm: initialState.forgotPasswordForm,
          forgotPasswordFormError: "",
        }));
      },

      forgotPassword: async () => {
        const { forgotPasswordForm, validateForgotPasswordEmail } = get();

        if (!validateForgotPasswordEmail()) return;

        set(() => ({ isLoading: true, error: "", success: "" }));

        try {
          const response = await axiosInstance.post("/auth/forgot-password", {
            email: forgotPasswordForm.email,
          });

          if (response.data?.message) {
            set(() => ({ success: SUCCESS_MESSAGES.FORGOT_PASSWORD_SUCCESS }));
          }
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          let errorMessage = API_ERRORS.FORGOT_PASSWORD_FAILED;

          if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          }

          set(() => ({ error: errorMessage }));
        } finally {
          set(() => ({ isLoading: false }));
        }
      },

      // --- FORM ACTIONS: RESET PASSWORD ---
      setResetPasswordForm: (field, value) => {
        set((state) => ({
          resetPasswordForm: {
            ...state.resetPasswordForm,
            [field]: value,
          },
        }));
      },

      validateResetPasswordField: (field) => {
        const { resetPasswordForm } = get();
        let isValid = false;

        switch (field) {
          case "newPassword":
            if (!resetPasswordForm.newPassword) {
              set((state) => ({
                resetPasswordFormErrors: {
                  ...state.resetPasswordFormErrors,
                  newPassword: VALIDATION_ERRORS.EMPTY_PASSWORD,
                },
              }));
            } else if (resetPasswordForm.newPassword.length < 6) {
              set((state) => ({
                resetPasswordFormErrors: {
                  ...state.resetPasswordFormErrors,
                  newPassword: VALIDATION_ERRORS.SHORT_PASSWORD,
                },
              }));
            } else {
              set((state) => ({
                resetPasswordFormErrors: {
                  ...state.resetPasswordFormErrors,
                  newPassword: "",
                },
              }));
              isValid = true;
            }
            break;

          case "confirmPassword":
            if (!resetPasswordForm.confirmPassword) {
              set((state) => ({
                resetPasswordFormErrors: {
                  ...state.resetPasswordFormErrors,
                  confirmPassword: VALIDATION_ERRORS.EMPTY_CONFIRM,
                },
              }));
            } else if (
              resetPasswordForm.confirmPassword !==
              resetPasswordForm.newPassword
            ) {
              set((state) => ({
                resetPasswordFormErrors: {
                  ...state.resetPasswordFormErrors,
                  confirmPassword: VALIDATION_ERRORS.MISMATCH_PASSWORD,
                },
              }));
            } else {
              set((state) => ({
                resetPasswordFormErrors: {
                  ...state.resetPasswordFormErrors,
                  confirmPassword: "",
                },
              }));
              isValid = true;
            }
            break;
        }

        return isValid;
      },

      validateAllResetPasswordFields: () => {
        const fields: (keyof ResetPasswordForm)[] = [
          "newPassword",
          "confirmPassword",
        ];
        const results = fields.map((field) =>
          get().validateResetPasswordField(field)
        );
        return results.every((result) => result === true);
      },

      resetResetPasswordForm: () => {
        set(() => ({
          resetPasswordForm: initialState.resetPasswordForm,
          resetPasswordFormErrors: initialState.resetPasswordFormErrors,
        }));
      },

      resetPassword: async () => {
        const { resetPasswordForm, validateAllResetPasswordFields } = get();

        if (!validateAllResetPasswordFields()) return;

        set(() => ({ isLoading: true, error: "", success: "" }));

        try {
          const response = await axiosInstance.post("/auth/reset-password", {
            token: resetPasswordForm.token,
            newPassword: resetPasswordForm.newPassword,
          });

          if (response.data?.message) {
            set(() => ({ success: SUCCESS_MESSAGES.RESET_PASSWORD_SUCCESS }));
          }
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          let errorMessage = API_ERRORS.RESET_PASSWORD_FAILED;

          if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          }

          set(() => ({ error: errorMessage }));
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
        } finally {
          set(() => ({ isLoading: false }));
        }
      },

      // Common actions
      setError: (error) => set({ error }),
      setSuccess: (success) => set({ success }),
      resetMessages: () => set({ error: "", success: "" }),

      // Thêm phương thức xử lý captcha token cho forgot password
      setForgotPasswordCaptchaToken: (token: string) => {
        set((state) => ({
          forgotPasswordForm: {
            ...state.forgotPasswordForm,
            captchaToken: token,
          },
        }));
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        // Lưu trữ vào localStorage
        user: state.user,
        token: state.token,
        requiresTwoFactor: state.requiresTwoFactor,
        pendingUserId: state.pendingUserId,
      }),
    }
  )
);
