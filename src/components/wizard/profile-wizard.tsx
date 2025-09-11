import { component$, useStore, $, type QRL } from "@builder.io/qwik";
import type { WizardData } from "~/contexts/auth";
import { TagInput } from "~/components/ui/tag-input";

interface ProfileWizardProps {
  initialData?: Partial<WizardData>;
  onComplete$: QRL<(data: WizardData) => void>;
  onCancel$?: QRL<() => void>;
}

const LANGUAGE_SUGGESTIONS = [
  'Italiano', 'Inglese', 'Francese', 'Spagnolo', 'Tedesco', 'Portoghese',
  'Russo', 'Cinese', 'Giapponese', 'Arabo', 'Olandese', 'Svedese'
];

const SKILL_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
  'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C#', '.NET',
  'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Rust', 'Swift', 'Kotlin',
  'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap', 'MySQL', 'PostgreSQL',
  'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
  'Git', 'CI/CD', 'Linux', 'Nginx', 'Apache', 'GraphQL', 'REST API'
];

export const ProfileWizard = component$<ProfileWizardProps>(({ 
  initialData, 
  onComplete$, 
  onCancel$ 
}) => {
  const state = useStore({
    currentStep: 1,
    data: {
      languages: initialData?.languages || [],
      skills: initialData?.skills || [],
      seniority: initialData?.seniority || '',
      availability: initialData?.availability || ''
    } as WizardData
  });

  const nextStep = $(() => {
    if (state.currentStep < 4) {
      state.currentStep++;
    }
  });

  const prevStep = $(() => {
    if (state.currentStep > 1) {
      state.currentStep--;
    }
  });

  const handleComplete = $(() => {
    onComplete$(state.data);
  });

  const canProceed = $(() => {
    switch (state.currentStep) {
      case 1: return state.data.languages.length > 0;
      case 2: return state.data.skills.length > 0;
      case 3: return state.data.seniority !== '';
      case 4: return state.data.availability !== '';
      default: return false;
    }
  });

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-4 px-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        {/* Progress indicator */}
        <div class="mb-8">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-900">
              Step {state.currentStep} of 4
            </span>
            <span class="text-sm text-gray-500">
              {Math.round((state.currentStep / 4) * 100)}%
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={`width: ${(state.currentStep / 4) * 100}%`}
            ></div>
          </div>
        </div>

        {/* Step content */}
        {state.currentStep === 1 && (
          <div class="space-y-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2">
                Lingue parlate
              </h2>
              <p class="text-sm text-gray-600 mb-4">
                Seleziona le lingue che parli fluentemente
              </p>
              <TagInput
                value={state.data.languages}
                onChange$={(languages) => state.data.languages = languages}
                placeholder="Aggiungi una lingua..."
                suggestions={LANGUAGE_SUGGESTIONS}
              />
            </div>
          </div>
        )}

        {state.currentStep === 2 && (
          <div class="space-y-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2">
                Skills tecniche
              </h2>
              <p class="text-sm text-gray-600 mb-4">
                Aggiungi le tue competenze tecniche principali
              </p>
              <TagInput
                value={state.data.skills}
                onChange$={(skills) => state.data.skills = skills}
                placeholder="Aggiungi una skill..."
                suggestions={SKILL_SUGGESTIONS}
              />
            </div>
          </div>
        )}

        {state.currentStep === 3 && (
          <div class="space-y-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2">
                Livello di seniority
              </h2>
              <p class="text-sm text-gray-600 mb-4">
                Seleziona il tuo livello di esperienza
              </p>
              <div class="space-y-3">
                {[
                  { value: 'junior', label: 'Junior', desc: '0-2 anni di esperienza' },
                  { value: 'mid', label: 'Mid-level', desc: '2-5 anni di esperienza' },
                  { value: 'senior', label: 'Senior', desc: '5+ anni di esperienza' }
                ].map((option) => (
                  <label
                    key={option.value}
                    class={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      state.data.seniority === option.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="seniority"
                      value={option.value}
                      checked={state.data.seniority === option.value}
                      onChange$={() => state.data.seniority = option.value as any}
                      class="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div class="ml-3">
                      <div class="font-medium text-gray-900">{option.label}</div>
                      <div class="text-sm text-gray-500">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {state.currentStep === 4 && (
          <div class="space-y-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2">
                Disponibilità
              </h2>
              <p class="text-sm text-gray-600 mb-4">
                Indica la tua disponibilità lavorativa
              </p>
              <div class="space-y-3">
                {[
                  { value: 'full-time', label: 'Full-time', desc: 'Disponibile per lavoro a tempo pieno' },
                  { value: 'part-time', label: 'Part-time', desc: 'Disponibile per lavoro part-time' },
                  { value: 'occupato', label: 'Attualmente occupato', desc: 'In cerca di nuove opportunità' }
                ].map((option) => (
                  <label
                    key={option.value}
                    class={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      state.data.availability === option.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="availability"
                      value={option.value}
                      checked={state.data.availability === option.value}
                      onChange$={() => state.data.availability = option.value as any}
                      class="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div class="ml-3">
                      <div class="font-medium text-gray-900">{option.label}</div>
                      <div class="text-sm text-gray-500">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div class="flex justify-between pt-6 mt-6 border-t border-gray-200">
          <div class="flex space-x-2">
            {state.currentStep > 1 && (
              <button
                onClick$={prevStep}
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Indietro
              </button>
            )}
            {onCancel$ && (
              <button
                onClick$={onCancel$}
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Annulla
              </button>
            )}
          </div>
          
          <div>
            {state.currentStep < 4 ? (
              <button
                onClick$={nextStep}
                disabled={!canProceed()}
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Avanti
              </button>
            ) : (
              <button
                onClick$={handleComplete}
                disabled={!canProceed()}
                class="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Completa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});