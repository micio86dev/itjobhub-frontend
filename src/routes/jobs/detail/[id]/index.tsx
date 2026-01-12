import { component$, useResource$, Resource, useStore, useTask$, $ } from "@builder.io/qwik";
import { marked } from "marked";
import { useLocation, Link } from "@builder.io/qwik-city";
import { useJobs, type JobListing } from "~/contexts/jobs";
import { useTranslate, useI18n } from "~/contexts/i18n";
import { useAuth } from "~/contexts/auth";
import { CommentsSection } from "~/components/jobs/comments-section";

export default component$(() => {
    const loc = useLocation();
    const jobsContext = useJobs();
    const auth = useAuth();
    const t = useTranslate();
    const i18n = useI18n();

    const state = useStore({
        job: null as JobListing | null,
    });

    const jobResource = useResource$(async ({ track }) => {
        track(() => loc.params.id);
        track(() => auth.token); // Re-fetch when auth changes to get is_favorite status
        const job = await jobsContext.fetchJobById$(loc.params.id);
        state.job = job;
        return job;
    });

    // Track reactions from context (for optimistic updates triggered elsewhere or locally)
    useTask$(({ track }) => {
        const likeReq = track(() => jobsContext.likeJobSignal.value);
        if (likeReq && state.job && likeReq.jobId === state.job.id) {
            const job = state.job;
            if (likeReq.remove) {
                job.likes = Math.max(0, job.likes - 1);
                job.user_reaction = null;
                if (job.companyLikes !== undefined) job.companyLikes = Math.max(0, job.companyLikes - 1);
            } else {
                job.likes++;
                job.user_reaction = 'LIKE';
                if (job.companyLikes !== undefined) job.companyLikes++;
                if (likeReq.wasDisliked) {
                    job.dislikes = Math.max(0, job.dislikes - 1);
                    if (job.companyDislikes !== undefined) job.companyDislikes = Math.max(0, job.companyDislikes - 1);
                }
            }
            // Update company trust score
            if (job.companyLikes !== undefined && job.companyDislikes !== undefined) {
                job.companyScore = ((job.companyLikes + 8) / (job.companyLikes + job.companyDislikes + 10)) * 100;
            }
        }
    });

    useTask$(({ track }) => {
        const dislikeReq = track(() => jobsContext.dislikeJobSignal.value);
        if (dislikeReq && state.job && dislikeReq.jobId === state.job.id) {
            const job = state.job;
            if (dislikeReq.remove) {
                job.dislikes = Math.max(0, job.dislikes - 1);
                job.user_reaction = null;
                if (job.companyDislikes !== undefined) job.companyDislikes = Math.max(0, job.companyDislikes - 1);
            } else {
                job.dislikes++;
                job.user_reaction = 'DISLIKE';
                if (job.companyDislikes !== undefined) job.companyDislikes++;
                if (dislikeReq.wasLiked) {
                    job.likes = Math.max(0, job.likes - 1);
                    if (job.companyLikes !== undefined) job.companyLikes = Math.max(0, job.companyLikes - 1);
                }
            }
            // Update company trust score
            if (job.companyLikes !== undefined && job.companyDislikes !== undefined) {
                job.companyScore = ((job.companyLikes + 8) / (job.companyLikes + job.companyDislikes + 10)) * 100;
            }
        }
    });

    // Handle Local Actions
    const handleLike = $(() => {
        if (!auth.isAuthenticated || !state.job) return;
        const currentlyLiked = state.job.user_reaction === 'LIKE';
        const currentlyDisliked = state.job.user_reaction === 'DISLIKE';

        if (currentlyLiked) {
            jobsContext.likeJobSignal.value = { jobId: state.job.id, remove: true };
        } else {
            jobsContext.likeJobSignal.value = {
                jobId: state.job.id,
                wasDisliked: currentlyDisliked
            };
        }
    });

    const handleDislike = $(() => {
        if (!auth.isAuthenticated || !state.job) return;
        const currentlyLiked = state.job.user_reaction === 'LIKE';
        const currentlyDisliked = state.job.user_reaction === 'DISLIKE';

        if (currentlyDisliked) {
            jobsContext.dislikeJobSignal.value = { jobId: state.job.id, remove: true };
        } else {
            jobsContext.dislikeJobSignal.value = {
                jobId: state.job.id,
                wasLiked: currentlyLiked
            };
        }
    });

    const handleToggleFavorite = $(async () => {
        if (!auth.isAuthenticated || !state.job) return;
        await jobsContext.toggleFavorite$(state.job.id);
        // Toggle local state for immediate feedback
        if (state.job) {
            state.job.is_favorite = !state.job.is_favorite;
        }
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
                onResolved={() => {
                    const job = state.job;
                    if (!job) {
                        return (
                            <div class="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg border border-gray-100 dark:border-gray-700">
                                <div class="text-6xl mb-4">🔍</div>
                                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('job.not_found')}</h2>
                                <p class="text-gray-500 dark:text-gray-400 mb-8">{t('job.not_found_description')}</p>
                                <Link href="/jobs" class="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                                    {t('job.back_to_search')}
                                </Link>
                            </div>
                        );
                    }

                    const hasLiked = job.user_reaction === 'LIKE';
                    const hasDisliked = job.user_reaction === 'DISLIKE';

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
                                                    <svg class="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
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
                                            <div class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mr-2 border border-gray-200 dark:border-gray-600">
                                                <button
                                                    onClick$={handleLike}
                                                    disabled={!auth.isAuthenticated}
                                                    title="Like"
                                                    class={`p-2 rounded-lg transition-all flex items-center gap-1 ${hasLiked
                                                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 shadow-sm'
                                                        : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                                                        } ${!auth.isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <span class="text-xl">👍</span>
                                                    <span class="text-sm font-bold">{job.likes}</span>
                                                </button>
                                                <button
                                                    onClick$={handleDislike}
                                                    disabled={!auth.isAuthenticated}
                                                    title="Dislike"
                                                    class={`p-2 rounded-lg transition-all flex items-center gap-1 ${hasDisliked
                                                        ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 shadow-sm'
                                                        : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                                                        } ${!auth.isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <span class="text-xl">👎</span>
                                                    <span class="text-sm font-bold">{job.dislikes}</span>
                                                </button>
                                            </div>

                                            <button
                                                onClick$={handleToggleFavorite}
                                                disabled={!auth.isAuthenticated}
                                                class={`p-3 rounded-xl border transition-all ${job.is_favorite
                                                    ? 'bg-yellow-50 border-yellow-200 text-yellow-500 shadow-sm'
                                                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 hover:border-yellow-300 hover:text-yellow-400'
                                                    } ${!auth.isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" class={`h-6 w-6 ${job.is_favorite ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                            </button>

                                            <a
                                                href={job.externalLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            >
                                                {t('job.apply')}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Stats/Badges Row */}
                                    <div class="flex flex-wrap items-center gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                                        <div class="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {t('job.seniority')}: <span class="text-indigo-600 dark:text-indigo-400 capitalize">{t('jobs.' + (job.seniority || 'unknown'))}</span>
                                        </div>
                                        <div class="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {t('job.availability')}: <span class="text-indigo-600 dark:text-indigo-400">{t('jobs.' + (job.availability || 'full_time'))}</span>
                                        </div>
                                        {job.remote && (
                                            <div class="bg-blue-50 dark:bg-blue-900/40 px-4 py-2 rounded-full text-sm font-extrabold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-sm animate-pulse-subtle">
                                                🌐 {t('job.remote_badge')}
                                            </div>
                                        )}
                                        {job.salary && (
                                            <div class="bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-full text-sm font-semibold text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800">
                                                💰 {job.salary}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Map Section - if GPS available */}
                                {job.location_geo && job.location_geo.coordinates && (
                                    <div class="border-t border-gray-100 dark:border-gray-700 overflow-hidden">
                                        <div class="w-full h-48 bg-gray-200 dark:bg-gray-700 relative">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                style="border:0"
                                                src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.PUBLIC_GOOGLE_MAPS_KEY}&q=${job.location_geo.coordinates[1]},${job.location_geo.coordinates[0]}&zoom=14`}
                                                allowFullScreen
                                            ></iframe>
                                            <div class="absolute bottom-2 right-2 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded text-[10px] text-gray-500 font-medium">
                                                {job.location}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Description Section */}
                                <div class="p-8 md:p-10 border-t border-gray-100 dark:border-gray-700">
                                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                        <span class="w-1.5 h-6 bg-indigo-600 rounded-full mr-3"></span>
                                        {t('job.description_title')}
                                    </h3>
                                    <div
                                        class="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
                                        dangerouslySetInnerHTML={marked.parse(job.description || "") as string}
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
