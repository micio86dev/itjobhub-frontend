import { component$, useStore, useTask$, isBrowser, useResource$, Resource, $, useStylesScoped$ } from "@builder.io/qwik";

import { useLocation, Link, useNavigate } from "@builder.io/qwik-city";
import { request } from "~/utils/api";
import { Modal } from "~/components/ui/modal";
import { useJobs, type JobListing } from "~/contexts/jobs";
import type { MatchScore } from "~/types/models";
import { useTranslate, interpolate } from "~/contexts/i18n";
import { useAuth } from "~/contexts/auth";
import { CommentsSection } from "~/components/jobs/comments-section";
import { MatchBreakdown } from "~/components/jobs/match-breakdown";
import { JobPostingSchema } from "~/components/seo/json-ld";
import styles from "./index.css?inline";

export default component$(() => {
    useStylesScoped$(styles);
    const loc = useLocation();
    const jobsContext = useJobs();
    const auth = useAuth();
    const t = useTranslate();
    const nav = useNavigate();
    const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';

    const state = useStore({
        job: null as JobListing | null,
        matchScore: null as MatchScore | null,
        showDeleteModal: false
    });

    const jobResource = useResource$(async ({ track }) => {
        track(() => loc.params.id);
        track(() => auth.token); // Re-fetch when auth changes to get is_favorite status
        const job = await jobsContext.fetchJobById$(loc.params.id);
        state.job = job;

        // Fetch match score if authenticated
        if (auth.token && job) {
            const scoreData = await jobsContext.fetchJobMatchScore$(job.id);
            state.matchScore = scoreData;
        }

        return job;
    });

    // Handle Local Actions
    const handleLike = $(() => {
        if (!auth.isAuthenticated || !state.job) return;
        const job = state.job;
        const currentReaction = job.user_reaction;

        if (currentReaction === 'LIKE') {
            // Case 1: Currently Liked -> Remove Like
            job.likes = Math.max(0, (job.likes || 0) - 1);
            job.user_reaction = null;
            if (job.companyLikes !== undefined) job.companyLikes = Math.max(0, job.companyLikes - 1);

            jobsContext.likeJobSignal.value = { jobId: job.id, remove: true };
        } else {
            // Case 2 & 3: Not Liked (Null or Dislike) -> Add Like
            job.likes = (job.likes || 0) + 1;
            job.user_reaction = 'LIKE';
            if (job.companyLikes !== undefined) job.companyLikes = (job.companyLikes || 0) + 1;

            if (currentReaction === 'DISLIKE') {
                // Case 3: Switching from Dislike -> Remove Dislike
                job.dislikes = Math.max(0, (job.dislikes || 0) - 1);
                if (job.companyDislikes !== undefined) job.companyDislikes = Math.max(0, job.companyDislikes - 1);
            }

            jobsContext.likeJobSignal.value = {
                jobId: job.id,
                wasDisliked: currentReaction === 'DISLIKE'
            };
        }

        // Update company trust score
        if (job.companyLikes !== undefined && job.companyDislikes !== undefined) {
            job.companyScore = ((job.companyLikes + 8) / (job.companyLikes + job.companyDislikes + 10)) * 100;
        }

        // Force reactivity update
        state.job = { ...job };
    });

    const handleDislike = $(() => {
        if (!auth.isAuthenticated || !state.job) return;
        const job = state.job;
        const currentReaction = job.user_reaction;

        if (currentReaction === 'DISLIKE') {
            // Case 1: Currently Disliked -> Remove Dislike
            job.dislikes = Math.max(0, (job.dislikes || 0) - 1);
            job.user_reaction = null;
            if (job.companyDislikes !== undefined) job.companyDislikes = Math.max(0, job.companyDislikes - 1);

            jobsContext.dislikeJobSignal.value = { jobId: job.id, remove: true };
        } else {
            // Case 2 & 3: Not Disliked (Null or Like) -> Add Dislike
            job.dislikes = (job.dislikes || 0) + 1;
            job.user_reaction = 'DISLIKE';
            if (job.companyDislikes !== undefined) job.companyDislikes = (job.companyDislikes || 0) + 1;

            if (currentReaction === 'LIKE') {
                // Case 3: Switching from Like -> Remove Like
                job.likes = Math.max(0, (job.likes || 0) - 1);
                if (job.companyLikes !== undefined) job.companyLikes = Math.max(0, job.companyLikes - 1);
            }

            jobsContext.dislikeJobSignal.value = {
                jobId: job.id,
                wasLiked: currentReaction === 'LIKE'
            };
        }

        // Update company trust score
        if (job.companyLikes !== undefined && job.companyDislikes !== undefined) {
            job.companyScore = ((job.companyLikes + 8) / (job.companyLikes + job.companyDislikes + 10)) * 100;
        }

        // Force reactivity update (added for consistency with handleLike)
        state.job = { ...job };
    });

    const handleToggleFavorite = $(async () => {
        if (!auth.isAuthenticated || !state.job) return;
        await jobsContext.toggleFavorite$(state.job.id);

        // Toggle local state for immediate feedback
        if (state.job) {
            state.job.is_favorite = !state.job.is_favorite;
        }
    });

    const handleDeleteJob = $(async () => {
        if (!state.job || !auth.token) return;
        try {
            const res = await request(`${API_URL}/jobs/${state.job.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${auth.token}` }
            });

            if (res.ok) {
                await nav('/jobs');
            } else {
                console.error("Failed to delete job");
                // Optional: Show error
            }
        } catch (e) {
            console.error(e);
        } finally {
            state.showDeleteModal = false;
        }
    });

    // Track VIEW Interaction at top level of component
    useTask$(({ track }) => {
        const j = track(() => state.job);
        if (j && isBrowser) {
            jobsContext.trackJobInteraction$(j.id, 'VIEW');
        }
    });

    return (
        <div class="container">
            <Link
                href="/jobs"
                class="backLink"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="backIcon" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
                {t('job.back_to_search')}
            </Link>

            <Resource
                value={jobResource}
                onPending={() => (
                    <div class="loadingSpinner">
                        <div class="spinner"></div>
                    </div>
                )}
                onResolved={() => {
                    const job = state.job;
                    if (!job) {
                        return (
                            <div class="notFoundCard">
                                <div class="notFoundIcon">🔍</div>
                                <h2 class="notFoundTitle">{t('job.not_found')}</h2>
                                <p class="notFoundDesc">{t('job.not_found_description')}</p>
                                <Link href="/jobs" class="notFoundButton">
                                    {t('job.back_to_search')}
                                </Link>
                            </div>
                        );
                    }
                    return (
                        <div class="mainContent">
                            {/* JobPosting JSON-LD for SEO */}
                            <JobPostingSchema
                                title={job.title}
                                description={job.description?.replace(/<[^>]*>/g, '').substring(0, 500) || job.title}
                                datePosted={job.publishDate instanceof Date ? job.publishDate.toISOString() : new Date().toISOString()}
                                employmentType={job.availability || 'full_time'}
                                hiringOrganization={{
                                    name: job.company,
                                    logo: job.companyLogo,
                                }}
                                jobLocation={job.location ? {
                                    addressLocality: job.location,
                                    addressCountry: 'IT'
                                } : undefined}
                                isRemote={job.remote}
                                skills={job.skills}
                            />
                            {/* Main Content Card */}
                            <div class="jobCard">
                                {/* Hero Header */}
                                <div class="heroHeader">
                                    <div class="headerContent">
                                        <div class="flex items-center gap-6">
                                            <div class="companyLogoContainer">
                                                {job.companyLogo ? (
                                                    <img src={job.companyLogo} alt={job.company} width="80" height="80" class="companyLogo" />
                                                ) : (
                                                    <svg class="companyLogoPlaceholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <h1 class="jobTitle">
                                                    {job.title}
                                                </h1>
                                                <div class="jobMeta">
                                                    <span class="companyName">{job.company}</span>
                                                    <span class="location">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="locationIcon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {job.location || t('job.location_not_specified')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="actionsContainer">
                                            <div class="reactionButtons">
                                                <button
                                                    onClick$={handleLike}
                                                    disabled={!auth.isAuthenticated}
                                                    title={t('job.like')}
                                                    data-testid="like-button"
                                                    class={`likeButton ${job.user_reaction === 'LIKE' ? 'likeButtonActive' : ''} ${!auth.isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''} `}
                                                >
                                                    <span class="reactionIcon">👍</span>
                                                    <span class="reactionCount" data-testid="like-count">{state.job?.likes || 0}</span>
                                                </button>
                                                <button
                                                    onClick$={handleDislike}
                                                    disabled={!auth.isAuthenticated}
                                                    title={t('job.dislike')}
                                                    data-testid="dislike-button"
                                                    class={`dislikeButton ${job.user_reaction === 'DISLIKE' ? 'dislikeButtonActive' : ''} ${!auth.isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''} `}
                                                >
                                                    <span class="reactionIcon">👎</span>
                                                    <span class="reactionCount" data-testid="dislike-count">{state.job?.dislikes || 0}</span>
                                                </button>
                                            </div>

                                            <button
                                                onClick$={handleToggleFavorite}
                                                disabled={!auth.isAuthenticated}
                                                data-testid="favorite-button"
                                                class={`favoriteButton ${job.is_favorite ? 'favoriteButtonActive' : ''} ${!auth.isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''} `}
                                                title={job.is_favorite ? t('job.remove_favorite') : t('job.add_favorite')}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" class={`favoriteIcon ${job.is_favorite ? 'fill-current' : ''} `} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                            </button>

                                            {auth.isAuthenticated ? (
                                                <>
                                                    <a
                                                        href={job.externalLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick$={() => jobsContext.trackJobInteraction$(job.id, 'APPLY')}
                                                        class="applyButton"
                                                        data-testid="apply-button"
                                                    >
                                                        {t('job.apply')}
                                                    </a>
                                                    {auth.user?.role === 'admin' && (
                                                        <button
                                                            onClick$={() => state.showDeleteModal = true}
                                                            class="deleteButton"
                                                            data-testid="delete-button"
                                                        >
                                                            {t('job.delete')}
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <div class="applyLoginContainer" data-testid="apply-login-container">
                                                    <span class="applyDisabled">
                                                        {t('job.apply')}
                                                    </span>
                                                    <span class="loginHint">
                                                        <Link href="/login" class="link">{t('common.login')}</Link>{' '}
                                                        {t('common.or').toLowerCase()}{' '}
                                                        <Link href="/register" class="link">{t('common.register').toLowerCase()}</Link>{' '}
                                                        {t('job.apply_login_required')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats/Badges Row */}
                                    <div class="badgesRow">
                                        <div class="badge">
                                            {t('job.seniority')}: <span class="capitalize seniorityValue">{t('jobs.' + (job.seniority || 'unknown'))}</span>
                                        </div>
                                        <div class="badge">
                                            {t('job.availability')}: <span class="availabilityValue">{t('jobs.' + (job.availability || 'full_time'))}</span>
                                        </div>
                                        {job.remote && (
                                            <div class="remoteBadge">
                                                🌐 {t('job.remote_badge')}
                                            </div>
                                        )}
                                        {job.salary && (
                                            <div class="salaryBadge">
                                                💰 {job.salary}
                                            </div>
                                        )}
                                    </div>

                                    {/* Tracking Stats */}
                                    <div class="trackingStats">
                                        <span class="statItem" title={t('job.views_count')}>
                                            <svg class="statIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            {job.views_count || 0} {t('job.views')}
                                        </span>
                                        <span class="statItem" title={t('job.clicks_count')}>
                                            <svg class="statIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                            </svg>
                                            {job.clicks_count || 0} {t('job.applications')}
                                        </span>
                                    </div>
                                </div>

                                {/* Map Section - if GPS available */}
                                {job.location_geo && job.location_geo.coordinates && (
                                    <div class="mapContainer">
                                        <div class="mapWrapper">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                style="border:0"
                                                src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.PUBLIC_GOOGLE_MAPS_KEY}&q=${job.location_geo.coordinates[1]},${job.location_geo.coordinates[0]}&zoom=14`}
                                                allowFullscreen
                                            ></iframe>
                                            <div class="mapLabel">
                                                {job.location}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div class="descriptionSection">
                                    <div class="prose prose-indigo max-w-none dark:prose-invert">
                                        <h3 class="descriptionTitle">
                                            <span class="descriptionBar"></span>
                                            {t('job.description_title')}
                                        </h3>
                                        <div
                                            class="descriptionContent"
                                            dangerouslySetInnerHTML={job.description}
                                        ></div>
                                    </div>
                                </div>     {/* Skills Section */}
                                {
                                    job.skills && job.skills.length > 0 && (
                                        <div class="skillsSection">
                                            <h3 class="skillsTitle">
                                                {t('job.skills_title')}
                                            </h3>
                                            <div class="skillsList">
                                                {job.skills.map((skill) => (
                                                    <span key={skill} class="skillItem">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                }
                            </div>

                            {/* Company Info Box */}
                            <div class="companyInfoBox">
                                <div class="companyInfoHeader">
                                    <h3 class="companyInfoTitle">{t('job.about_company')}</h3>
                                    <div class="trustScore">
                                        <span class="trustStar">★</span>
                                        <span class="trustValue">{t('job.trust_score')}: {Math.round(job.companyScore || 80)}%</span>
                                    </div>
                                </div>
                                <p class="companyAboutText">
                                    {interpolate(t('job.about_company_desc'), { company: job.company })}
                                </p>
                            </div>

                            {/* Match Breakdown */}
                            {
                                state.matchScore && (
                                    <MatchBreakdown
                                        score={state.matchScore.score}
                                        factors={state.matchScore.factors}
                                        details={state.matchScore.details}
                                    />
                                )
                            }

                            {/* Comments Section */}
                            <div class="commentsSection">
                                <CommentsSection jobId={job.id} />
                            </div>
                        </div>
                    );
                }}
            />

            <Modal
                title={t('job.confirm_delete_title')}
                isOpen={state.showDeleteModal}
                onClose$={() => state.showDeleteModal = false}
                onConfirm$={handleDeleteJob}
                isDestructive={true}
                confirmText={t('job.delete')}
                cancelText={t('common.cancel')}
            >
                <p>{t('job.confirm_delete_msg')}</p>
            </Modal >
        </div >
    );
});
