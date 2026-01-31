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
      <div class="flex justify-center items-center bg-gray-50 min-h-screen">
        <div class="border-brand-neon border-b-2 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  return (
    <div class="bg-gray-50 py-12 min-h-screen">
      <ProfileWizard
        onComplete$={handleWizardComplete}
        onCancel$={handleCancel}
      />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Completa il tuo profilo - DevBoards.io",
  meta: [
    {
      name: "description",
      content: "Completa il tuo profilo professionale su DevBoards.io",
    },
  ],
};
