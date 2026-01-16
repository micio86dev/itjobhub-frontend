import { component$, useStore, useTask$, isBrowser, useResource$, Resource, $, useStylesScoped$ } from "@builder.io/qwik";

import { useLocation, Link, useNavigate } from "@builder.io/qwik-city";
import { request } from "~/utils/api";
import { Modal } from "~/components/ui/modal";
import { useJobs, type JobListing } from "~/contexts/jobs";
import type { MatchScore } from "~/types/models";
import { useTranslate } from "~/contexts/i18n";
import { useAuth } from "~/contexts/auth";
import { CommentsSection } from "~/components/jobs/comments-section";
import { MatchBreakdown } from "~/components/jobs/match-breakdown";
import { JobPostingSchema } from "~/components/seo/json-ld";
import { JobHeader } from "~/components/jobs/job-header";
import { JobMapSection } from "~/components/jobs/job-map-section";
import { JobDescription } from "~/components/jobs/job-description";
import { JobSkillsList } from "~/components/jobs/job-skills-list";
import { CompanyInfoBox } from "~/components/jobs/company-info-box";
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
            job.likes = Math.max(0, (job.likes || 0) - 1);
            job.user_reaction = null;
            if (job.companyLikes !== undefined) job.companyLikes = Math.max(0, job.companyLikes - 1);
            jobsContext.likeJobSignal.value = { jobId: job.id, remove: true };
        } else {
            job.likes = (job.likes || 0) + 1;
            job.user_reaction = 'LIKE';
            if (job.companyLikes !== undefined) job.companyLikes = (job.companyLikes || 0) + 1;

            if (currentReaction === 'DISLIKE') {
                job.dislikes = Math.max(0, (job.dislikes || 0) - 1);
                if (job.companyDislikes !== undefined) job.companyDislikes = Math.max(0, job.companyDislikes - 1);
            }

            jobsContext.likeJobSignal.value = {
                jobId: job.id,
                wasDisliked: currentReaction === 'DISLIKE'
            };
        }

        if (job.companyLikes !== undefined && job.companyDislikes !== undefined) {
            job.companyScore = ((job.companyLikes + 8) / (job.companyLikes + job.companyDislikes + 10)) * 100;
        }

        state.job = { ...job };
    });

    const handleDislike = $(() => {
        if (!auth.isAuthenticated || !state.job) return;
        const job = state.job;
        const currentReaction = job.user_reaction;

        if (currentReaction === 'DISLIKE') {
            job.dislikes = Math.max(0, (job.dislikes || 0) - 1);
            job.user_reaction = null;
            if (job.companyDislikes !== undefined) job.companyDislikes = Math.max(0, job.companyDislikes - 1);
            jobsContext.dislikeJobSignal.value = { jobId: job.id, remove: true };
        } else {
            job.dislikes = (job.dislikes || 0) + 1;
            job.user_reaction = 'DISLIKE';
            if (job.companyDislikes !== undefined) job.companyDislikes = (job.companyDislikes || 0) + 1;

            if (currentReaction === 'LIKE') {
                job.likes = Math.max(0, (job.likes || 0) - 1);
                if (job.companyLikes !== undefined) job.companyLikes = Math.max(0, job.companyLikes - 1);
            }

            jobsContext.dislikeJobSignal.value = {
                jobId: job.id,
                wasLiked: currentReaction === 'LIKE'
            };
        }

        if (job.companyLikes !== undefined && job.companyDislikes !== undefined) {
            job.companyScore = ((job.companyLikes + 8) / (job.companyLikes + job.companyDislikes + 10)) * 100;
        }

        state.job = { ...job };
    });

    const handleToggleFavorite = $(async () => {
        if (!auth.isAuthenticated || !state.job) return;
        await jobsContext.toggleFavorite$(state.job.id);

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
            }
        } catch (e) {
            console.error(e);
        } finally {
            state.showDeleteModal = false;
        }
    });

    const handleApplyClick = $(() => {
        if (state.job) {
            jobsContext.trackJobInteraction$(state.job.id, 'APPLY');
        }
    });

    // Track VIEW Interaction at top level of component
    useTask$(({ track }) => {
        const j = track(() => state.job);
        if (j && isBrowser) {
            jobsContext.trackJobInteraction$(j.id, 'VIEW');
        }
    });

    const handleShowDeleteModal = $(() => {
        state.showDeleteModal = true;
    });

    return (
        <div class="container">
            <Link href="/jobs" class="backLink">
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
                                <JobHeader
                                    job={job}
                                    isAuthenticated={auth.isAuthenticated}
                                    isAdmin={auth.user?.role === 'admin'}
                                    onLike$={handleLike}
                                    onDislike$={handleDislike}
                                    onToggleFavorite$={handleToggleFavorite}
                                    onDelete$={handleShowDeleteModal}
                                    onApplyClick$={handleApplyClick}
                                />

                                {/* Map Section - if GPS available */}
                                {job.location_geo && job.location_geo.coordinates && (
                                    <JobMapSection
                                        location={job.location || ''}
                                        coordinates={job.location_geo.coordinates as [number, number]}
                                    />
                                )}

                                <JobDescription description={job.description || ''} />

                                <JobSkillsList skills={job.skills || []} />
                            </div>

                            <CompanyInfoBox
                                company={job.company}
                                companyScore={job.companyScore}
                            />

                            {/* Match Breakdown */}
                            {state.matchScore && (
                                <MatchBreakdown
                                    score={state.matchScore.score}
                                    factors={state.matchScore.factors}
                                    details={state.matchScore.details}
                                />
                            )}

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
