import { createContextId, Slot, component$, useStore, useContext, useContextProvider, useSignal, useTask$, Signal } from "@builder.io/qwik";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  description?: string;
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior';
  availability: 'full-time' | 'part-time' | 'contract';
  location?: string;
  remote?: boolean;
  salary?: string;
  externalLink: string;
  likes: number;
  dislikes: number;
  publishDate: Date;
  companyLogo?: string;
}

export interface Comment {
  id: string;
  jobId: string;
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
}

export interface DislikeJobRequest {
  jobId: string;
}

export interface AddCommentRequest {
  jobId: string;
  author: { name: string; avatar?: string };
  text: string;
}

export interface JobsState {
  jobs: JobListing[];
  comments: Comment[];
  companies: Company[];
  // Signals for triggering actions
  likeJobSignal: Signal<LikeJobRequest | null>;
  dislikeJobSignal: Signal<DislikeJobRequest | null>;
  addCommentSignal: Signal<AddCommentRequest | null>;
}

export interface JobFilters {
  skills?: string[];
  seniority?: string;
  availability?: string;
  remote?: boolean;
  query?: string;
  dateRange?: string;
}

export const JobsContext = createContextId<JobsState>('jobs-context');

// Mock data
const mockJobs: JobListing[] = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    company: 'Google',
    description: 'Sviluppa applicazioni web scalabili utilizzando React e Node.js',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
    seniority: 'senior',
    availability: 'full-time',
    location: 'Milano',
    remote: true,
    salary: '€80,000 - €120,000',
    externalLink: 'https://careers.google.com/jobs/123',
    likes: 45,
    dislikes: 3,
    publishDate: new Date(2024, 8, 10),
    companyLogo: '/logos/google.png'
  },
  {
    id: '2',
    title: 'Frontend Developer React',
    company: 'Meta',
    description: 'Crea interfacce utente moderne con React e TypeScript',
    skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'GraphQL'],
    seniority: 'mid',
    availability: 'full-time',
    location: 'Roma',
    remote: false,
    salary: '€55,000 - €75,000',
    externalLink: 'https://careers.meta.com/jobs/456',
    likes: 32,
    dislikes: 2,
    publishDate: new Date(2024, 8, 9),
  },
  {
    id: '3',
    title: 'Junior Python Developer',
    company: 'Spotify',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    seniority: 'junior',
    availability: 'full-time',
    location: 'Torino',
    remote: true,
    salary: '€35,000 - €45,000',
    externalLink: 'https://jobs.spotify.com/job/789',
    likes: 28,
    dislikes: 1,
    publishDate: new Date(2024, 8, 8),
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'Amazon',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux'],
    seniority: 'mid',
    availability: 'full-time',
    location: 'Milano',
    remote: true,
    salary: '€60,000 - €85,000',
    externalLink: 'https://amazon.jobs/en/job/101',
    likes: 41,
    dislikes: 4,
    publishDate: new Date(2024, 8, 7),
  },
  {
    id: '5',
    title: 'Mobile Developer iOS',
    company: 'Apple',
    skills: ['Swift', 'iOS', 'Xcode', 'UIKit', 'SwiftUI'],
    seniority: 'mid',
    availability: 'full-time',
    location: 'Milano',
    remote: false,
    externalLink: 'https://jobs.apple.com/job/102',
    likes: 38,
    dislikes: 2,
    publishDate: new Date(2024, 8, 6),
  },
  {
    id: '6',
    title: 'Backend Developer Node.js',
    company: 'Netflix',
    skills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker'],
    seniority: 'senior',
    availability: 'full-time',
    location: 'Roma',
    remote: true,
    salary: '€70,000 - €95,000',
    externalLink: 'https://jobs.netflix.com/job/103',
    likes: 52,
    dislikes: 5,
    publishDate: new Date(2024, 8, 5),
  },
  {
    id: '7',
    title: 'Data Scientist',
    company: 'Microsoft',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Power BI'],
    seniority: 'mid',
    availability: 'full-time',
    location: 'Napoli',
    remote: true,
    salary: '€65,000 - €90,000',
    externalLink: 'https://careers.microsoft.com/job/104',
    likes: 34,
    dislikes: 3,
    publishDate: new Date(2024, 8, 4),
  },
  {
    id: '8',
    title: 'Frontend Developer Vue.js',
    company: 'Airbnb',
    skills: ['Vue.js', 'Nuxt.js', 'JavaScript', 'CSS', 'Vuex'],
    seniority: 'junior',
    availability: 'part-time',
    location: 'Firenze',
    remote: true,
    salary: '€25,000 - €35,000',
    externalLink: 'https://careers.airbnb.com/job/105',
    likes: 19,
    dislikes: 1,
    publishDate: new Date(2024, 8, 3),
  },
  {
    id: '9',
    title: 'Full Stack Developer',
    company: 'Stripe',
    skills: ['React', 'Ruby on Rails', 'PostgreSQL', 'Redis', 'AWS'],
    seniority: 'senior',
    availability: 'full-time',
    location: 'Milano',
    remote: true,
    salary: '€85,000 - €110,000',
    externalLink: 'https://stripe.com/jobs/job/106',
    likes: 47,
    dislikes: 4,
    publishDate: new Date(2024, 8, 2),
  },
  {
    id: '10',
    title: 'Android Developer',
    company: 'Uber',
    skills: ['Kotlin', 'Android', 'Java', 'RxJava', 'Retrofit'],
    seniority: 'mid',
    availability: 'full-time',
    location: 'Roma',
    remote: false,
    salary: '€50,000 - €70,000',
    externalLink: 'https://uber.com/careers/job/107',
    likes: 26,
    dislikes: 2,
    publishDate: new Date(2024, 8, 1),
  },
  {
    id: '11',
    title: 'QA Engineer',
    company: 'Tesla',
    skills: ['Selenium', 'Jest', 'Python', 'JavaScript', 'Cypress'],
    seniority: 'junior',
    availability: 'full-time',
    location: 'Bologna',
    remote: true,
    salary: '€40,000 - €55,000',
    externalLink: 'https://tesla.com/careers/job/108',
    likes: 22,
    dislikes: 1,
    publishDate: new Date(2024, 7, 31),
  },
  {
    id: '12',
    title: 'Cloud Architect',
    company: 'Adobe',
    skills: ['AWS', 'Azure', 'GCP', 'Terraform', 'Microservices'],
    seniority: 'senior',
    availability: 'full-time',
    location: 'Milano',
    remote: true,
    salary: '€90,000 - €130,000',
    externalLink: 'https://adobe.com/careers/job/109',
    likes: 56,
    dislikes: 6,
    publishDate: new Date(2024, 7, 30),
  }
];

const mockComments: Comment[] = [
  {
    id: '1',
    jobId: '1',
    author: { name: 'Marco R.', avatar: '/avatars/marco.jpg' },
    text: 'Ottima posizione! Ho fatto il colloquio la settimana scorsa, molto professionale.',
    date: new Date(2024, 8, 11, 14, 30)
  },
  {
    id: '2',
    jobId: '1',
    author: { name: 'Sara L.' },
    text: 'Qualcuno sa se richiedono esperienza con AWS o se va bene anche Azure?',
    date: new Date(2024, 8, 11, 16, 15)
  },
  {
    id: '3',
    jobId: '2',
    author: { name: 'Giuseppe M.' },
    text: 'Meta ha un ottimo ambiente di lavoro. Consiglio vivamente!',
    date: new Date(2024, 8, 10, 9, 45)
  }
];

const mockCompanies: Company[] = [
  { name: 'Google', trustScore: 95, totalRatings: 1250 },
  { name: 'Meta', trustScore: 88, totalRatings: 890 },
  { name: 'Spotify', trustScore: 92, totalRatings: 450 },
  { name: 'Amazon', trustScore: 78, totalRatings: 2100 },
  { name: 'Apple', trustScore: 91, totalRatings: 1800 },
  { name: 'Netflix', trustScore: 89, totalRatings: 650 },
  { name: 'Microsoft', trustScore: 87, totalRatings: 1500 },
  { name: 'Airbnb', trustScore: 85, totalRatings: 400 },
  { name: 'Stripe', trustScore: 93, totalRatings: 300 },
  { name: 'Uber', trustScore: 76, totalRatings: 800 },
  { name: 'Tesla', trustScore: 82, totalRatings: 600 },
  { name: 'Adobe', trustScore: 86, totalRatings: 750 }
];

export const JobsProvider = component$(() => {
  // Create signals for actions
  const likeJobSignal = useSignal<LikeJobRequest | null>(null);
  const dislikeJobSignal = useSignal<DislikeJobRequest | null>(null);
  const addCommentSignal = useSignal<AddCommentRequest | null>(null);

  const jobsState: JobsState = useStore<JobsState>({
    jobs: [], // Start empty
    comments: [...mockComments],
    companies: [...mockCompanies],
    likeJobSignal,
    dislikeJobSignal,
    addCommentSignal,
  });

  // Fetch jobs from API
  useTask$(async () => {
    try {
      console.log('Fetching jobs from API...');
      const response = await fetch('http://127.0.0.1:3001/jobs?limit=100');
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.jobs) {
        jobsState.jobs = result.data.jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          company: job.company?.name || 'Unknown Company',
          description: job.description,
          skills: job.technical_skills && job.technical_skills.length > 0 ? job.technical_skills : job.skills,
          seniority: (job.seniority || 'mid').toLowerCase(),
          availability: (job.employment_type || 'full-time').toLowerCase(),
          location: job.location,
          remote: job.remote || job.is_remote || false,
          salary: job.salary_min ? `€${job.salary_min.toLocaleString()}${job.salary_max ? ` - €${job.salary_max.toLocaleString()}` : ''}` : undefined,
          externalLink: job.link || '#',
          likes: 0, // Backend might not have this yet
          dislikes: 0,
          publishDate: new Date(job.created_at || Date.now()),
          companyLogo: job.company?.logo_url || job.company?.logo
        })).sort((a: any, b: any) => b.publishDate.getTime() - a.publishDate.getTime());
      }
    } catch (error) {
      console.error('Failed to fetch jobs from API:', error);
      // Fallback to mock data if API fails to keep UI functional
      jobsState.jobs = [...mockJobs].sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
    }
  });

  // Handle like job requests
  useTask$(async ({ track }) => {
    const likeReq = track(() => likeJobSignal.value);
    if (likeReq) {
      const job = jobsState.jobs.find((j: JobListing) => j.id === likeReq.jobId);
      if (job) {
        job.likes++;
        // Update company trust score
        const company = jobsState.companies.find((c: Company) => c.name === job.company);
        if (company) {
          company.trustScore = Math.min(100, company.trustScore + 0.1);
          company.totalRatings++;
        }
      }
      likeJobSignal.value = null;
    }
  });

  // Handle dislike job requests
  useTask$(async ({ track }) => {
    const dislikeReq = track(() => dislikeJobSignal.value);
    if (dislikeReq) {
      const job = jobsState.jobs.find((j: JobListing) => j.id === dislikeReq.jobId);
      if (job) {
        job.dislikes++;
        // Update company trust score
        const company = jobsState.companies.find((c: Company) => c.name === job.company);
        if (company) {
          company.trustScore = Math.max(0, company.trustScore - 0.2);
          company.totalRatings++;
        }
      }
      dislikeJobSignal.value = null;
    }
  });

  // Handle add comment requests
  useTask$(async ({ track }) => {
    const commentReq = track(() => addCommentSignal.value);
    if (commentReq) {
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        jobId: commentReq.jobId,
        author: commentReq.author,
        text: commentReq.text,
        date: new Date()
      };
      jobsState.comments.push(newComment);
      addCommentSignal.value = null;
    }
  });

  useContextProvider(JobsContext, jobsState);

  return <Slot />;
});

export const useJobs = () => {
  return useContext(JobsContext);
};

export const filterJobs = (jobs: JobListing[], page = 1, limit = 10, filters?: JobFilters) => {
  let filteredJobs = [...jobs];
  
  if (filters) {
    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        (job.skills && Array.isArray(job.skills) && job.skills.some((skill: any) => skill.toLowerCase().includes(query))) ||
        (job.description && job.description.toLowerCase().includes(query))
      );
    }

    // Skills filter
    if (filters.skills?.length) {
      filteredJobs = filteredJobs.filter(job =>
        job.skills && Array.isArray(job.skills) && job.skills.some((skill: string) =>
          filters.skills!.some((filterSkill: string) =>
            skill.toLowerCase().includes(filterSkill.toLowerCase())
          )
        )
      );
    }

    // Seniority filter
    if (filters.seniority) {
      filteredJobs = filteredJobs.filter(job => job.seniority === filters.seniority);
    }

    // Availability filter
    if (filters.availability) {
      filteredJobs = filteredJobs.filter(job => job.availability === filters.availability);
    }

    // Remote filter
    if (filters.remote !== undefined) {
      filteredJobs = filteredJobs.filter(job => job.remote === filters.remote);
    }

    // Date range filter
    if (filters.dateRange) {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        default:
          filterDate.setFullYear(2000); // Show all
      }
      
      filteredJobs = filteredJobs.filter(job => job.publishDate >= filterDate);
    }
  }

  const startIndex = (page - 1) * limit;
  return filteredJobs.slice(startIndex, startIndex + limit);
};

export const getPersonalizedJobs = (jobs: JobListing[], userSkills?: string[], userAvailability?: string) => {
  if (!userSkills?.length && !userAvailability) {
    return jobs;
  }

  const scoredJobs = jobs.map((job) => {
    let score = 0;

    // Skills matching
    if (userSkills?.length) {
      const matchingSkills = job.skills.filter(skill => 
        userSkills.some(userSkill => 
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      score += (matchingSkills.length / userSkills.length) * 50;
    }

    // Availability matching
    if (userAvailability && job.availability === userAvailability) {
      score += 25;
    }

    // Recent posts get bonus
    const daysSincePosted = Math.floor(
      (new Date().getTime() - job.publishDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    score += Math.max(0, 10 - daysSincePosted);

    return { ...job, score };
  });

  return scoredJobs
    .sort((a: JobListing & {score: number}, b: JobListing & {score: number}) => b.score - a.score || b.publishDate.getTime() - a.publishDate.getTime())
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ score: _, ...job }: JobListing & {score: number}) => job);
};

export const getCommentsFromState = (comments: Comment[], jobId: string) => {
  return comments
    .filter((comment: Comment) => comment.jobId === jobId)
    .sort((a: Comment, b: Comment) => b.date.getTime() - a.date.getTime());
};

export const getCompanyScoreFromState = (companies: Company[], companyName: string) => {
  const company = companies.find((c: Company) => c.name === companyName);
  return company ? Math.round(company.trustScore) : 80;
};



export const useJobsActions = () => {
  const jobsState = useContext(JobsContext);
  
  const getJobs = (page = 1, limit = 10, filters?: JobFilters) => {
    return filterJobs(jobsState.jobs, page, limit, filters);
  };

  const getFilteredJobs = (userSkills?: string[], userAvailability?: string) => {
    return getPersonalizedJobs(jobsState.jobs, userSkills, userAvailability);
  };

  const getComments = (jobId: string) => {
    return getCommentsFromState(jobsState.comments, jobId);
  };

  const getCompanyScore = (companyName: string) => {
    return getCompanyScoreFromState(jobsState.companies, companyName);
  };

  return {
    getJobs,
    getFilteredJobs, 
    getComments,
    getCompanyScore
  };
};