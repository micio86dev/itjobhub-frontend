import { createContextId, Slot, component$, useStore, useContext, useContextProvider, useSignal, useTask$, useVisibleTask$, Signal, $, QRL } from "@builder.io/qwik";
import { useAuth } from "./auth";
import { request } from "../utils/api";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  description?: string;
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior' | 'unknown';
  availability: 'full_time' | 'part_time' | 'contract' | 'not_specified';
  location?: string;
  location_geo?: { coordinates: number[] };
  remote?: boolean;
  salary?: string;
  externalLink: string;
  likes: number;
  dislikes: number;
  publishDate: Date;
  companyLogo?: string;
  language?: string;
  comments_count?: number;
  user_reaction?: 'LIKE' | 'DISLIKE' | null;
  is_favorite?: boolean;
  companyScore?: number;
  companyLikes?: number;
  companyDislikes?: number;
}

export interface Comment {
  id: string;
  jobId: string;
  userId: string; // Added field
  author: {
    name: string;
    avatar?: string;
  };
  text: string;
  date: Date;
}

export interface Company {
  name: string;
  trustScore: number; // 0-100
  totalRatings: number;
}

export interface LikeJobRequest {
  jobId: string;
  remove?: boolean;
  wasDisliked?: boolean;
}

export interface DislikeJobRequest {
  jobId: string;
  remove?: boolean;
  wasLiked?: boolean;
}

export interface AddCommentRequest {
  jobId: string;
  author: { name: string; avatar?: string };
  text: string;
}

export interface PaginationState {
  currentPage: number;
  hasMore: boolean;
  isLoading: boolean;
  totalJobs: number;
  limit: number;
}

export interface JobsState {
  jobs: JobListing[];
  favorites: JobListing[];
  comments: Comment[];
  companies: Company[];
  pagination: PaginationState;
  currentFilters: JobFilters | null;
  // Signals for triggering actions
  likeJobSignal: Signal<LikeJobRequest | null>;
  dislikeJobSignal: Signal<DislikeJobRequest | null>;
  addCommentSignal: Signal<AddCommentRequest | null>;
  // QRL functions
  fetchComments$: QRL<(jobId: string) => Promise<void>>;
  fetchJobsPage$: QRL<(page: number, filters?: JobFilters, append?: boolean) => Promise<void>>;
  loadMoreJobs$: QRL<() => Promise<void>>;
  toggleFavorite$: QRL<(jobId: string) => Promise<void>>;
  fetchFavorites$: QRL<() => Promise<void>>;
  deleteComment$: QRL<(commentId: string) => Promise<void>>;
  editComment$: QRL<(commentId: string, newContent: string) => Promise<void>>;
}

export interface JobFilters {
  skills?: string[];
  seniority?: string;
  availability?: string;
  remote?: boolean;
  query?: string;
  dateRange?: string;
  location_geo?: { lat: number; lng: number };
  radius_km?: number;
  languages?: string[];
  location?: string;
}

// Helper to process raw API job into JobListing (outside component to avoid QRL serialization issues)
const processApiJob = (job: any): JobListing => {
  let desc = job.description || "";
  desc = desc
    .replace(/^(&nbsp;|\s|\.|\u00A0)+/g, '')
    .replace(/^(\.\.\.)+/g, '')
    .trim();

  return {
    id: job.id,
    title: job.title,
    company: job.company?.name || 'Unknown Company',
    description: desc,
    skills: job.technical_skills && job.technical_skills.length > 0 ? job.technical_skills : job.skills,
    seniority: (job.seniority || 'unknown').toLowerCase() as any,
    availability: (job.employment_type || 'not_specified').toLowerCase().replace('-', '_') as any,
    location: job.location,
    remote: job.remote || job.is_remote || false,
    salary: job.salary_min ? `€${job.salary_min.toLocaleString()}${job.salary_max ? ` - €${job.salary_max.toLocaleString()}` : ''}` : undefined,
    externalLink: job.link ? (job.link.startsWith('http') ? job.link : `https://${job.link}`) : '#',
    likes: job.likes || 0,
    dislikes: job.dislikes || 0,
    user_reaction: job.user_reaction,
    comments_count: job.comments_count || 0,
    publishDate: new Date(job.published_at || job.created_at || Date.now()),
    companyLogo: job.company?.logo_url || job.company?.logo,
    language: job.language,
    location_geo: job.location_geo,
    is_favorite: job.is_favorite || false,
    companyScore: job.company?.trustScore || 80,
    companyLikes: job.company?.totalLikes || 0,
    companyDislikes: job.company?.totalDislikes || 0
  };
};

export const JobsContext = createContextId<JobsState>('jobs-context');
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';

export const JobsProvider = component$(() => {
  const likeJobSignal = useSignal<LikeJobRequest | null>(null);
  const dislikeJobSignal = useSignal<DislikeJobRequest | null>(null);
  const addCommentSignal = useSignal<AddCommentRequest | null>(null);

  const jobsState = useStore<JobsState>({
    jobs: [],
    favorites: [],
    comments: [],
    companies: [],
    pagination: {
      currentPage: 1,
      hasMore: true,
      isLoading: false,
      totalJobs: 0,
      limit: 10 // Load 10 jobs per page
    },
    currentFilters: null,
    likeJobSignal,
    dislikeJobSignal,
    addCommentSignal,
    fetchComments$: $(async () => { }), // Initialize with a no-op QRL
    fetchJobsPage$: $(async () => { }), // Will be assigned below
    loadMoreJobs$: $(async () => { }), // Will be assigned below
    toggleFavorite$: $(async () => { }), // Will be assigned below
    fetchFavorites$: $(async () => { }), // Will be assigned below
    deleteComment$: $(async () => { }), // Will be assigned below
    editComment$: $(async () => { }), // Will be assigned below
  });



  // Assign the method inside useTask to avoid state mutation during render
  useTask$(() => {
    jobsState.fetchComments$ = $(async (jobId: string) => {
      try {
        const response = await request(`${API_URL}/comments/job/${jobId}`);
        if (!response.ok) throw new Error('Failed to fetch comments');
        const result = await response.json();
        if (result.success && result.data.comments) {
          const fetched = result.data.comments.map((c: any) => ({
            id: c.id,
            jobId: jobId,
            userId: c.user_id, // Map user_id
            author: {
              name: `${c.user.first_name} ${c.user.last_name}`,
              avatar: c.user.avatar
            },
            text: c.content,
            date: new Date(c.created_at)
          }));

          const others = jobsState.comments.filter(c => c.jobId !== jobId);
          jobsState.comments = [...others, ...fetched];
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    });
  });

  const auth = useAuth();

  // Assign pagination methods
  useTask$(() => {
    // fetchJobsPage$: Fetch a specific page of jobs with filters
    jobsState.fetchJobsPage$ = $(async (page: number, filters?: JobFilters, append = false) => {
      if (jobsState.pagination.isLoading) return;

      jobsState.pagination.isLoading = true;

      try {
        console.log(`Fetching jobs page ${page} with limit ${jobsState.pagination.limit}...`);
        const url = new URL(`${API_URL}/jobs`);
        url.searchParams.append('page', String(page));
        url.searchParams.append('limit', String(jobsState.pagination.limit));

        // Add filters to URL
        if (filters?.query) url.searchParams.append('q', filters.query);
        if (filters?.seniority) url.searchParams.append('seniority', filters.seniority);
        if (filters?.remote !== undefined) url.searchParams.append('remote', String(filters.remote));
        if (filters?.languages?.length) url.searchParams.append('languages', filters.languages.join(','));
        if (filters?.location_geo) {
          url.searchParams.append('lat', String(filters.location_geo.lat));
          url.searchParams.append('lng', String(filters.location_geo.lng));
          url.searchParams.append('radius_km', String(filters.radius_km || 50));
        }

        // Include auth token if available
        const headers: Record<string, string> = {};
        if (auth.token) {
          headers['Authorization'] = `Bearer ${auth.token}`;
        }

        const response = await request(url.toString(), { headers });

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data && result.data.jobs) {
          const processedJobs = result.data.jobs.map(processApiJob);
          const pagination = result.data.pagination;

          // Update pagination state
          jobsState.pagination.currentPage = pagination.page;
          jobsState.pagination.totalJobs = pagination.total;
          jobsState.pagination.hasMore = pagination.page < pagination.pages;

          // Append or replace jobs
          if (append) {
            jobsState.jobs = [...jobsState.jobs, ...processedJobs];
          } else {
            jobsState.jobs = processedJobs;
          }

          // Update companies
          const realCompanies = result.data.jobs
            .map((j: any) => j.company)
            .filter((c: any) => c)
            .map((c: any) => ({
              name: c.name,
              trustScore: c.trustScore || 80,
              totalRatings: c.totalRatings || 0
            }));

          const existingNames = new Set(jobsState.companies.map(c => c.name));
          realCompanies.forEach((c: any) => {
            if (!existingNames.has(c.name)) {
              jobsState.companies.push(c);
              existingNames.add(c.name);
            }
          });

          // Store current filters
          jobsState.currentFilters = filters || null;
        }
      } catch (error) {
        console.error('Failed to fetch jobs from API:', error);
        if (!append) {
          jobsState.jobs = [];
        }
        jobsState.pagination.hasMore = false;
      } finally {
        jobsState.pagination.isLoading = false;
      }
    });

    // loadMoreJobs$: Load next page and append
    jobsState.loadMoreJobs$ = $(async () => {
      if (!jobsState.pagination.hasMore || jobsState.pagination.isLoading) return;

      const nextPage = jobsState.pagination.currentPage + 1;
      await jobsState.fetchJobsPage$(nextPage, jobsState.currentFilters || undefined, true);
    });

    // toggleFavorite$: Add/remove job from favorites
    jobsState.toggleFavorite$ = $(async (jobId: string) => {
      // Find all instances of this job across state
      const allInstances = [
        ...jobsState.jobs.filter(j => j.id === jobId),
        ...jobsState.favorites.filter(j => j.id === jobId)
      ];

      if (allInstances.length === 0) return;

      // Get state from the first instance
      const wasFavorite = allInstances[0].is_favorite;

      // Optimistic update for ALL instances
      allInstances.forEach(job => {
        job.is_favorite = !wasFavorite;
      });

      try {
        const token = auth.token;
        if (!token) {
          // Revert on no auth
          allInstances.forEach(job => {
            job.is_favorite = wasFavorite;
          });
          return;
        }

        if (wasFavorite) {
          // Remove from favorites
          // Update local favorites state immediately
          jobsState.favorites = jobsState.favorites.filter(f => f.id !== jobId);

          await request(`${API_URL}/favorites?jobId=${jobId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else {
          // Add to favorites
          // Prevent duplication
          if (!jobsState.favorites.some(f => f.id === jobId)) {
            const sourceJob = allInstances[0];
            jobsState.favorites = [sourceJob, ...jobsState.favorites];
          }

          await request(`${API_URL}/favorites`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ jobId })
          });
        }
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
        // Revert on error for ALL instances
        allInstances.forEach(job => {
          job.is_favorite = wasFavorite;
        });
      }
    });

    // fetchFavorites$: Fetch all user favorites
    jobsState.fetchFavorites$ = $(async () => {
      try {
        const token = auth.token;
        if (!token) return;

        const response = await request(`${API_URL}/favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch favorites');

        const result = await response.json();
        if (result.success && result.data) {
          jobsState.favorites = result.data.map((item: any) => {
            const job = processApiJob(item.job);
            job.is_favorite = true; // Ensure favorite status is set
            return job;
          });
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      }
    });
  });

  // Load initial page on component mount (client-side only)
  useVisibleTask$(async () => {
    // Only fetch if we don't have jobs yet
    if (jobsState.jobs.length === 0) {
      await jobsState.fetchJobsPage$(1);
    }
  });

  // Refetch current page when auth token changes to get user_reaction
  useVisibleTask$(async ({ track }) => {
    const token = track(() => auth.token);

    if (token && jobsState.jobs.length > 0) {
      // Refetch current page with auth to update user_reaction
      await jobsState.fetchJobsPage$(1, jobsState.currentFilters || undefined, false);
    }
  });

  useVisibleTask$(async ({ track }) => {
    const likeReq = track(() => likeJobSignal.value);
    if (likeReq) {
      const allInstances = [
        ...jobsState.jobs.filter(j => j.id === likeReq.jobId),
        ...jobsState.favorites.filter(j => j.id === likeReq.jobId)
      ];

      if (allInstances.length > 0) {
        const job = allInstances[0];
        // Optimistic update for ALL instances
        const company = jobsState.companies.find((c: Company) => c.name === job.company);

        if (likeReq.remove) {
          job.likes = Math.max(0, job.likes - 1);
          job.user_reaction = null;
          if (job.companyLikes !== undefined) job.companyLikes = Math.max(0, job.companyLikes - 1);
        } else {
          // Add Like
          job.likes++;
          job.user_reaction = 'LIKE';
          if (job.companyLikes !== undefined) job.companyLikes++;
          // If swapping from dislike
          if (likeReq.wasDisliked) {
            job.dislikes = Math.max(0, job.dislikes - 1);
            if (job.companyDislikes !== undefined) job.companyDislikes = Math.max(0, job.companyDislikes - 1);
          }
        }

        // Update company-wide score on the job
        if (job.companyLikes !== undefined && job.companyDislikes !== undefined) {
          const likes = job.companyLikes;
          const dislikes = job.companyDislikes;
          const newScore = ((likes + 8) / (likes + dislikes + 10)) * 100;

          allInstances.forEach(j => {
            j.likes = job.likes;
            j.user_reaction = job.user_reaction;
            j.companyLikes = likes;
            j.companyDislikes = dislikes;
            j.companyScore = newScore;
          });
        }

        // API Call
        try {
          const token = auth.token;
          if (token) {
            if (likeReq.remove) {
              await request(`${API_URL}/likes?jobId=${likeReq.jobId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
            } else {
              await request(`${API_URL}/likes`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ jobId: likeReq.jobId, type: 'LIKE' })
              });
            }
          }
        } catch (error) {
          console.error('Failed to persist like action:', error);
        }
      }
      likeJobSignal.value = null;
    }
  });

  // Assign deleteComment method
  useTask$(() => {
    jobsState.deleteComment$ = $(async (commentId: string) => {
      const comment = jobsState.comments.find(c => c.id === commentId);
      if (!comment) return;
      const jobId = comment.jobId;

      // Optimistic update
      const originalComments = [...jobsState.comments];
      jobsState.comments = jobsState.comments.filter(c => c.id !== commentId);

      // Update comment count safely handling potential shared references
      const jobsToUpdate = new Set([
        ...jobsState.jobs.filter(j => j.id === jobId),
        ...jobsState.favorites.filter(j => j.id === jobId)
      ]);

      jobsToUpdate.forEach(job => {
        job.comments_count = Math.max(0, (job.comments_count || 0) - 1);
      });

      try {
        const token = auth.token;
        if (!token) throw new Error("Not authorized");

        const response = await request(`${API_URL}/comments/${commentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete comment');
        }
      } catch (error) {
        console.error('Failed to delete comment:', error);
        // Revert on error
        jobsState.comments = originalComments;

        const jobsToRevert = new Set([
          ...jobsState.jobs.filter(j => j.id === jobId),
          ...jobsState.favorites.filter(j => j.id === jobId)
        ]);

        jobsToRevert.forEach(job => {
          job.comments_count = (job.comments_count || 0) + 1;
        });

        alert('Failed to delete comment');
      }
    });

    jobsState.editComment$ = $(async (commentId: string, newContent: string) => {
      // Optimistic update
      const commentIndex = jobsState.comments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) return;

      const originalComment = { ...jobsState.comments[commentIndex] };
      jobsState.comments[commentIndex].text = newContent;

      try {
        const token = auth.token;
        if (!token) throw new Error("Not authorized");

        const response = await request(`${API_URL}/comments/${commentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: newContent })
        });

        if (!response.ok) {
          throw new Error('Failed to edit comment');
        }
      } catch (error) {
        console.error('Failed to edit comment:', error);
        // Revert on error
        jobsState.comments[commentIndex] = originalComment;
        alert('Failed to edit comment');
      }
    });
  });

  useVisibleTask$(async ({ track }) => {
    const dislikeReq = track(() => dislikeJobSignal.value);
    // ... (rest of dislike logic is unchanged, avoiding large replacement if possible, but context requires full block if I selected it)
    /* Since I cannot select non-contiguous blocks easily without potentially breaking references, I will assume the previous block ended right before `useVisibleTask` for dislikeReq.
       Wait, I selected 489 to 667 approx in my previous view. But replace_file_content needs exact target.
       I will target strictly the deleteComment$ block and the addCommentSignal block separately if needed.
       The tool documentation says "Specify each edit as a separate ReplacementChunk" for multi_replace_file_content.
       But I am using replace_file_content.
       I will use multi_replace_file_content to do both updates safely.
    */
  });

  useVisibleTask$(async ({ track }) => {
    const dislikeReq = track(() => dislikeJobSignal.value);
    if (dislikeReq) {
      const allInstances = [
        ...jobsState.jobs.filter(j => j.id === dislikeReq.jobId),
        ...jobsState.favorites.filter(j => j.id === dislikeReq.jobId)
      ];

      if (allInstances.length > 0) {
        const job = allInstances[0];
        // Optimistic update for ALL instances
        const company = jobsState.companies.find((c: Company) => c.name === job.company);

        if (dislikeReq.remove) {
          job.dislikes = Math.max(0, job.dislikes - 1);
          job.user_reaction = null;
          if (job.companyDislikes !== undefined) job.companyDislikes = Math.max(0, job.companyDislikes - 1);
        } else {
          // Add Dislike
          job.dislikes++;
          job.user_reaction = 'DISLIKE';
          if (job.companyDislikes !== undefined) job.companyDislikes++;
          // If swapping from like
          if (dislikeReq.wasLiked) {
            job.likes = Math.max(0, job.likes - 1);
            if (job.companyLikes !== undefined) job.companyLikes = Math.max(0, job.companyLikes - 1);
          }
        }

        // Update company-wide score on the job
        if (job.companyLikes !== undefined && job.companyDislikes !== undefined) {
          const likes = job.companyLikes;
          const dislikes = job.companyDislikes;
          const newScore = ((likes + 8) / (likes + dislikes + 10)) * 100;

          allInstances.forEach(j => {
            j.dislikes = job.dislikes;
            j.likes = job.likes;
            j.user_reaction = job.user_reaction;
            j.companyLikes = likes;
            j.companyDislikes = dislikes;
            j.companyScore = newScore;
          });
        }

        // API Call
        try {
          const token = auth.token;
          if (token) {
            if (dislikeReq.remove) {
              await request(`${API_URL}/likes?jobId=${dislikeReq.jobId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
            } else {
              await request(`${API_URL}/likes`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ jobId: dislikeReq.jobId, type: 'DISLIKE' })
              });
            }
          }
        } catch (error) {
          console.error('Failed to persist dislike action:', error);
        }
      }
      dislikeJobSignal.value = null;
    }
  });

  useVisibleTask$(async ({ track }) => {
    const commentReq = track(() => jobsState.addCommentSignal.value);
    if (commentReq) {
      try {
        const token = auth.token;
        if (!token) throw new Error("No token found");

        console.log(`[JobsContext] Adding comment to ${commentReq.jobId}`);
        console.log(`[JobsContext] Target URL: ${API_URL}/comments`);
        console.log(`[JobsContext] Token exists: ${!!token}, Length: ${token?.length}`);

        const response = await request(`${API_URL}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            jobId: commentReq.jobId,
            content: commentReq.text
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to add comment: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          jobsState.comments.push({
            id: result.data.id,
            jobId: commentReq.jobId,
            userId: auth.user?.id || '', // Add userId
            author: commentReq.author,
            text: commentReq.text,
            date: new Date(result.data.created_at)
          });

          // Increment count safely handling potential shared references
          const jobsToUpdate = new Set([
            ...jobsState.jobs.filter(j => j.id === commentReq.jobId),
            ...jobsState.favorites.filter(j => j.id === commentReq.jobId)
          ]);

          jobsToUpdate.forEach(job => {
            job.comments_count = (job.comments_count || 0) + 1;
          });
        }
      } catch (error) {
        console.error('Error adding comment:', error);
      } finally {
        jobsState.addCommentSignal.value = null;
      }
    }
  });

  useVisibleTask$(() => {
    jobsState.fetchFavorites$();
  });

  useContextProvider(JobsContext, jobsState);
  return <Slot />;
});

export const useJobs = () => useContext(JobsContext);

// Haversine formula to calculate distance between two points in km
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const filterJobs = (jobs: any[], page = 1, limit = 1000, filters?: JobFilters) => {
  let filteredJobs = [...jobs];
  if (filters) {
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        (job.skills && Array.isArray(job.skills) && job.skills.some((skill: any) => skill.toLowerCase().includes(query))) ||
        (job.description && job.description.toLowerCase().includes(query))
      );
    }
    if (filters.skills?.length) {
      filteredJobs = filteredJobs.filter(job =>
        job.skills && job.skills.some((skill: string) =>
          filters.skills!.some((filterSkill: string) =>
            skill.toLowerCase().includes(filterSkill.toLowerCase())
          )
        )
      );
    }
    if (filters.seniority) filteredJobs = filteredJobs.filter(job => job.seniority === filters.seniority);
    if (filters.availability) filteredJobs = filteredJobs.filter(job => job.availability === filters.availability);
    if (filters.remote !== undefined) filteredJobs = filteredJobs.filter(job => job.remote === filters.remote);
    if (filters.dateRange) {
      const filterDate = new Date();
      if (filters.dateRange === 'today') filterDate.setHours(0, 0, 0, 0);
      else if (filters.dateRange === 'week') filterDate.setDate(new Date().getDate() - 7);
      else if (filters.dateRange === 'month') filterDate.setMonth(new Date().getMonth() - 1);
      else if (filters.dateRange === '3months') filterDate.setMonth(new Date().getMonth() - 3);
      else filterDate.setFullYear(2000);
      filteredJobs = filteredJobs.filter(job => job.publishDate >= filterDate);
    }
    if (filters.languages?.length) {
      const langMapping: { [key: string]: string } = {
        'italian': 'it', 'italiano': 'it',
        'english': 'en', 'inglese': 'en',
        'spanish': 'es', 'spagnolo': 'es',
        'french': 'fr', 'francese': 'fr',
        'german': 'de', 'tedesco': 'de',
        'portuguese': 'pt', 'portoghese': 'pt',
        'russian': 'ru', 'russo': 'ru',
        'chinese': 'zh', 'cinese': 'zh',
        'japanese': 'ja', 'giapponese': 'ja',
        'arabic': 'ar', 'arabo': 'ar',
        'dutch': 'nl', 'olandese': 'nl',
        'swedish': 'sv', 'svedese': 'sv'
      };

      const targetCodes = new Set<string>();
      filters.languages.forEach(l => {
        const lower = l.toLowerCase();
        targetCodes.add(lower);
        if (langMapping[lower]) targetCodes.add(langMapping[lower]);
      });

      filteredJobs = filteredJobs.filter(job => {
        if (!job.language) return true;
        const jobLang = job.language.toLowerCase();
        return Array.from(targetCodes).some(code =>
          jobLang === code || (langMapping[jobLang] && targetCodes.has(langMapping[jobLang]))
        );
      });
    }
  }
  const startIndex = (page - 1) * limit;

  // Final geo filtering if coordinates provided
  if (filters?.location_geo && filters.radius_km) {
    const { lat, lng } = filters.location_geo;
    filteredJobs = filteredJobs.filter(job => {
      // If the job has specific coordinates, use them
      if (job.location_geo?.coordinates && job.location_geo.coordinates.length >= 2) {
        const [jobLng, jobLat] = job.location_geo.coordinates;
        const dist = getDistance(lat, lng, jobLat, jobLng);
        return dist <= filters.radius_km!;
      }
      return true; // Keep jobs without geo? Or exclude? User says "sfruttando le coordinate gps presenti". 
      // Usually keep others if location name matches? 
      // For now, if someone searches by city, we only want those in radius.
    });
  }

  return filteredJobs.slice(startIndex, startIndex + limit);
};

export const getPersonalizedJobs = (jobs: JobListing[], userSkills?: string[], userSeniority?: string, userLanguages?: string[], fallbackLanguage?: string) => {
  let filteredJobs = [...jobs];

  const targetLanguages = (userLanguages && userLanguages.length > 0)
    ? userLanguages
    : (fallbackLanguage ? [fallbackLanguage] : []);

  // 1. Filter by languages
  if (targetLanguages.length > 0) {
    const langMapping: { [key: string]: string } = {
      'italian': 'it', 'italiano': 'it',
      'english': 'en', 'inglese': 'en',
      'spanish': 'es', 'spagnolo': 'es',
      'french': 'fr', 'francese': 'fr',
      'german': 'de', 'tedesco': 'de',
      'portuguese': 'pt', 'portoghese': 'pt',
      'russian': 'ru', 'russo': 'ru',
      'chinese': 'zh', 'cinese': 'zh',
      'japanese': 'ja', 'giapponese': 'ja',
      'arabic': 'ar', 'arabo': 'ar',
      'dutch': 'nl', 'olandese': 'nl',
      'swedish': 'sv', 'svedese': 'sv'
    };

    const targetCodes = new Set<string>();
    targetLanguages.forEach(l => {
      const lower = l.toLowerCase();
      targetCodes.add(lower);
      if (langMapping[lower]) targetCodes.add(langMapping[lower]);
    });

    filteredJobs = filteredJobs.filter(job => {
      if (!job.language) return true;
      const jobLang = job.language.toLowerCase();
      return Array.from(targetCodes).some(code =>
        jobLang === code || (langMapping[jobLang] && targetCodes.has(langMapping[jobLang]))
      );
    });
  }

  // 2. Filter by Seniority (if specified)
  if (userSeniority) {
    const normalizeSeniority = (s: string) => s.toLowerCase().trim();
    const userSen = normalizeSeniority(userSeniority);

    filteredJobs = filteredJobs.filter(job => {
      if (!job.seniority || job.seniority === 'unknown') return true; // Keep unknown seniority
      return normalizeSeniority(job.seniority) === userSen;
    });
  }

  // 3. Filter by Skills (if specified) - Must match at least one skill
  if (userSkills && userSkills.length > 0) {
    filteredJobs = filteredJobs.filter(job => {
      if (!job.skills || job.skills.length === 0) return true; // Keep jobs with no skills specified
      return job.skills.some(skill =>
        userSkills.some(userSkill => skill.toLowerCase().includes(userSkill.toLowerCase()))
      );
    });
  }

  if (!userSkills?.length && !userSeniority) return filteredJobs;

  // 4. Scoring for sort order
  const scoredJobs = filteredJobs.map((job) => {
    let score = 0;
    if (userSkills?.length) {
      const matchingSkills = job.skills.filter(skill => userSkills.some(userSkill => skill.toLowerCase().includes(userSkill.toLowerCase())));
      score += (matchingSkills.length / userSkills.length) * 50;
    }
    if (userSeniority && job.seniority && job.seniority.toLowerCase() === userSeniority.toLowerCase()) score += 30; // Boost for exact seniority match

    // Recency boost
    const daysSincePosted = Math.floor((new Date().getTime() - job.publishDate.getTime()) / (1000 * 60 * 60 * 24));
    score += Math.max(0, 10 - daysSincePosted);

    return { ...job, score };
  });

  return scoredJobs.sort((a: any, b: any) => b.score - a.score || b.publishDate.getTime() - a.publishDate.getTime()).map((j: any) => {
    const { score, ...job } = j;
    void score;
    return job;
  });
};

export const getCommentsFromState = (comments: Comment[], jobId: string) => {
  return comments.filter((comment: Comment) => comment.jobId === jobId).sort((a: Comment, b: Comment) => b.date.getTime() - a.date.getTime());
};

export const getCompanyScoreFromState = (companies: Company[], companyName: string) => {
  const company = companies.find((c: Company) => c.name === companyName);
  return company ? Math.round(company.trustScore) : 80;
};

export const useJobsActions = () => {
  const jobsState = useContext(JobsContext);
  return {
    getJobs: (page = 1, limit = 10, filters?: JobFilters) => filterJobs(jobsState.jobs, page, limit, filters),
    getFilteredJobs: (userSkills?: string[], userAvailability?: string) => getPersonalizedJobs(jobsState.jobs, userSkills, userAvailability),
    getComments: (jobId: string) => getCommentsFromState(jobsState.comments, jobId),
    getCompanyScore: (companyName: string) => getCompanyScoreFromState(jobsState.companies, companyName)
  };
};