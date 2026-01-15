import {
  createContextId,
  Slot,
  component$,
  useStore,
  useContext,
  useContextProvider,
  useSignal,
  useTask$,
  useOnWindow,
  Signal,
  $,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { request } from "../utils/api";
import { setCookie, deleteCookie } from "../utils/cookies";

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
  availability?: 'full-time' | 'part-time' | 'busy';
  profileCompleted?: boolean;
  role?: string;
  language?: string;
  location_geo?: {
    type: string;
    coordinates: number[];
  };
}

export interface WizardData {
  languages: string[];
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior' | '';
  availability: 'full-time' | 'part-time' | 'busy' | '';
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
  loginSignal: Signal<LoginRequest | null>;
  registerSignal: Signal<RegisterRequest | null>;
  socialLoginSignal: Signal<SocialLoginRequest | null>;
  logoutSignal: Signal<boolean>;
  updateProfileSignal: Signal<WizardData | null>;
  updatePersonalInfoSignal: Signal<PersonalInfoUpdate | null>;
  updateAvatarSignal: Signal<AvatarUpdateRequest | null>;
  loginResult: Signal<{ success: boolean, error?: string } | null>;
  registerResult: Signal<{ success: boolean, error?: string } | null>;
  profileUpdateResult: Signal<{ success: boolean, error?: string } | null>;
  avatarUpdateResult: Signal<{ success: boolean, error?: string } | null>;
}

export const AuthContext = createContextId<AuthState>('auth-context');

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';

export const AuthProvider = component$((props: { initialUser?: User | null, initialToken?: string | null }) => {
  const nav = useNavigate();

  // Create signals for actions
  const loginSignal = useSignal<LoginRequest | null>(null);
  const registerSignal = useSignal<RegisterRequest | null>(null);
  const socialLoginSignal = useSignal<SocialLoginRequest | null>(null);
  const logoutSignal = useSignal(false);
  const updateProfileSignal = useSignal<WizardData | null>(null);
  const updatePersonalInfoSignal = useSignal<PersonalInfoUpdate | null>(null);
  const updateAvatarSignal = useSignal<AvatarUpdateRequest | null>(null);

  // Create result signals
  const loginResult = useSignal<{ success: boolean, error?: string } | null>(null);
  const registerResult = useSignal<{ success: boolean, error?: string } | null>(null);
  const profileUpdateResult = useSignal<{ success: boolean, error?: string } | null>(null);
  const avatarUpdateResult = useSignal<{ success: boolean, error?: string } | null>(null);

  const authState = useStore<AuthState>({
    user: props.initialUser || null,
    isAuthenticated: !!props.initialToken,
    token: props.initialToken || null,
    loginSignal,
    registerSignal,
    socialLoginSignal,
    logoutSignal,
    updateProfileSignal,
    updatePersonalInfoSignal,
    updateAvatarSignal,
    loginResult,
    registerResult,
    profileUpdateResult,
    avatarUpdateResult
  });

  // Handle unauthorized event
  const handleUnauthorized = $(() => {
    if (authState.isAuthenticated) {
      authState.logoutSignal.value = true;
    }
  });
  useOnWindow('unauthorized', handleUnauthorized);

  // Handle login requests
  useTask$(async ({ track }) => {
    const loginReq = track(() => loginSignal.value);
    if (!loginReq) return;

    try {
      const response = await request(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': authState.user?.language || 'it',
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

        if (typeof document !== 'undefined') {
          setCookie('auth_token', token);
          setCookie('auth_user', JSON.stringify(authState.user));
        }

        loginResult.value = { success: true };
      } else {
        loginResult.value = { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      loginResult.value = { success: false, error: 'Network error or server unavailable' };
    } finally {
      loginSignal.value = null;
    }
  });

  // Handle register requests
  useTask$(async ({ track }) => {
    const registerReq = track(() => registerSignal.value);
    if (!registerReq) return;

    try {
      const nameParts = (registerReq.name || '').split(' ');
      const firstName = registerReq.firstName || nameParts[0] || 'User';
      const lastName = registerReq.lastName || nameParts.slice(1).join(' ') || 'New';

      const payload = {
        email: registerReq.email,
        password: registerReq.password,
        firstName,
        lastName
      };

      const response = await request(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': authState.user?.language || 'it',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
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

        if (typeof document !== 'undefined') {
          setCookie('auth_token', token);
          setCookie('auth_user', JSON.stringify(authState.user));
        }

        registerResult.value = { success: true };
      } else {
        console.error('Registration failed response:', data);
        registerResult.value = { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error detailed:', error);
      registerResult.value = { success: false, error: 'Network error or server unavailable' };
    } finally {
      registerSignal.value = null;
    }
  });

  // Handle social login requests
  useTask$(async ({ track }) => {
    const socialReq = track(() => socialLoginSignal.value);
    if (!socialReq) return;

    console.log('Social login not fully implemented yet', socialReq);
    socialLoginSignal.value = null;
  });

  // Handle logout requests
  useTask$(async ({ track }) => {
    const shouldLogout = track(() => logoutSignal.value);
    if (!shouldLogout) return;

    try {
      await request(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Accept-Language': authState.user?.language || 'it',
        },
        credentials: 'include'
      });
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      authState.user = null;
      authState.token = null;
      authState.isAuthenticated = false;

      if (typeof document !== 'undefined') {
        deleteCookie('auth_token');
        deleteCookie('auth_user');
        nav('/login');
      }

      logoutSignal.value = false;
    }
  });

  // Handle profile update requests
  useTask$(async ({ track }) => {
    const wizardData = track(() => updateProfileSignal.value);
    if (!wizardData || !authState.user) return;

    authState.user.languages = wizardData.languages;
    authState.user.skills = wizardData.skills;
    authState.user.seniority = wizardData.seniority || undefined;
    authState.user.availability = wizardData.availability || undefined;
    authState.user.profileCompleted = true;

    if (typeof document !== 'undefined') {
      setCookie('auth_user', JSON.stringify(authState.user));
    }

    try {
      const response = await request(`${API_URL}/users/me/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
          'Accept-Language': authState.user?.language || 'it',
        },
        body: JSON.stringify({
          languages: wizardData.languages,
          skills: wizardData.skills,
          seniority: wizardData.seniority,
          availability: wizardData.availability
        })
      });

      if (response.ok) {
        profileUpdateResult.value = { success: true };
      } else {
        const data = await response.json();
        profileUpdateResult.value = { success: false, error: data.message || 'Failed to save profile data' };
      }
    } catch (error) {
      console.error('Failed to update profile on server', error);
      profileUpdateResult.value = { success: false, error: 'Failed to save profile data' };
    } finally {
      updateProfileSignal.value = null;
    }
  });

  // Handle personal info update requests
  useTask$(async ({ track }) => {
    const personalInfo = track(() => updatePersonalInfoSignal.value);
    if (!personalInfo || !authState.user) return;

    authState.user.name = personalInfo.name;
    authState.user.phone = personalInfo.phone;
    authState.user.location = personalInfo.location;
    authState.user.birthDate = personalInfo.birthDate;
    authState.user.bio = personalInfo.bio;

    if (typeof document !== 'undefined') {
      setCookie('auth_user', JSON.stringify(authState.user));
    }

    try {
      const response = await request(`${API_URL}/users/me/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({
          bio: personalInfo.bio,
          name: personalInfo.name,
          phone: personalInfo.phone,
          birthDate: personalInfo.birthDate,
          location: personalInfo.location,
          locationGeo: personalInfo.coordinates
        })
      });

      if (response.ok) {
        profileUpdateResult.value = { success: true };
      } else {
        const data = await response.json();
        profileUpdateResult.value = { success: false, error: data.message || 'Failed to save personal info' };
      }
    } catch (error) {
      console.error('Failed to update profile on server', error);
      profileUpdateResult.value = { success: false, error: 'Network error or server unavailable' };
    } finally {
      updatePersonalInfoSignal.value = null;
    }
  });

  // Handle avatar update requests
  useTask$(async ({ track }) => {
    const avatarUpdate = track(() => updateAvatarSignal.value);
    if (!avatarUpdate || !authState.user) return;

    authState.user.avatar = avatarUpdate.avatar;

    if (typeof document !== 'undefined') {
      setCookie('auth_user', JSON.stringify(authState.user));
    }

    try {
      await request(`${API_URL}/users/me/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({
          avatar: avatarUpdate.avatar
        })
      });

      avatarUpdateResult.value = { success: true };
    } catch (error) {
      console.error('Failed to update avatar on server', error);
      avatarUpdateResult.value = { success: false, error: 'Network error or server unavailable' };
    } finally {
      updateAvatarSignal.value = null;
    }
  });

  useContextProvider(AuthContext, authState);

  return <Slot />;
});

export const useAuth = () => {
  return useContext(AuthContext);
};
