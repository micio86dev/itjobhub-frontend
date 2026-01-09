import { component$, useStore, $, useTask$, useVisibleTask$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";
import { useTranslate, translate, useI18n } from "~/contexts/i18n";
import { ProfileWizard } from "~/components/wizard/profile-wizard";
import { LocationAutocomplete } from "~/components/ui/location-autocomplete";
import type { WizardData } from "~/contexts/auth";

interface EditFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  birthDate: string;
  bio: string;
  coordinates?: { lat: number; lng: number };
}

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();
  const t = useTranslate();
  
  // Extract values to avoid serialization issues
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user;
  
  const fileInputRef = useSignal<HTMLInputElement | undefined>();
  
  const state = useStore({
    isEditing: false,
    editingSection: '' as 'profile' | 'personal' | '',
    shouldRedirect: false,
    message: { type: 'success' as 'success' | 'error', text: '' },
    formData: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      birthDate: user?.birthDate || '',
      bio: user?.bio || ''
    } as EditFormData
  });

  // Check authentication and set redirect flag
  useTask$(({ track }) => {
    const currentlyAuthenticated = track(() => isAuthenticated);
    if (!currentlyAuthenticated) {
      state.shouldRedirect = true;
    }
  });

  // Handle redirect on client side only, but double check simple auth presence
  useVisibleTask$(({ track }) => {
    const shouldRedirect = track(() => state.shouldRedirect);
    if (shouldRedirect) {
      // Double check if we really need to redirect, maybe auth state is still loading
      const token = localStorage.getItem('auth_token');
      if (!token) {
        window.location.href = '/login';
      }
    }
  });

  // Update form data when user changes
  useTask$(({ track }) => {
    const currentUser = track(() => user);
    if (currentUser) {
      state.formData = {
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        birthDate: currentUser.birthDate || '',
        bio: currentUser.bio || ''
      };
    }
  });
  
  // Watch for profile update results
  useTask$(({ track }) => {
    const result = track(() => auth.profileUpdateResult.value);
    if (result) {
      if (result.success) {
        state.message = { type: 'success', text: translate('profile.update_success', i18n.currentLanguage) };
      } else {
        state.message = { type: 'error', text: result.error || translate('profile.update_error', i18n.currentLanguage) };
      }
      auth.profileUpdateResult.value = null;
      // Clear message after 5 seconds
      setTimeout(() => {
        state.message.text = '';
      }, 5000);
    }
  });

  // Watch for avatar update results
  useTask$(({ track }) => {
    const result = track(() => auth.avatarUpdateResult.value);
    if (result) {
      if (result.success) {
        state.message = { type: 'success', text: translate('profile.avatar_success', i18n.currentLanguage) };
      } else {
        state.message = { type: 'error', text: result.error ? translate(result.error, i18n.currentLanguage) : translate('profile.avatar_error', i18n.currentLanguage) };
      }
      auth.avatarUpdateResult.value = null;
      setTimeout(() => {
        state.message.text = '';
      }, 5000);
    }
  });

  // Return early if not authenticated to prevent rendering
  if (!isAuthenticated) {
    return null;
  }

  const handleEditProfile = $(() => {
    state.isEditing = true;
    state.editingSection = 'profile';
  });

  const handleEditPersonal = $(() => {
    state.isEditing = true;
    state.editingSection = 'personal';
  });

  const handleWizardComplete = $((data: WizardData) => {
    // Trigger profile update through signal
    auth.updateProfileSignal.value = data;
    state.isEditing = false;
    state.editingSection = '';
  });

  const handleCancelEdit = $(() => {
    state.isEditing = false;
    state.editingSection = '';
    // Reset form data
    state.formData = {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      birthDate: user?.birthDate || '',
      bio: user?.bio || ''
    };
  });

  const handleSavePersonal = $(() => {
    // Trigger personal info update through signal
    auth.updatePersonalInfoSignal.value = state.formData;
    state.isEditing = false;
    state.editingSection = '';
  });

  const handleAvatarClick = $(() => {
    fileInputRef.value?.click();
  });

  const handleAvatarChange = $((event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          // Trigger avatar update through signal
          auth.updateAvatarSignal.value = { avatar: result };
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // Show wizard if editing profile data
  if (state.isEditing && state.editingSection === 'profile') {
    const initialData: Partial<WizardData> = {
      languages: user?.languages || [],
      skills: user?.skills || [],
      seniority: (user?.seniority as 'junior' | 'mid' | 'senior' | '') || '',
      availability: (user?.availability as 'full-time' | 'part-time' | 'busy' | '') || ''
    };
    return (
      <ProfileWizard 
        initialData={initialData}
        onComplete$={handleWizardComplete}
        onCancel$={handleCancelEdit}
      />
    );
  }

  const formatAvailability = $((availability: string) => {
    switch (availability) {
      case 'full-time': return t('jobs.full_time');
      case 'part-time': return t('jobs.part_time');
      case 'busy': return t('profile.occupied');
      default: return availability;
    }
  });

  const formatSeniority = $((seniority: string) => {
    switch (seniority) {
      case 'junior': return t('jobs.junior');
      case 'mid': return t('jobs.mid');
      case 'senior': return t('jobs.senior');
      default: return seniority;
    }
  });

  return (
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
        {/* Feedback Message */}
        {state.message.text && (
          <div class={`p-4 rounded-t-lg text-center text-sm font-medium ${
            state.message.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
          }`}>
            {state.message.text}
          </div>
        )}
        {/* Header */}
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="relative">
                <div class="w-20 h-20 bg-indigo-500 dark:bg-indigo-600 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" class="w-full h-full object-cover" width="80" height="80" />
                  ) : (
                    <span class="text-2xl font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <button 
                  class="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800"
                  onClick$={handleAvatarClick}
                  title={t('profile.change_avatar')}
                >
                  <svg class="w-3 h-3 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                {/* Hidden file input for avatar upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  class="hidden"
                  onChange$={handleAvatarChange}
                />
              </div>
              <div class="ml-4">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.name || t('profile.title')}
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
                {user?.location && (
                  <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {user.location}
                  </p>
                )}
                {user?.profileCompleted && (
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 mt-1">
                    {t('profile.completed')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile content */}
        <div class="px-4 py-5 sm:p-6">
          {!user?.profileCompleted ? (
            <div class="text-center py-12">
              <div class="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('profile.complete_profile')}
              </h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4">
                {t('profile.complete_desc')}
              </p>
              <button 
                onClick$={handleEditProfile}
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                {t('profile.complete_profile')}
              </button>
            </div>
          ) : (
            <div class="space-y-8">
              {/* Personal Information */}
              <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                    {t('profile.personal_info')}
                  </h3>
                  <button 
                    onClick$={handleEditPersonal}
                    class="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    {t('profile.edit_profile')}
                  </button>
                </div>

                {state.isEditing && state.editingSection === 'personal' ? (
                  <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('profile.name_label')}
                        </label>
                        <input
                          type="text"
                          value={state.formData.name}
                          onInput$={(e) => state.formData.name = (e.target as HTMLInputElement).value}
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('profile.phone_label')}
                        </label>
                        <input
                          type="tel"
                          value={state.formData.phone}
                          onInput$={(e) => state.formData.phone = (e.target as HTMLInputElement).value}
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                        />
                      </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('profile.location_label')}
                        </label>
                        <LocationAutocomplete
                          value={state.formData.location}
                          onInput$={(val) => state.formData.location = val}
                          onLocationSelect$={(location, coordinates) => {
                             state.formData.location = location;
                             // Store coordinates in formData (need to add coordinates to EditFormData interface first)
                             // Assuming I will add it in a subsequent step or previous step was missed?
                             // I need to update EditFormData interface in this file too!
                             // For now I'll cast to any or add it.
                             (state.formData as any).coordinates = coordinates;
                          }}
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('profile.birth_date_label')}
                        </label>
                        <input
                          type="date"
                          value={state.formData.birthDate}
                          onInput$={(e) => state.formData.birthDate = (e.target as HTMLInputElement).value}
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('profile.bio_label')}
                      </label>
                      <textarea
                        value={state.formData.bio}
                        onInput$={(e) => state.formData.bio = (e.target as HTMLTextAreaElement).value}
                        rows={4}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                        placeholder={t('profile.complete_desc')}
                      />
                    </div>
                    <div class="flex space-x-3">
                      <button
                        onClick$={handleSavePersonal}
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      >
                        {t('profile.save_changes')}
                      </button>
                      <button
                        onClick$={handleCancelEdit}
                        class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      >
                        {t('profile.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.name_label')}</dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">{user.name || '-'}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.email_label')}</dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">{user.email || '-'}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.phone_label')}</dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">{user.phone || '-'}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.location_label')}</dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">{user.location || '-'}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.birth_date_label')}</dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">{user.birthDate || '-'}</dd>
                    </div>
                    {user.bio && (
                      <div class="md:col-span-2">
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.bio_label')}</dt>
                        <dd class="mt-1 text-sm text-gray-900 dark:text-white">{user.bio}</dd>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Professional Information */}
              <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                    {t('profile.professional_info')}
                  </h3>
                  <button 
                    onClick$={handleEditProfile}
                    class="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    {t('profile.edit_profile')}
                  </button>
                </div>

                <div class="space-y-6">
                  {/* Languages */}
                  <div>
                    <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      {t('profile.languages_title')}
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      {user.languages?.map((lang) => (
                        <span
                          key={lang}
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      {t('profile.skills_title')}
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      {user.skills?.map((skill) => (
                        <span
                          key={skill}
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Seniority & Availability */}
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                        {t('profile.seniority_title')}
                      </h4>
                      <div class="flex items-center">
                        <div class="w-3 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full mr-3"></div>
                        <span class="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {formatSeniority(user.seniority || '')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                        {t('profile.availability_title')}
                      </h4>
                      <div class="flex items-center">
                        <div class="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full mr-3"></div>
                        <span class="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {formatAvailability(user.availability || '')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = () => {
  const t = (key: string) => translate(key, 'it');
  return {
    title: t('meta.profile_title'),
    meta: [
      {
        name: "description",
        content: t('meta.profile_description'),
      },
    ],
  };
};
