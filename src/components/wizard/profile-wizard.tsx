import { component$, useStore, $, type QRL } from "@builder.io/qwik";
import type { WizardData } from "~/contexts/auth";
import { useTranslate, interpolate } from "~/contexts/i18n";
import { TagInput } from "~/components/ui/tag-input";

interface ProfileWizardProps {
  initialData?: Partial<WizardData>;
  onComplete$: QRL<(data: WizardData) => void>;
  onCancel$?: QRL<() => void>;
}

// Language names in English (universal across languages)
const LANGUAGE_SUGGESTIONS = [
  'Italian', 'English', 'French', 'Spanish', 'German', 'Portuguese',
  'Russian', 'Chinese', 'Japanese', 'Arabic', 'Dutch', 'Swedish'
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
  const t = useTranslate();
  
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

  const getCanProceed = () => {
    switch (state.currentStep) {
      case 1: return state.data.languages.length > 0;
      case 2: return state.data.skills.length > 0;
      case 3: return state.data.seniority !== '';
      case 4: return state.data.availability !== '';
      default: return false;
    }
  };

  // Get step text with proper interpolation
  const getStepText = async () => {
    const template = await t('wizard.step_of');
    return interpolate(template, { 
      current: state.currentStep.toString(), 
      total: '4' 
    });
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-4 px-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        {/* Progress indicator */}
        <div class="mb-8">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-900">
              {getStepText()}
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
                {t('wizard.languages_step')}
              </h2>
              <p class="text-sm text-gray-600 mb-4">
                {t('wizard.languages_desc')}
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
                {t('wizard.skills_step')}
              </h2>
              <p class="text-sm text-gray-600 mb-4">
                {t('wizard.skills_desc')}
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
                {t('wizard.seniority_step')}
              </h2>
              <p class="text-sm text-gray-600 mb-4">
                {t('wizard.seniority_desc')}
              </p>
              <div class="space-y-3">
                {[
                  { value: 'junior', labelKey: 'wizard.junior_label', descKey: 'wizard.junior_desc' },
                  { value: 'mid', labelKey: 'wizard.mid_label', descKey: 'wizard.mid_desc' },
                  { value: 'senior', labelKey: 'wizard.senior_label', descKey: 'wizard.senior_desc' }
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
                      <div class="font-medium text-gray-900">{t(option.labelKey)}</div>
                      <div class="text-sm text-gray-500">{t(option.descKey)}</div>
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
                {t('wizard.availability_step')}
              </h2>
              <p class="text-sm text-gray-600 mb-4">
                {t('wizard.availability_desc')}
              </p>
              <div class="space-y-3">
                {[
                  { value: 'full-time', labelKey: 'wizard.fulltime_label', descKey: 'wizard.fulltime_desc' },
                  { value: 'part-time', labelKey: 'wizard.parttime_label', descKey: 'wizard.parttime_desc' },
                  { value: 'occupato', labelKey: 'wizard.occupied_label', descKey: 'wizard.occupied_desc' }
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
                      <div class="font-medium text-gray-900">{t(option.labelKey)}</div>
                      <div class="text-sm text-gray-500">{t(option.descKey)}</div>
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
                {t('wizard.back')}
              </button>
            )}
            {onCancel$ && (
              <button
                onClick$={onCancel$}
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('wizard.cancel')}
              </button>
            )}
          </div>
          
          <div>
            {state.currentStep < 4 ? (
              <button
                onClick$={nextStep}
                disabled={!getCanProceed()}
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('wizard.next')}
              </button>
            ) : (
              <button
                onClick$={handleComplete}
                disabled={!getCanProceed()}
                class="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('wizard.complete')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});