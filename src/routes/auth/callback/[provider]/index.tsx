import { component$, useTask$, useStore, useStylesScoped$ } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";
import { useTranslate } from "~/contexts/i18n";
import { request } from "~/utils/api";
import { setCookie } from "~/utils/cookies";

interface CallbackState {
    loading: boolean;
    error: string;
    success: boolean;
}

const styles = `
.callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.callback-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 0.875rem;
}

.error-container {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}

.error-text {
  color: #dc2626;
  font-size: 0.875rem;
}

.retry-link {
  display: inline-block;
  margin-top: 1rem;
  color: #667eea;
  font-weight: 500;
  text-decoration: none;
}

.retry-link:hover {
  text-decoration: underline;
}

.success-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: #10b981;
}
`;

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';

export default component$(() => {
    useStylesScoped$(styles);
    const location = useLocation();
    const nav = useNavigate();
    const auth = useAuth();
    const t = useTranslate();

    const state = useStore<CallbackState>({
        loading: true,
        error: '',
        success: false,
    });

    // Process OAuth callback
    useTask$(async ({ track }) => {
        track(() => location.url.href);

        const provider = location.params.provider;
        const code = location.url.searchParams.get('code');
        const error = location.url.searchParams.get('error');

        if (error) {
            state.loading = false;
            state.error = location.url.searchParams.get('error_description') || 'OAuth authorization was denied';
            return;
        }

        if (!code) {
            state.loading = false;
            state.error = 'No authorization code received';
            return;
        }

        if (!['github', 'linkedin', 'google'].includes(provider)) {
            state.loading = false;
            state.error = `Invalid provider: ${provider}`;
            return;
        }

        try {
            // Exchange code for tokens with backend
            const response = await request(`${API_URL}/auth/oauth/${provider}/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    code,
                    state: location.url.searchParams.get('state'),
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const { user, token } = data.data;

                // Update auth state
                auth.user = {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                    role: user.role,
                    phone: user.phone,
                    location: user.location,
                    bio: user.bio,
                    birthDate: user.birthDate,
                    avatar: user.avatar,
                    languages: user.languages || [],
                    skills: user.skills || [],
                    seniority: user.seniority,
                    availability: user.availability,
                    profileCompleted: user.profileCompleted,
                };
                auth.token = token;
                auth.isAuthenticated = true;

                // Store token in cookie
                if (typeof document !== 'undefined') {
                    setCookie('auth_token', token);
                }

                state.loading = false;
                state.success = true;

                // Redirect after short delay
                setTimeout(() => {
                    if (!user.profileCompleted) {
                        nav('/wizard');
                    } else {
                        nav('/');
                    }
                }, 1500);
            } else {
                state.loading = false;
                state.error = data.message || 'OAuth authentication failed';
            }
        } catch (err) {
            console.error('OAuth callback error:', err);
            state.loading = false;
            state.error = 'Failed to complete authentication. Please try again.';
        }
    });

    return (
        <div class="callback-container">
            <div class="callback-card">
                {state.loading && (
                    <>
                        <div class="spinner" />
                        <h2 class="title">{t('auth.oauth_processing')}</h2>
                        <p class="subtitle">{t('auth.oauth_please_wait')}</p>
                    </>
                )}

                {state.success && (
                    <>
                        <svg class="success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <h2 class="title">{t('auth.oauth_success')}</h2>
                        <p class="subtitle">{t('auth.oauth_redirecting')}</p>
                    </>
                )}

                {state.error && (
                    <>
                        <svg class="success-icon" style="color: #dc2626" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <h2 class="title">{t('auth.oauth_error')}</h2>
                        <div class="error-container">
                            <p class="error-text">{state.error}</p>
                        </div>
                        <a href="/login" class="retry-link">{t('auth.oauth_try_again')}</a>
                    </>
                )}
            </div>
        </div>
    );
});

export const head: DocumentHead = {
    title: 'OAuth Callback - ITJobHub',
    meta: [
        {
            name: "description",
            content: 'Processing OAuth authentication',
        },
    ],
};
