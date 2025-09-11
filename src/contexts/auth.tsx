import { createContextId, Slot, component$, useStore, useContext, useContextProvider, useSignal, useTask$, Signal } from "@builder.io/qwik";

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  location?: string;
  birthDate?: string;
  bio?: string;
  avatar?: string;
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

export interface PersonalInfoUpdate {
  name: string;
  email: string;
  phone: string;
  location: string;
  birthDate: string;
  bio: string;
}

export interface AvatarUpdateRequest {
  avatar: string;
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
  updatePersonalInfoSignal: Signal<PersonalInfoUpdate | null>;
  updateAvatarSignal: Signal<AvatarUpdateRequest | null>;
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
  const updatePersonalInfoSignal = useSignal<PersonalInfoUpdate | null>(null);
  const updateAvatarSignal = useSignal<AvatarUpdateRequest | null>(null);
  
  // Create result signals
  const loginResult = useSignal<{success: boolean, error?: string} | null>(null);
  const registerResult = useSignal<{success: boolean, error?: string} | null>(null);

  const authState = useStore<AuthState>({
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      profileCompleted: true,
      languages: ['Italian', 'English'],
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Qwik'],
      seniority: 'mid',
      availability: 'full-time',
      location: 'Milan, Italy',
      phone: '+39 123 456 7890',
      bio: 'Full-stack developer with experience in modern web technologies.'
    },
    isAuthenticated: true,
    loginSignal,
    registerSignal,
    socialLoginSignal,
    logoutSignal,
    updateProfileSignal,
    updatePersonalInfoSignal,
    updateAvatarSignal,
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
        const mockAvatars = {
          google: 'https://lh3.googleusercontent.com/a/default-user',
          linkedin: 'https://media.licdn.com/dms/image/default-user',
          github: 'https://avatars.githubusercontent.com/u/default'
        };
        
        authState.user = {
          id: '3',
          email: mockEmail,
          name: `User from ${socialReq.provider}`,
          avatar: mockAvatars[socialReq.provider],
          location: socialReq.provider === 'linkedin' ? 'Milan, Italy' : undefined,
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

  // Handle personal info update requests
  useTask$(({ track }) => {
    const personalInfo = track(() => updatePersonalInfoSignal.value);
    if (personalInfo && authState.user) {
      authState.user.name = personalInfo.name;
      authState.user.phone = personalInfo.phone;
      authState.user.location = personalInfo.location;
      authState.user.birthDate = personalInfo.birthDate;
      authState.user.bio = personalInfo.bio;
      // Email is usually not editable in most systems, but updating anyway
      // In a real app, you might want to handle email updates differently
      updatePersonalInfoSignal.value = null;
    }
  });

  // Handle avatar update requests
  useTask$(({ track }) => {
    const avatarUpdate = track(() => updateAvatarSignal.value);
    if (avatarUpdate && authState.user) {
      authState.user.avatar = avatarUpdate.avatar;
      updateAvatarSignal.value = null;
    }
  });

  useContextProvider(AuthContext, authState);

  return <Slot />;
});

export const useAuth = () => {
  return useContext(AuthContext);
};