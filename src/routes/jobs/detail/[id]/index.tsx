import { component$, useResource$, Resource } from "@builder.io/qwik";
import { useLocation, Link } from "@builder.io/qwik-city";
import { useJobs } from "~/contexts/jobs";
import { useTranslate, useI18n } from "~/contexts/i18n";
import { useAuth } from "~/contexts/auth";
import { CommentsSection } from "~/components/jobs/comments-section";

export default component$(() => {
    const loc = useLocation();
    const jobsContext = useJobs();
    const auth = useAuth();
    const t = useTranslate();
    const i18n = useI18n();

    const jobResource = useResource$(async ({ track }) => {
        track(() => loc.params.id);
        return await jobsContext.fetchJobById$(loc.params.id);
    });

    return (
        <div class="max-w-4xl mx-auto px-4 py-8">
            <Link
                href="/jobs"
                class="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-6 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
                {t('job.back_to_search')}
            </Link>

            <Resource
                value={jobResource}
                onPending={() => (
                    <div class="flex justify-center items-center py-20">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                )}
                onResolved={(job) => {
                    if (!job) {
                        return (
                            <div class="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg border border-gray-100 dark:border-gray-700">
                                <div class="text-6xl mb-4">🔍</div>
                                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('job.not_found')}</h2>
                                <p class="text-gray-500 dark:text-gray-400 mb-8">The job you are looking for doesn't exist or has been removed.</p>
                                <Link href="/jobs" class="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                                    {t('job.back_to_search')}
                                </Link>
                            </div>
                        );
                    }

                    return (
                        <div class="space-y-6">
                            {/* Main Content Card */}
                            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                                {/* Hero Header */}
                                <div class="p-8 md:p-10 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50">
                                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div class="flex items-center gap-6">
                                            <div class="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white dark:bg-gray-700 shadow-md flex items-center justify-center p-2 border border-gray-100 dark:border-gray-600">
                                                {job.companyLogo ? (
                                                    <img src={job.companyLogo} alt={job.company} class="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <span class="text-2xl font-bold text-indigo-600">{(job.company || 'C').charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-1">
                                                    {job.title}
                                                </h1>
                                                <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 dark:text-gray-400">
                                                    <span class="font-semibold text-indigo-600 dark:text-indigo-400">{job.company}</span>
                                                    <span class="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {job.location || t('job.location_not_specified')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="flex flex-wrap items-center gap-3">
                                            <button
                                                onClick$={async () => {
                                                    if (!auth.isAuthenticated) return;
                                                    await jobsContext.toggleFavorite$(job.id);
                                                }}
                                                class={`p-3 rounded-xl border transition-all ${job.is_favorite
                                                    ? 'bg-red-50 border-red-200 text-red-500'
                                                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 hover:border-red-300 hover:text-red-400'
                                                    }`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" class={`h-6 w-6 ${job.is_favorite ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            </button>

                                            <a
                                                href={job.apply_link}
                                                target="_blank"
                                                class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            >
                                                {t('job.apply')}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Stats/Badges Row */}
                                    <div class="flex flex-wrap items-center gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                                        <div class="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {t('job.seniority')}: <span class="text-indigo-600 dark:text-indigo-400">{t('jobs.' + (job.seniority || 'unknown'))}</span>
                                        </div>
                                        <div class="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {t('job.availability')}: <span class="text-indigo-600 dark:text-indigo-400">{t('jobs.' + (job.availability || 'full_time'))}</span>
                                        </div>
                                        {job.remote && (
                                            <div class="bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-full text-sm font-semibold text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800">
                                                {t('job.remote_badge')}
                                            </div>
                                        )}
                                        {job.salary_min > 0 && (
                                            <div class="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full text-sm font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                                                💰 {job.salary_currency || '€'}{job.salary_min}k {job.salary_max > job.salary_min ? `- ${job.salary_max}k` : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description Section */}
                                <div class="p-8 md:p-10 border-t border-gray-100 dark:border-gray-700">
                                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                        <span class="w-1.5 h-6 bg-indigo-600 rounded-full mr-3"></span>
                                        {t('job.description_title')}
                                    </h3>
                                    <div
                                        class="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
                                        dangerouslySetInnerHTML={job.description}
                                    />
                                </div>

                                {/* Skills Section */}
                                {job.skills && job.skills.length > 0 && (
                                    <div class="p-8 md:p-10 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/10">
                                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                            {t('job.skills_title')}
                                        </h3>
                                        <div class="flex flex-wrap gap-2">
                                            {job.skills.map((skill) => (
                                                <span key={skill} class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 shadow-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Company Info Box */}
                            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
                                <div class="flex items-center justify-between mb-6">
                                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">{t('job.about_company')}</h3>
                                    <div class="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-lg border border-yellow-100 dark:border-yellow-800">
                                        <span class="text-yellow-600 dark:text-yellow-500 font-bold mr-1">★</span>
                                        <span class="text-sm font-bold text-gray-700 dark:text-gray-300">{t('job.trust_score')}: {Math.round(job.companyScore || 80)}%</span>
                                    </div>
                                </div>
                                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {job.company} is an established organization in the industry. For more details about their products and culture, visit their official website or social profiles.
                                </p>
                            </div>

                            {/* Comments Section */}
                            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
                                <CommentsSection jobId={job.id} />
                            </div>
                        </div>
                    );
                }}
                onError={(err) => (
                    <div class="p-10 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
                        Error loading job details: {err.message}
                    </div>
                )}
            />
        </div>
    );
});
