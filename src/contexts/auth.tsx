import {
  createContextId,
  Slot,
  component$,
  useStore,
  useContext,
  useContextProvider,
  useSignal,
  useTask$,
  useVisibleTask$,
  Signal,
  type QRL,
  $
} from "@builder.io/qwik";

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
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
  role?: string;
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
  firstName?: string;
  lastName?: string;
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
  coordinates?: { lat: number; lng: number };
}

export interface AvatarUpdateRequest {
  avatar: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
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

const API_URL = 'http://localhost:3001';

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
    user: null,
    isAuthenticated: false,
    token: null,
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

  // Load state from localStorage on initialization
  useVisibleTask$(() => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (token && userStr) {
      try {
        authState.token = token;
        authState.user = JSON.parse(userStr);
        authState.isAuthenticated = true;
      } catch (e) {
        console.error('Failed to restore auth state', e);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  });

  // Handle login requests
  useTask$(async ({ track }) => {
    const loginReq = track(() => loginSignal.value);
    if (loginReq) {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(loginReq),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const { user, token } = data.data;
          
          authState.user = {
            ...user,
            name: `${user.firstName} ${user.lastName}`,
            profileCompleted: user.profileCompleted ?? false
          };
          authState.token = token;
          authState.isAuthenticated = true;
          
          // Persist to localStorage
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(authState.user));
          }
          
          loginResult.value = { success: true };
        } else {
          loginResult.value = { success: false, error: data.message || 'Login failed' };
        }
      } catch (error) {
        console.error('Login error:', error);
        loginResult.value = { success: false, error: 'Network error or server unavailable' };
      }
      loginSignal.value = null;
    }
  });

  // Handle register requests
  useTask$(async ({ track }) => {
    const registerReq = track(() => registerSignal.value);
    if (registerReq) {
      try {
        // Split name into first and last name if provided, otherwise default
        const nameParts = (registerReq.name || '').split(' ');
        const firstName = registerReq.firstName || nameParts[0] || 'User';
        const lastName = registerReq.lastName || nameParts.slice(1).join(' ') || 'New';

        const payload = {
          email: registerReq.email,
          password: registerReq.password,
          firstName,
          lastName
        };

        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        let data;
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse response JSON:', text);
          data = { success: false, message: text || 'Unknown error occurred' };
        }

        if (response.status === 201 && data.success) {
          const { user, token } = data.data;
          
          authState.user = {
            ...user,
            name: `${user.firstName} ${user.lastName}`,
            profileCompleted: false
          };
          authState.token = token;
          authState.isAuthenticated = true;

          // Persist to localStorage
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(authState.user));
          }

          registerResult.value = { success: true };
        } else {
          console.error('Registration failed response:', data);
          registerResult.value = { success: false, error: data.message || 'Registration failed' };
        }
      } catch (error) {
        console.error('Registration error detailed:', error);
        registerResult.value = { success: false, error: 'Network error or server unavailable' };
      }
      registerSignal.value = null;
    }
  });

  // Handle social login requests
  useTask$(async ({ track }) => {
    const socialReq = track(() => socialLoginSignal.value);
    if (socialReq) {
      // TODO: Implement social login with backend
      console.log('Social login not fully implemented yet', socialReq);
      socialLoginSignal.value = null;
    }
  });

  // Handle logout requests
  useTask$(async ({ track }) => {
    const shouldLogout = track(() => logoutSignal.value);
    if (shouldLogout) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.token}`
          },
          credentials: 'include'
        });
      } catch (e) {
        console.error('Logout error', e);
      } finally {
        authState.user = null;
        authState.token = null;
        authState.isAuthenticated = false;
        
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
        
        logoutSignal.value = false;
      }
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
      
      // Update in localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(authState.user));
      }
      
      updateProfileSignal.value = null;
    }
  });

// ... interface definition update in separate block or assume it's done below ...

  // Handle personal info update requests
  useTask$(async ({ track }) => {
    const personalInfo = track(() => updatePersonalInfoSignal.value);
    if (personalInfo && authState.user) {
      // Optimistic update
      authState.user.name = personalInfo.name;
      authState.user.phone = personalInfo.phone;
      authState.user.location = personalInfo.location;
      authState.user.birthDate = personalInfo.birthDate;
      authState.user.bio = personalInfo.bio;
      
      // Update in localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(authState.user));
      }

      try {
        await fetch(`${API_URL}/users/me/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authState.token}`
          },
          body: JSON.stringify({
             bio: personalInfo.bio,
             // Map other fields if backend expects them in profile
             // Currently backend expects: languages, skills, seniority, availability, bio, github...
             // It doesn't seem to have phone, name, birthDate in UserProfile but in User model?
             // UpsertUserProfile only updates UserProfile model.
             // We might need a separate endpoint for User model updates or update upsertUserProfile to handle User model updates too?
             // For now, let's send what we can. 
             location: personalInfo.location,
             locationGeo: personalInfo.coordinates
          })
        });
      } catch (error) {
        console.error('Failed to update profile on server', error);
        // revert optimistic update?
      }
      
      updatePersonalInfoSignal.value = null;
    }
  });

  // Handle avatar update requests
  useTask$(({ track }) => {
    const avatarUpdate = track(() => updateAvatarSignal.value);
    if (avatarUpdate && authState.user) {
      authState.user.avatar = avatarUpdate.avatar;
      
      // Update in localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(authState.user));
      }
      
      updateAvatarSignal.value = null;
    }
  });

  useContextProvider(AuthContext, authState);

  return <Slot />;
});

export const useAuth = () => {
  return useContext(AuthContext);
};