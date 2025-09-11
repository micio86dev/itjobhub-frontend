import { component$, useStore, $ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";
import { ProfileWizard } from "~/components/wizard/profile-wizard";
import type { WizardData } from "~/contexts/auth";

export default component$(() => {
  const auth = useAuth();
  const nav = useNavigate();
  
  // Extract values to avoid serialization issues
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user;
  
  const state = useStore({
    isEditing: false
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    nav('/login');
    return null;
  }

  const handleEditProfile = $(() => {
    state.isEditing = true;
  });

  const handleWizardComplete = $((data: WizardData) => {
    // Trigger profile update through signal
    auth.updateProfileSignal.value = data;
    state.isEditing = false;
  });

  const handleCancelEdit = $(() => {
    state.isEditing = false;
  });

  // Show wizard if editing
  if (state.isEditing) {
    const initialData: Partial<WizardData> = {
      languages: user?.languages || [],
      skills: user?.skills || [],
      seniority: (user?.seniority as 'junior' | 'mid' | 'senior' | '') || '',
      availability: (user?.availability as 'full-time' | 'part-time' | 'occupato' | '') || ''
    };
    
    return (
      <ProfileWizard 
        initialData={initialData}
        onComplete$={handleWizardComplete}
        onCancel$={handleCancelEdit}
      />
    );
  }

  return (
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg">
        {/* Header */}
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center">
                <span class="text-xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div class="ml-4">
                <h1 class="text-2xl font-bold text-gray-900">
                  {user?.name || 'Utente'}
                </h1>
                <p class="text-sm text-gray-500">
                  {user?.email}
                </p>
                {user?.profileCompleted && (
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                    Profilo completato
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick$={handleEditProfile}
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Modifica Profilo
            </button>
          </div>
        </div>

        {/* Profile content */}
        <div class="px-4 py-5 sm:p-6">
          {!user?.profileCompleted ? (
            <div class="text-center py-12">
              <div class="w-12 h-12 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                Completa il tuo profilo
              </h3>
              <p class="text-gray-500 mb-4">
                Aggiungi le tue competenze e preferenze per trovare le migliori opportunità di lavoro
              </p>
              <button 
                onClick$={handleEditProfile}
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Completa Profilo
              </button>
            </div>
          ) : (
            <div class="space-y-6">
              {/* Languages */}
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-3">Lingue parlate</h3>
                <div class="flex flex-wrap gap-2">
                  {user.languages?.map((lang) => (
                    <span
                      key={lang}
                      class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-3">Competenze tecniche</h3>
                <div class="flex flex-wrap gap-2">
                  {user.skills?.map((skill) => (
                    <span
                      key={skill}
                      class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Seniority & Availability */}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 class="text-lg font-medium text-gray-900 mb-3">Livello di seniority</h3>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                    <span class="text-sm font-medium capitalize">
                      {user.seniority === 'mid' ? 'Mid-level' : user.seniority}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 class="text-lg font-medium text-gray-900 mb-3">Disponibilità</h3>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span class="text-sm font-medium capitalize">
                      {user.availability === 'full-time' ? 'Full-time' : 
                       user.availability === 'part-time' ? 'Part-time' : 
                       'Attualmente occupato'}
                    </span>
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

export const head: DocumentHead = {
  title: "Profilo - ITJobHub",
  meta: [
    {
      name: "description",
      content: "Il tuo profilo ITJobHub",
    },
  ],
};