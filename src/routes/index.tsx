import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useAuth } from "~/contexts/auth";

export default component$(() => {
  const auth = useAuth();

  return (
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Benvenuto in ITJobHub
          </h1>
          <p class="text-xl text-gray-600 mb-8">
            La piattaforma per trovare il lavoro dei tuoi sogni nel mondo IT
          </p>
          
          {auth.isAuthenticated ? (
            <div class="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">
                Ciao, {auth.user?.name || auth.user?.email}! 👋
              </h2>
              <p class="text-gray-600 mb-6">
                Hai effettuato l'accesso con successo. Inizia a esplorare le opportunità di lavoro!
              </p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-blue-50 p-4 rounded-lg">
                  <h3 class="font-semibold text-blue-900 mb-2">Cerca Lavoro</h3>
                  <p class="text-blue-700 text-sm">Trova le migliori opportunità IT</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                  <h3 class="font-semibold text-green-900 mb-2">Profilo</h3>
                  <p class="text-green-700 text-sm">Completa il tuo profilo professionale</p>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                  <h3 class="font-semibold text-purple-900 mb-2">Network</h3>
                  <p class="text-purple-700 text-sm">Connettiti con altri professionisti</p>
                </div>
              </div>
            </div>
          ) : (
            <div class="bg-white shadow rounded-lg p-8 max-w-2xl mx-auto">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">
                Inizia subito la tua ricerca
              </h2>
              <p class="text-gray-600 mb-6">
                Accedi o registrati per scoprire migliaia di opportunità di lavoro nel settore IT
              </p>
              <div class="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <a
                  href="/register"
                  class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Registrati Gratis
                </a>
                <a
                  href="/login"
                  class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Accedi
                </a>
              </div>
            </div>
          )}
          
          <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-indigo-500 text-white">
                💼
              </div>
              <h3 class="mt-6 text-lg font-medium text-gray-900">Opportunità Esclusive</h3>
              <p class="mt-2 text-base text-gray-500">
                Accedi alle migliori offerte di lavoro nel settore tecnologico
              </p>
            </div>
            
            <div class="text-center">
              <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-indigo-500 text-white">
                🚀
              </div>
              <h3 class="mt-6 text-lg font-medium text-gray-900">Crescita Professionale</h3>
              <p class="mt-2 text-base text-gray-500">
                Sviluppa la tua carriera con le aziende più innovative
              </p>
            </div>
            
            <div class="text-center">
              <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-indigo-500 text-white">
                🌐
              </div>
              <h3 class="mt-6 text-lg font-medium text-gray-900">Remote & Flexible</h3>
              <p class="mt-2 text-base text-gray-500">
                Trova lavori remote e con orari flessibili
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "ITJobHub - Trova il tuo lavoro ideale nel mondo IT",
  meta: [
    {
      name: "description",
      content: "La piattaforma per trovare il lavoro dei tuoi sogni nel mondo IT. Opportunità esclusive, crescita professionale e lavori remote.",
    },
  ],
};
