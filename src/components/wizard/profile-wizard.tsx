import {
  component$,
  useStore,
  $,
  type QRL,
  useStylesScoped$,
} from "@builder.io/qwik";
import type { WizardData } from "~/contexts/auth";
import { useTranslate, interpolate } from "~/contexts/i18n";
import { TagInput } from "~/components/ui/tag-input";
import { Spinner } from "~/components/ui/spinner";
import styles from "./profile-wizard.css?inline";

interface ProfileWizardProps {
  initialData?: Partial<WizardData>;
  onComplete$: QRL<(data: WizardData) => void>;
  onCancel$?: QRL<() => void>;
}

// Language translation keys (will be translated based on user's browser language)
const LANGUAGE_SUGGESTION_KEYS = [
  "lang.italian",
  "lang.english",
  "lang.french",
  "lang.spanish",
  "lang.german",
  "lang.portuguese",
  "lang.russian",
  "lang.chinese",
  "lang.japanese",
  "lang.arabic",
  "lang.dutch",
  "lang.swedish",
];

const SKILL_SUGGESTIONS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Django",
  "Flask",
  "Java",
  "Spring Boot",
  "C#",
  ".NET",
  "PHP",
  "Laravel",
  "Ruby",
  "Rails",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "HTML",
  "CSS",
  "SASS",
  "Tailwind",
  "Bootstrap",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Git",
  "CI/CD",
  "Linux",
  "Nginx",
  "Apache",
  "GraphQL",
  "REST API",
];

export const ProfileWizard = component$<ProfileWizardProps>(
  ({ initialData, onComplete$, onCancel$ }) => {
    useStylesScoped$(styles);
    const t = useTranslate();

    const state = useStore({
      currentStep: 1,
      isSubmitting: false,
      data: {
        languages: initialData?.languages || [],
        skills: initialData?.skills || [],
        seniority: initialData?.seniority || "",
        availability: initialData?.availability || "",
        workModes: initialData?.workModes || [],
      } as WizardData,
    });

    const nextStep = $(() => {
      if (state.currentStep < 5) {
        state.currentStep++;
      }
    });

    const prevStep = $(() => {
      if (state.currentStep > 1) {
        state.currentStep--;
      }
    });

    const handleComplete = $(() => {
      state.isSubmitting = true;
      onComplete$(state.data);
    });

    const getCanProceed = () => {
      switch (state.currentStep) {
        case 1:
          return state.data.languages.length > 0;
        case 2:
          return state.data.skills.length > 0;
        case 3:
          return state.data.seniority !== "";
        case 4:
          return state.data.workModes.length > 0;
        case 5:
          return state.data.availability !== "";
        default:
          return false;
      }
    };

    return (
      <div class="wizard-overlay">
        <div class="wizard-card">
          {/* Progress bar */}
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-title">
                {interpolate(t("wizard.step_of"), {
                  current: state.currentStep.toString(),
                  total: "5",
                })}
              </span>
              <span class="progress-percent">
                {Math.round((state.currentStep / 5) * 100)}%
              </span>
            </div>
            <div class="progress-bar-bg">
              <div
                class="progress-bar-fill"
                style={`width: ${(state.currentStep / 5) * 100}%`}
              ></div>
            </div>
          </div>

          {/* Step content */}
          {state.currentStep === 1 && (
            <div class="step-container">
              <div>
                <h2 class="step-heading">{t("wizard.languages_step")}</h2>
                <p class="step-description">{t("wizard.languages_desc")}</p>
                <TagInput
                  value={state.data.languages}
                  onChange$={(languages) => (state.data.languages = languages)}
                  placeholder="Aggiungi una lingua..."
                  suggestions={LANGUAGE_SUGGESTION_KEYS.map((key) => t(key))}
                />
              </div>
            </div>
          )}

          {state.currentStep === 2 && (
            <div class="step-container">
              <div>
                <h2 class="step-heading">{t("wizard.skills_step")}</h2>
                <p class="step-description">{t("wizard.skills_desc")}</p>
                <TagInput
                  value={state.data.skills}
                  onChange$={(skills) => (state.data.skills = skills)}
                  placeholder="Aggiungi una skill..."
                  suggestions={SKILL_SUGGESTIONS}
                />
              </div>
            </div>
          )}

          {state.currentStep === 3 && (
            <div class="step-container">
              <div>
                <h2 class="step-heading">{t("wizard.seniority_step")}</h2>
                <p class="step-description">{t("wizard.seniority_desc")}</p>
                <div class="options-stack">
                  {[
                    // ... options unchanged ...
                    {
                      value: "junior",
                      labelKey: "wizard.junior_label",
                      descKey: "wizard.junior_desc",
                    },
                    {
                      value: "mid",
                      labelKey: "wizard.mid_label",
                      descKey: "wizard.mid_desc",
                    },
                    {
                      value: "senior",
                      labelKey: "wizard.senior_label",
                      descKey: "wizard.senior_desc",
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      for={`seniority-${option.value}`}
                      class={`option-card ${
                        state.data.seniority === option.value
                          ? "option-card-selected"
                          : "option-card-default"
                      }`}
                    >
                      <input
                        id={`seniority-${option.value}`}
                        aria-label={t(option.labelKey)}
                        type="radio"
                        name="seniority"
                        value={option.value}
                        checked={state.data.seniority === option.value}
                        onChange$={() =>
                          (state.data.seniority =
                            option.value as WizardData["seniority"])
                        }
                        class="option-input"
                      />
                      <div class="option-content">
                        <div class="option-title">{t(option.labelKey)}</div>
                        <div class="option-desc">{t(option.descKey)}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {state.currentStep === 4 && (
            <div class="step-container">
              <div>
                <h2 class="step-heading">{t("wizard.work_modes_step")}</h2>
                <p class="step-description">{t("wizard.work_modes_desc")}</p>
                <div class="options-stack">
                  {[
                    {
                      value: "remote",
                      labelKey: "wizard.remote_label",
                      descKey: "wizard.remote_desc",
                    },
                    {
                      value: "hybrid",
                      labelKey: "wizard.hybrid_label",
                      descKey: "wizard.hybrid_desc",
                    },
                    {
                      value: "onsite",
                      labelKey: "wizard.onsite_label",
                      descKey: "wizard.onsite_desc",
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      for={`workMode-${option.value}`}
                      class={`option-card ${
                        state.data.workModes.includes(option.value)
                          ? "option-card-selected"
                          : "option-card-default"
                      }`}
                    >
                      <input
                        id={`workMode-${option.value}`}
                        aria-label={t(option.labelKey)}
                        type="checkbox"
                        name="workModes"
                        value={option.value}
                        checked={state.data.workModes.includes(option.value)}
                        onChange$={() => {
                          if (state.data.workModes.includes(option.value)) {
                            state.data.workModes = state.data.workModes.filter(
                              (m) => m !== option.value,
                            );
                          } else {
                            state.data.workModes = [
                              ...state.data.workModes,
                              option.value,
                            ];
                          }
                        }}
                        class="option-input"
                      />
                      <div class="option-content">
                        <div class="option-title">{t(option.labelKey)}</div>
                        <div class="option-desc">{t(option.descKey)}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {state.currentStep === 5 && (
            <div class="step-container">
              <div>
                <h2 class="step-heading">{t("wizard.availability_step")}</h2>
                <p class="step-description">{t("wizard.availability_desc")}</p>
                <div class="options-stack">
                  {[
                    // ... options unchanged ...
                    {
                      value: "full-time",
                      labelKey: "wizard.fulltime_label",
                      descKey: "wizard.fulltime_desc",
                    },
                    {
                      value: "part-time",
                      labelKey: "wizard.parttime_label",
                      descKey: "wizard.parttime_desc",
                    },
                    {
                      value: "busy",
                      labelKey: "wizard.occupied_label",
                      descKey: "wizard.occupied_desc",
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      for={`availability-${option.value}`}
                      class={`option-card ${
                        state.data.availability === option.value
                          ? "option-card-selected"
                          : "option-card-default"
                      }`}
                    >
                      <input
                        id={`availability-${option.value}`}
                        aria-label={t(option.labelKey)}
                        type="radio"
                        name="availability"
                        value={option.value}
                        checked={state.data.availability === option.value}
                        onChange$={() =>
                          (state.data.availability =
                            option.value as WizardData["availability"])
                        }
                        class="option-input"
                      />
                      <div class="option-content">
                        <div class="option-title">{t(option.labelKey)}</div>
                        <div class="option-desc">{t(option.descKey)}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div class="nav-buttons">
            <div class="nav-left">
              {state.currentStep > 1 && (
                <button onClick$={prevStep} class="btn-secondary">
                  {t("wizard.back")}
                </button>
              )}
              {onCancel$ && (
                <button onClick$={onCancel$} class="btn-secondary">
                  {t("wizard.cancel")}
                </button>
              )}
            </div>

            <div>
              {state.currentStep < 5 ? (
                <button
                  onClick$={nextStep}
                  disabled={!getCanProceed()}
                  class="btn-primary"
                >
                  {t("wizard.next")}
                </button>
              ) : (
                <button
                  onClick$={handleComplete}
                  disabled={!getCanProceed() || state.isSubmitting}
                  class="btn-success"
                >
                  {state.isSubmitting && (
                    <Spinner size="sm" class="spinner-icon" />
                  )}
                  {state.isSubmitting
                    ? t("common.saving")
                    : t("wizard.complete")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
