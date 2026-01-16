import { component$ } from "@builder.io/qwik";
import { useTranslate } from "~/contexts/i18n";

interface CTASectionProps {
    isAuthenticated: boolean;
}

export const CTASection = component$<CTASectionProps>(({ isAuthenticated }) => {
    const t = useTranslate();

    return (
        <section class="relative bg-indigo-900 py-16 sm:py-24">
            <div class="absolute inset-0 overflow-hidden">
                <div class="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
                <div class="absolute right-0 top-0 -mt-20 -mr-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div class="absolute left-0 bottom-0 -mb-20 -ml-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            </div>
            <div class="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                <h2 class="text-3xl font-extrabold text-white sm:text-4xl mb-6">
                    {t('home.cta_title')}
                </h2>
                <p class="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
                    {t('home.cta_desc')}
                </p>
                {!isAuthenticated && (
                    <div class="flex justify-center space-x-4">
                        <a href="/register" class="bg-white text-indigo-900 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            {t('home.register_free')}
                        </a>
                        <a href="/login" class="bg-transparent border-2 border-indigo-400 text-indigo-100 px-8 py-4 rounded-lg font-bold hover:bg-indigo-800/50 transition-colors">
                            {t('home.login')}
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
});
