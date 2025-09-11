import { component$, $, useStore, type QRL } from "@builder.io/qwik";
import type { JobListing } from "~/contexts/jobs";
import { useJobs } from "~/contexts/jobs";
import { useAuth } from "~/contexts/auth";

interface JobCardProps {
  job: JobListing;
  onToggleComments$: QRL<(jobId: string) => void>;
  showComments?: boolean;
}

export const JobCard = component$<JobCardProps>(({ job, onToggleComments$, showComments = false }) => {
  const jobsContext = useJobs();
  const auth = useAuth();
  
  // Extract values and signals to avoid serialization issues
  const isAuthenticated = auth.isAuthenticated;
  const likeJobSignal = jobsContext.likeJobSignal;
  const dislikeJobSignal = jobsContext.dislikeJobSignal;
  
  const state = useStore({
    hasLiked: false,
    hasDisliked: false
  });

  const handleLike = $(() => {
    if (!state.hasLiked) {
      // Trigger like through signal
      likeJobSignal.value = { jobId: job.id };
      state.hasLiked = true;
      state.hasDisliked = false;
    }
  });

  const handleDislike = $(() => {
    if (!state.hasDisliked) {
      // Trigger dislike through signal
      dislikeJobSignal.value = { jobId: job.id };
      state.hasDisliked = true;
      state.hasLiked = false;
    }
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Oggi';
    if (diffDays === 2) return 'Ieri';
    if (diffDays <= 7) return `${diffDays - 1} giorni fa`;
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  };

  const companyScore = jobsContext.getCompanyScore(job.company);

  return (
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            {job.companyLogo && (
              <img 
                src={job.companyLogo} 
                alt={`${job.company} logo`}
                class="w-8 h-8 rounded"
                width="32"
                height="32"
              />
            )}
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">
                {job.title}
              </h3>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-700">
                  {job.company}
                </span>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {companyScore}% trust
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-right">
          <span class="text-xs text-gray-500">
            {formatDate(job.publishDate)}
          </span>
          {job.remote && (
            <div class="mt-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Remote
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <p class="text-gray-600 text-sm mb-4 line-clamp-2">
          {job.description}
        </p>
      )}

      {/* Job Details */}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Seniority
          </span>
          <div class="mt-1">
            <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              job.seniority === 'junior' ? 'bg-green-100 text-green-800' :
              job.seniority === 'mid' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {job.seniority === 'mid' ? 'Mid-level' : job.seniority}
            </span>
          </div>
        </div>
        
        <div>
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Disponibilità
          </span>
          <div class="mt-1">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {job.availability === 'full-time' ? 'Full-time' : 
               job.availability === 'part-time' ? 'Part-time' : 'Contract'}
            </span>
          </div>
        </div>
        
        {job.location && (
          <div>
            <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Località
            </span>
            <div class="mt-1">
              <span class="text-sm text-gray-900">
                {job.location}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Salary */}
      {job.salary && (
        <div class="mb-4">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Retribuzione
          </span>
          <div class="mt-1">
            <span class="text-sm font-semibold text-green-600">
              {job.salary}
            </span>
          </div>
        </div>
      )}

      {/* Skills */}
      <div class="mb-4">
        <span class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
          Skills richieste
        </span>
        <div class="flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <span
              key={skill}
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div class="flex items-center justify-between pt-4 border-t border-gray-100">
        <div class="flex items-center space-x-4">
          {/* Like/Dislike buttons */}
          <button
            onClick$={handleLike}
            disabled={!isAuthenticated}
            class={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
              state.hasLiked 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
            } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span class="text-lg">👍</span>
            <span class="text-sm font-medium">{job.likes}</span>
          </button>

          <button
            onClick$={handleDislike}
            disabled={!isAuthenticated}
            class={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
              state.hasDisliked 
                ? 'bg-red-100 text-red-700' 
                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
            } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span class="text-lg">👎</span>
            <span class="text-sm font-medium">{job.dislikes}</span>
          </button>

          {/* Comments button */}
          <button
            onClick$={() => onToggleComments$(job.id)}
            class={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
              showComments 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            } cursor-pointer`}
          >
            <span class="text-lg">💬</span>
            <span class="text-sm font-medium">
              {jobsContext.getComments(job.id).length}
            </span>
          </button>
        </div>

        {/* External link */}
        <a
          href={job.externalLink}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <span>Candidati</span>
          <svg class="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </a>
      </div>

      {/* Login prompt for non-authenticated users */}
      {!isAuthenticated && (
        <div class="mt-3 p-3 bg-gray-50 rounded-md">
          <p class="text-xs text-gray-600 text-center">
            <a href="/login" class="text-indigo-600 hover:text-indigo-500 font-medium">
              Accedi
            </a>
            {' '}o{' '}
            <a href="/register" class="text-indigo-600 hover:text-indigo-500 font-medium">
              registrati
            </a>
            {' '}per mettere like e commentare
          </p>
        </div>
      )}
    </div>
  );
});