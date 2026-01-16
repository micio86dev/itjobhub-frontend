import { component$, $, useTask$, isBrowser } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";
import { ProfileWizard } from "~/components/wizard/profile-wizard";
import type { WizardData } from "~/contexts/auth";

export default component$(() => {
  const auth = useAuth();
  const nav = useNavigate();

  // Use useTask$ for redirection
  useTask$(({ track }) => {
    track(() => auth.isAuthenticated);
    track(() => auth.user?.profileCompleted);

    if (isBrowser) {
      if (!auth.isAuthenticated) {
        void nav("/login");
      } else if (auth.user?.profileCompleted) {
        void nav("/");
      }
    }
  });

  const handleWizardComplete = $((data: WizardData) => {
    auth.updateProfileSignal.value = data;
    nav("/");
  });

  const handleCancel = $(() => {
    nav("/");
  });

  if (!auth.isAuthenticated || auth.user?.profileCompleted) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-gray-50 py-12">
      <ProfileWizard
        onComplete$={handleWizardComplete}
        onCancel$={handleCancel}
      />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Completa il tuo profilo - ITJobHub",
  meta: [
    {
      name: "description",
      content: "Completa il tuo profilo professionale su ITJobHub",
    },
  ],
};
