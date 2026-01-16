import {
  component$,
  useStore,
  $,
  useTask$,
  useSignal,
  isBrowser,
} from "@builder.io/qwik";
import { useNavigate, type DocumentHead, useLocation } from "@builder.io/qwik-city";
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
  const nav = useNavigate();
  const auth = useAuth();
  const i18n = useI18n();
  const lang = i18n.currentLanguage;
  const t = useTranslate();

  const fileInputRef = useSignal<HTMLInputElement | undefined>();

  const state = useStore({
    isEditing: false,
    editingSection: "" as "profile" | "personal" | "",
    shouldRedirect: false,
    isSavingPersonal: false,
    message: { type: "success" as "success" | "error", text: "" },
    formData: {
      name: auth.user?.name || "",
      email: auth.user?.email || "",
      phone: auth.user?.phone || "",
      location: auth.user?.location || "",
      birthDate: auth.user?.birthDate || "",
      bio: auth.user?.bio || "",
    } as EditFormData,
  });

  const loc = useLocation();

  // Check authentication and set redirect flag
  useTask$(({ track }) => {
    track(() => auth.isAuthenticated);
    if (isBrowser && !auth.isAuthenticated) {
      nav(`/login?returnUrl=${loc.url.pathname}`);
    }
  });

  // Handle redirect on client side only
  useTask$(({ track }) => {
    const shouldRedirect = track(() => state.shouldRedirect);
    if (shouldRedirect && isBrowser && !auth.isAuthenticated) {
      nav("/login");
    }
  });

  // Update form data when user changes
  useTask$(({ track }) => {
    const currentUser = track(() => auth.user);
    if (currentUser) {
      state.formData = {
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        location: currentUser.location || "",
        birthDate: currentUser.birthDate || "",
        bio: currentUser.bio || "",
      };
    }
  });

  // Watch for profile update results
  useTask$(({ track }) => {
    const result = track(() => auth.profileUpdateResult.value);
    if (result) {
      state.isSavingPersonal = false;
      state.isEditing = false;
      state.editingSection = "";

      if (result.success) {
        state.message = {
          type: "success",
          text: translate("profile.update_success", i18n.currentLanguage),
        };
      } else {
        state.message = {
          type: "error",
          text:
            result.error ||
            translate("profile.update_error", i18n.currentLanguage),
        };
      }
      auth.profileUpdateResult.value = null;
      // Clear message after 5 seconds
      setTimeout(() => {
        state.message.text = "";
      }, 5000);
    }
  });

  // Watch for avatar update results
  useTask$(({ track }) => {
    const result = track(() => auth.avatarUpdateResult.value);
    if (result) {
      if (result.success) {
        state.message = {
          type: "success",
          text: translate("profile.avatar_success", i18n.currentLanguage),
        };
      } else {
        state.message = {
          type: "error",
          text: result.error
            ? translate(result.error, i18n.currentLanguage)
            : translate("profile.avatar_error", i18n.currentLanguage),
        };
      }
      auth.avatarUpdateResult.value = null;
      setTimeout(() => {
        state.message.text = "";
      }, 5000);
    }
  });

  // Return early if not authenticated to prevent rendering
  if (!auth.isAuthenticated) {
    return null;
  }

  const handleEditProfile = $(() => {
    state.isEditing = true;
    state.editingSection = "profile";
  });

  const handleEditPersonal = $(() => {
    state.isEditing = true;
    state.editingSection = "personal";
  });

  const handleWizardComplete = $((data: WizardData) => {
    // Trigger profile update through signal
    auth.updateProfileSignal.value = data;
    state.isEditing = false;
    state.editingSection = "";
  });

  const handleCancelEdit = $(() => {
    state.isEditing = false;
    state.editingSection = "";
    // Reset form data
    state.formData = {
      name: auth.user?.name || "",
      email: auth.user?.email || "",
      phone: auth.user?.phone || "",
      location: auth.user?.location || "",
      birthDate: auth.user?.birthDate || "",
      bio: auth.user?.bio || "",
    };
  });

  const handleSavePersonal = $(() => {
    state.isSavingPersonal = true;
    state.message.text = "";
    // Trigger personal info update through signal
    auth.updatePersonalInfoSignal.value = { ...state.formData };
  });

  const handleAvatarClick = $(() => {
    fileInputRef.value?.click();
  });

  const handleAvatarChange = $((event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file && file.type.startsWith("image/")) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        state.message = {
          type: "error",
          text: translate("profile.avatar_too_big", i18n.currentLanguage),
        };
        // Reset input
        if (fileInputRef.value) fileInputRef.value.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          // Trigger avatar update through signal
          auth.updateAvatarSignal.value = { avatar: result };
        }
      };
      reader.onerror = (e) => {
        console.error("FileReader error:", e);
        state.message = {
          type: "error",
          text: translate("profile.avatar_error", i18n.currentLanguage),
        };
      };
      reader.readAsDataURL(file);
    }

    // Reset input value to allow selecting the same file again
    if (fileInputRef.value) fileInputRef.value.value = "";
  });

  // Show wizard if editing profile data
  if (state.isEditing && state.editingSection === "profile") {
    const initialData: Partial<WizardData> = {
      languages: auth.user?.languages || [],
      skills: auth.user?.skills || [],
      seniority:
        (auth.user?.seniority as "junior" | "mid" | "senior" | "") || "",
      availability:
        (auth.user?.availability as "full-time" | "part-time" | "busy" | "") ||
        "",
      workModes: auth.user?.workModes || [],
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
      case "full-time":
        return translate("jobs.full_time", lang);
      case "part-time":
        return translate("jobs.part_time", lang);
      case "busy":
        return translate("profile.occupied", lang);
      default:
        return availability;
    }
  });

  const formatSeniority = $((seniority: string) => {
    switch (seniority) {
      case "junior":
        return translate("jobs.junior", lang);
      case "mid":
        return translate("jobs.mid", lang);
      case "senior":
        return translate("jobs.senior", lang);
      default:
        return seniority;
    }
  });

  return (
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
        {/* Feedback Message */}
        {state.message.text && (
          <div
            class={`p-4 rounded-t-lg text-center text-sm font-medium ${state.message.type === "success"
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
              }`}
          >
            {state.message.text}
          </div>
        )}
        {/* Header */}
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="relative">
                <div class="w-20 h-20 bg-indigo-500 dark:bg-indigo-600 rounded-full flex items-center justify-center overflow-hidden">
                  {auth.user?.avatar ? (
                    <img
                      src={auth.user.avatar}
                      alt="Avatar"
                      class="w-full h-full object-cover"
                      width="80"
                      height="80"
                    />
                  ) : (
                    <span class="text-2xl font-bold text-white">
                      {auth.user?.name?.charAt(0).toUpperCase() ||
                        auth.user?.email?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  class="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800"
                  onClick$={handleAvatarClick}
                  title={t("profile.change_avatar")}
                >
                  <svg
                    class="w-3 h-3 text-gray-600 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
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
                  {auth.user?.name || t("profile.title")}
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {auth.user?.email}
                </p>
                {auth.user?.location && (
                  <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                    <svg
                      class="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {auth.user.location}
                  </p>
                )}
                {auth.user?.profileCompleted && (
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 mt-1">
                    {t("profile.completed")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile content */}
        <div class="px-4 py-5 sm:p-6">
          {!auth.user?.profileCompleted ? (
            <div class="text-center py-12">
              <div class="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t("profile.complete_profile")}
              </h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4">
                {t("profile.complete_desc")}
              </p>
              <div class="flex justify-center">
                <button
                  onClick$={handleEditProfile}
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                >
                  {t("profile.complete_profile")}
                </button>
              </div>
            </div>
          ) : (
            <div class="space-y-8">
              {/* Personal Information */}
              <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                    {t("profile.personal_info")}
                  </h3>
                  <button
                    onClick$={handleEditPersonal}
                    class="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  >
                    <svg
                      class="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    {t("profile.edit_profile")}
                  </button>
                </div>

                {state.isEditing && state.editingSection === "personal" ? (
                  <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t("profile.name_label")}
                        </label>
                        <input
                          type="text"
                          value={state.formData.name}
                          onInput$={(e) =>
                          (state.formData.name = (
                            e.target as HTMLInputElement
                          ).value)
                          }
                          data-testid="profile-name"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t("profile.phone_label")}
                        </label>
                        <input
                          type="tel"
                          value={state.formData.phone}
                          onInput$={(e) =>
                          (state.formData.phone = (
                            e.target as HTMLInputElement
                          ).value)
                          }
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                        />
                      </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t("profile.location_label")}
                        </label>
                        <LocationAutocomplete
                          value={state.formData.location}
                          onInput$={(val) => (state.formData.location = val)}
                          onLocationSelect$={(location, coordinates) => {
                            state.formData.location = location;
                            // Store coordinates in formData (need to add coordinates to EditFormData interface first)
                            // Assuming I will add it in a subsequent step or previous step was missed?
                            // I need to update EditFormData interface in this file too!
                            // For now I'll cast to any or add it.
                            state.formData.coordinates = coordinates;
                          }}
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t("profile.birth_date_label")}
                        </label>
                        <input
                          type="date"
                          value={state.formData.birthDate}
                          onInput$={(e) =>
                          (state.formData.birthDate = (
                            e.target as HTMLInputElement
                          ).value)
                          }
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("profile.bio_label")}
                      </label>
                      <textarea
                        value={state.formData.bio}
                        onInput$={(e) =>
                        (state.formData.bio = (
                          e.target as HTMLTextAreaElement
                        ).value)
                        }
                        rows={4}
                        data-testid="profile-bio"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                        placeholder={t("profile.complete_desc")}
                      />
                    </div>
                    <div class="flex space-x-3">
                      <button
                        onClick$={handleSavePersonal}
                        disabled={state.isSavingPersonal}
                        data-testid="profile-save"
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {state.isSavingPersonal && (
                          <svg
                            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              class="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              stroke-width="4"
                            ></circle>
                            <path
                              class="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        )}
                        {state.isSavingPersonal
                          ? t("common.saving")
                          : t("profile.save_changes")}
                      </button>
                      <button
                        onClick$={handleCancelEdit}
                        class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      >
                        {t("profile.cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("profile.name_label")}
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                        {auth.user?.name || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("profile.email_label")}
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                        {auth.user?.email || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("profile.phone_label")}
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                        {auth.user?.phone || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("profile.location_label")}
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                        {auth.user?.location || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("profile.birth_date_label")}
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                        {auth.user?.birthDate || "-"}
                      </dd>
                    </div>
                    {auth.user?.bio && (
                      <div class="md:col-span-2">
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t("profile.bio_label")}
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                          {auth.user.bio}
                        </dd>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Professional Information */}
              <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                    {t("profile.professional_info")}
                  </h3>
                  <button
                    onClick$={handleEditProfile}
                    class="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  >
                    <svg
                      class="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    {t("profile.edit_profile")}
                  </button>
                </div>

                <div class="space-y-6">
                  {/* Languages */}
                  <div>
                    <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      {t("profile.languages_title")}
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      {auth.user?.languages?.map((lang) => {
                        // Try to translate the language name
                        // If the language is stored as "Italian", we need to find the matching key
                        const langKey = `lang.${lang.toLowerCase()}`;
                        const translatedLang = t(langKey);
                        // If translation returns the key itself, use the original value
                        const displayLang = translatedLang === langKey ? lang : translatedLang;

                        return (
                          <span
                            key={lang}
                            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                          >
                            {displayLang}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      {t("profile.skills_title")}
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      {auth.user?.skills?.map((skill) => (
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
                        {t("profile.seniority_title")}
                      </h4>
                      <div class="flex items-center">
                        <div class="w-3 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full mr-3"></div>
                        <span class="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {formatSeniority(auth.user?.seniority || "")}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                        {t("profile.availability_title")}
                      </h4>
                      <div class="flex items-center">
                        <div class="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full mr-3"></div>
                        <span class="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {formatAvailability(auth.user?.availability || "")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Work Modes */}
                  <div>
                    <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      {t("profile.work_modes_title")}
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      {auth.user?.workModes?.map((mode) => (
                        <span
                          key={mode}
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300"
                        >
                          {t(`wizard.${mode}_label`)}
                        </span>
                      ))}
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
  const t = (key: string) => translate(key, "it");
  return {
    title: t("meta.profile_title"),
    meta: [
      {
        name: "description",
        content: t("meta.profile_description"),
      },
    ],
  };
};
