import { component$, type Signal } from "@builder.io/qwik";
import { useTranslate } from "~/contexts/i18n";

interface HeroSectionProps {
    topSkills: Signal<{ skill: string; count: number }[]>;
}

export const HeroSection = component$<HeroSectionProps>(({ topSkills }) => {
    const t = useTranslate();

    return (
        <section class="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-white py-24 sm:py-32">
            <div class="absolute inset-0 overflow-hidden">
                <div class="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            </div>
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
                    <span class="block">{t('home.title')}</span>
                    <span class="block text-indigo-200 mt-2 text-2xl sm:text-4xl">{t('home.subtitle')}</span>
                </h1>
                <p class="mt-4 max-w-2xl mx-auto text-xl text-indigo-100 mb-10">
                    {t('home.opportunities_desc')}
                </p>

                {/* Search Box */}
                <div class="max-w-3xl mx-auto">
                    <form action="/jobs" method="get" class="relative group">
                        <div class="absolute inset-0 bg-pink-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div class="relative bg-white rounded-lg p-2 shadow-xl flex items-center">
                            <span class="pl-4 text-gray-400">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                name="q"
                                placeholder={t('home.start_search')}
                                class="flex-1 p-4 text-gray-900 placeholder-gray-500 focus:outline-none rounded-lg"
                            />
                            <button
                                type="submit"
                                class="bg-indigo-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-indigo-700 transition-colors duration-200 hidden sm:block"
                            >
                                {t('home.search_button')}
                            </button>
                        </div>
                    </form>
                    <div class="mt-4 text-sm text-indigo-200 flex flex-wrap gap-2 items-center justify-center sm:justify-start">
                        <span class="font-medium opacity-80 mr-1">{t('home.popular')}</span>
                        {topSkills.value.length > 0 ? (
                            topSkills.value.slice(0, 6).map(s => (
                                <a
                                    key={s.skill}
                                    href={`/jobs?q=${encodeURIComponent(s.skill)}`}
                                    class="hover:text-white underline decoration-dashed underline-offset-4 mr-2 transition-colors"
                                >
                                    {s.skill}
                                </a>
                            ))
                        ) : (
                            <>
                                <a href="/jobs?q=Frontend" class="hover:text-white underline decoration-dashed underline-offset-4 mr-2 transition-colors">Frontend</a>
                                <a href="/jobs?q=Backend" class="hover:text-white underline decoration-dashed underline-offset-4 mr-2 transition-colors">Backend</a>
                                <a href="/jobs?q=Fullstack" class="hover:text-white underline decoration-dashed underline-offset-4 mr-2 transition-colors">Fullstack</a>
                            </>
                        )}
                        <a href="/jobs?remote=true" class="hover:text-white underline decoration-dashed underline-offset-4 transition-colors">{t('jobs.remote')}</a>
                    </div>
                </div>
            </div>
        </section>
    );
});
