import {
  component$,
  useStore,
  useTask$,
  isBrowser,
  useResource$,
  Resource,
  $,
  useStylesScoped$,
  useSignal,
} from "@builder.io/qwik";

import { useLocation, Link, useNavigate } from "@builder.io/qwik-city";
import { request } from "~/utils/api";
import logger from "~/utils/logger";
import { useJobs, type JobListing } from "~/contexts/jobs";
import type { MatchScore } from "~/types/models";
import { useTranslate } from "~/contexts/i18n";
import { useAuth } from "~/contexts/auth";
import { UnifiedCommentsSection } from "~/components/ui/comments-section";
import { MatchBreakdown } from "~/components/jobs/match-breakdown";
import { JobPostingSchema } from "~/components/seo/json-ld";
import { JobHeader } from "~/components/jobs/job-header";
import { JobMapSection } from "~/components/jobs/job-map-section";
import { JobDescription } from "~/components/jobs/job-description";
import { JobSkillsList } from "~/components/jobs/job-skills-list";
import { CompanyInfoBox } from "~/components/jobs/company-info-box";
import styles from "./index.css?inline";
import { Modal } from "~/components/ui/modal";

export default component$(() => {
  useStylesScoped$(styles);
  const loc = useLocation();
  const jobsContext = useJobs();
  const auth = useAuth();
  const t = useTranslate();
  const nav = useNavigate();
  const API_URL = import.meta.env.PUBLIC_API_URL || "http://127.0.0.1:3001";

  const state = useStore({
    job: null as JobListing | null,
    matchScore: null as MatchScore | null,
    isDeleting: false,
  });
  const showDeleteModal = useSignal(false);

  const jobResource = useResource$(async ({ track }) => {
    const id = track(() => loc.params.id);
    track(() => auth.token); // Re-fetch when auth changes to get is_favorite status
    if (!id || id === "undefined") return null;
    const job = await jobsContext.fetchJobById$(id);
    state.job = job;

    // Fetch match score if authenticated
    if (auth.token && job) {
      const scoreData = await jobsContext.fetchJobMatchScore$(job.id);
      state.matchScore = scoreData;
    }

    return job;
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
    state.isDeleting = true;
    try {
      const res = await request(`${API_URL}/jobs/${state.job.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (res.ok) {
        await nav("/jobs");
      } else {
        logger.error({ status: res.status }, "Failed to delete job");
      }
    } catch (e) {
      logger.error({ e }, "Error deleting job");
    } finally {
      state.isDeleting = false;
    }
  });

  const handleApplyClick = $(() => {
    if (state.job) {
      jobsContext.trackJobInteraction$(state.job.id, "APPLY");
      // Optimistic local update
      state.job.clicks_count = (state.job.clicks_count || 0) + 1;
    }
  });

  const handleAddSkill = $(async (skill: string) => {
    if (!auth.isAuthenticated || !auth.user || !auth.token) return;

    const currentSkills = auth.user.skills || [];
    if (currentSkills.includes(skill)) return;

    const newSkills = [...currentSkills, skill];

    // Use the existing updateProfileSignal to update skills
    auth.updateProfileSignal.value = {
      languages: auth.user.languages || [],
      skills: newSkills,
      seniority: auth.user.seniority || "",
      availability: auth.user.availability || "",
      workModes: auth.user.workModes || [],
    };
  });

  // Track VIEW Interaction at top level of component
  useTask$(({ track }) => {
    const jobId = track(() => state.job?.id);
    if (jobId && isBrowser) {
      jobsContext.trackJobInteraction$(jobId, "VIEW");
      // Optimistic local update
      if (state.job) {
        state.job.views_count = (state.job.views_count || 0) + 1;
      }
    }
  });

  return (
    <div class="container">
      <Link
        href="/jobs"
        class="group flex items-center gap-2 hover:bg-brand-neon/10 dark:hover:bg-brand-neon/5 mb-8 -ml-3 px-3 py-2 rounded-xl w-fit font-bold text-gray-600 hover:text-brand-neon dark:hover:text-brand-neon dark:text-white text-sm transition-all duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="transition-transform group-hover:-translate-x-1.5 duration-300"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span>{t("job.back_to_search")}</span>
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
                <h2 class="notFoundTitle">{t("job.not_found")}</h2>
                <p class="notFoundDesc">{t("job.not_found_description")}</p>
                <Link href="/jobs" class="notFoundButton">
                  {t("job.back_to_search")}
                </Link>
              </div>
            );
          }
          return (
            <div class="mainContent">
              {/* JobPosting JSON-LD for SEO */}
              <JobPostingSchema
                title={job.title}
                description={
                  job.description?.replace(/<[^>]*>/g, "").substring(0, 500) ||
                  job.title
                }
                datePosted={
                  job.publishDate instanceof Date
                    ? job.publishDate.toISOString()
                    : new Date().toISOString()
                }
                employmentType={job.availability || "full_time"}
                hiringOrganization={{
                  name: job.company,
                  logo: job.companyLogo,
                }}
                jobLocation={
                  job.location
                    ? {
                        addressLocality: job.location,
                        addressCountry: "IT",
                      }
                    : undefined
                }
                isRemote={job.remote}
                skills={job.skills}
              />

              {/* Header Card */}
              <div class="card">
                <JobHeader
                  job={job}
                  isAuthenticated={auth.isAuthenticated}
                  isAdmin={auth.user?.role === "admin"}
                  onToggleFavorite$={handleToggleFavorite}
                  onApplyClick$={handleApplyClick}
                />
                <div class="px-8 md:px-10 pb-8">
                  {auth.user?.role === "admin" && (
                    <>
                      <button
                        data-testid="delete-button"
                        onClick$={$(() => (showDeleteModal.value = true))}
                        class="hover:bg-red-50 px-4 py-2 border border-red-200 rounded font-bold text-red-600"
                      >
                        {t("job.delete")}
                      </button>

                      {showDeleteModal.value && (
                        <Modal
                          title={t("job.confirm_delete_title")}
                          isOpen={showDeleteModal.value}
                          onClose$={$(() => (showDeleteModal.value = false))}
                          onConfirm$={$(async () => {
                            await handleDeleteJob();
                            showDeleteModal.value = false;
                          })}
                          isDestructive={true}
                          isLoading={state.isDeleting}
                          confirmText={t("job.delete")}
                          cancelText={t("common.cancel")}
                        >
                          <p>{t("job.confirm_delete_msg")}</p>
                        </Modal>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Map Card - if GPS available */}
              {job.location_geo && job.location_geo.coordinates && (
                <div class="card">
                  <JobMapSection
                    location={job.location || ""}
                    geo={{
                      lat: job.location_geo.coordinates[1],
                      lng: job.location_geo.coordinates[0],
                    }}
                  />
                </div>
              )}

              {/* Description Card */}
              <div class="card">
                <JobDescription description={job.description || ""} />
              </div>

              {/* Skills Card */}
              {job.skills && job.skills.length > 0 && (
                <div class="card">
                  <JobSkillsList
                    skills={job.skills || []}
                    userSkills={auth.user?.skills || []}
                    onAddSkill$={handleAddSkill}
                  />
                </div>
              )}

              <CompanyInfoBox
                company={job.company}
                companyScore={job.companyScore}
              />

              {/* Match Breakdown Card */}
              {state.matchScore && (
                <MatchBreakdown
                  score={state.matchScore.score}
                  factors={state.matchScore.factors}
                  details={state.matchScore.details}
                />
              )}

              {/* Comments Card */}
              <div class="commentsSection">
                <UnifiedCommentsSection ownerId={job.id} type="job" />
              </div>
            </div>
          );
        }}
      />
    </div>
  );
});
