import { createContextId, Slot, component$, useStore, useContext, useContextProvider, useSignal, useTask$, Signal } from "@builder.io/qwik";

export interface User {
  id: string;
  email: string;
  name?: string;
  languages?: string[];
  skills?: string[];
  seniority?: 'junior' | 'mid' | 'senior';
  availability?: 'full-time' | 'part-time' | 'occupato';
  profileCompleted?: boolean;
}

export interface WizardData {
  languages: string[];
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior' | '';
  availability: 'full-time' | 'part-time' | 'occupato' | '';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'linkedin' | 'github';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  // Signals for triggering actions
  loginSignal: Signal<LoginRequest | null>;
  registerSignal: Signal<RegisterRequest | null>;
  socialLoginSignal: Signal<SocialLoginRequest | null>;
  logoutSignal: Signal<boolean>;
  updateProfileSignal: Signal<WizardData | null>;
  // Result signals
  loginResult: Signal<{success: boolean, error?: string} | null>;
  registerResult: Signal<{success: boolean, error?: string} | null>;
}

export const AuthContext = createContextId<AuthState>('auth-context');

export const AuthProvider = component$(() => {
  // Create signals for actions
  const loginSignal = useSignal<LoginRequest | null>(null);
  const registerSignal = useSignal<RegisterRequest | null>(null);
  const socialLoginSignal = useSignal<SocialLoginRequest | null>(null);
  const logoutSignal = useSignal(false);
  const updateProfileSignal = useSignal<WizardData | null>(null);
  
  // Create result signals
  const loginResult = useSignal<{success: boolean, error?: string} | null>(null);
  const registerResult = useSignal<{success: boolean, error?: string} | null>(null);

  const authState = useStore<AuthState>({
    user: null,
    isAuthenticated: false,
    loginSignal,
    registerSignal,
    socialLoginSignal,
    logoutSignal,
    updateProfileSignal,
    loginResult,
    registerResult
  });

  // Handle login requests
  useTask$(async ({ track }) => {
    const loginReq = track(() => loginSignal.value);
    if (loginReq) {
      try {
        // Mock authentication - in real app this would call an API
        if (loginReq.email && loginReq.password) {
          authState.user = {
            id: '1',
            email: loginReq.email,
            name: loginReq.email.split('@')[0],
            profileCompleted: false
          };
          authState.isAuthenticated = true;
          loginResult.value = { success: true };
        } else {
          loginResult.value = { success: false, error: 'Invalid credentials' };
        }
      } catch {
        loginResult.value = { success: false, error: 'Login failed' };
      }
      loginSignal.value = null;
    }
  });

  // Handle register requests
  useTask$(async ({ track }) => {
    const registerReq = track(() => registerSignal.value);
    if (registerReq) {
      try {
        // Mock registration - in real app this would call an API
        if (registerReq.email && registerReq.password) {
          authState.user = {
            id: '2',
            email: registerReq.email,
            name: registerReq.name || registerReq.email.split('@')[0],
            profileCompleted: false
          };
          authState.isAuthenticated = true;
          registerResult.value = { success: true };
        } else {
          registerResult.value = { success: false, error: 'Invalid data' };
        }
      } catch {
        registerResult.value = { success: false, error: 'Registration failed' };
      }
      registerSignal.value = null;
    }
  });

  // Handle social login requests
  useTask$(async ({ track }) => {
    const socialReq = track(() => socialLoginSignal.value);
    if (socialReq) {
      try {
        // Mock social login - in real app this would use OAuth
        const mockEmail = `user@${socialReq.provider}.com`;
        authState.user = {
          id: '3',
          email: mockEmail,
          name: `User from ${socialReq.provider}`,
          profileCompleted: false
        };
        authState.isAuthenticated = true;
      } catch (error) {
        console.error('Social login failed:', error);
      }
      socialLoginSignal.value = null;
    }
  });

  // Handle logout requests
  useTask$(({ track }) => {
    const shouldLogout = track(() => logoutSignal.value);
    if (shouldLogout) {
      authState.user = null;
      authState.isAuthenticated = false;
      logoutSignal.value = false;
    }
  });

  // Handle profile update requests
  useTask$(({ track }) => {
    const wizardData = track(() => updateProfileSignal.value);
    if (wizardData && authState.user) {
      authState.user.languages = wizardData.languages;
      authState.user.skills = wizardData.skills;
      authState.user.seniority = wizardData.seniority || undefined;
      authState.user.availability = wizardData.availability || undefined;
      authState.user.profileCompleted = true;
      updateProfileSignal.value = null;
    }
  });

  useContextProvider(AuthContext, authState);

  return <Slot />;
});

export const useAuth = () => {
  return useContext(AuthContext);
};