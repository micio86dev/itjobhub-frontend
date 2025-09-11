import { component$, $ } from "@builder.io/qwik";
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

  // Redirect if not authenticated
  if (!isAuthenticated) {
    nav('/login');
    return null;
  }

  // Redirect if profile already completed
  if (user?.profileCompleted) {
    nav('/');
    return null;
  }

  const handleWizardComplete = $((data: WizardData) => {
    // Trigger profile update through signal
    auth.updateProfileSignal.value = data;
    nav('/');
  });

  const handleCancel = $(() => {
    nav('/');
  });

  return (
    <ProfileWizard 
      onComplete$={handleWizardComplete}
      onCancel$={handleCancel}
    />
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