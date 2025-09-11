import { createContextId, Slot, component$, useStore, useContext, useContextProvider, useSignal, useTask$, Signal } from "@builder.io/qwik";

export type SupportedLanguage = 'it' | 'en' | 'es' | 'de' | 'fr';

export interface SetLanguageRequest {
  language: SupportedLanguage;
}

interface I18nState {
  currentLanguage: SupportedLanguage;
  setLanguageSignal: Signal<SetLanguageRequest | null>;
  t: (key: string) => string;
}

export const I18nContext = createContextId<I18nState>('i18n-context');

// Translation dictionaries
const translations = {
  it: {
    // Navigation
    'nav.brand': 'ITJobHub',
    'nav.jobs': 'Annunci',
    'nav.profile': 'Profilo',
    'nav.login': 'Login',
    'nav.register': 'Registrati',
    'nav.logout': 'Logout',
    'nav.hello': 'Ciao',
    
    // Homepage
    'home.title': 'Benvenuto in ITJobHub',
    'home.subtitle': 'La piattaforma per trovare il lavoro dei tuoi sogni nel mondo IT',
    'home.register_free': 'Registrati Gratis',
    'home.login': 'Accedi',
    'home.opportunities_title': 'Opportunità Esclusive',
    'home.opportunities_desc': 'Accedi alle migliori offerte di lavoro nel settore tecnologico',
    'home.growth_title': 'Crescita Professionale',
    'home.growth_desc': 'Sviluppa la tua carriera con le aziende più innovative',
    'home.remote_title': 'Remote & Flexible',
    'home.remote_desc': 'Trova lavori remote e con orari flessibili',
    
    // Jobs page
    'jobs.title': 'Annunci di Lavoro',
    'jobs.search_placeholder': 'Cerca per titolo, azienda, skills...',
    'jobs.search_label': 'Cerca annunci',
    'jobs.published_label': 'Pubblicato',
    'jobs.seniority_label': 'Seniority',
    'jobs.work_type_label': 'Tipo di lavoro',
    'jobs.mode_label': 'Modalità',
    'jobs.search_btn': 'Cerca',
    'jobs.all_dates': 'Tutte le date',
    'jobs.today': 'Oggi',
    'jobs.week': 'Ultima settimana',
    'jobs.month': 'Ultimo mese',
    'jobs.3months': 'Ultimi 3 mesi',
    'jobs.all_levels': 'Tutti i livelli',
    'jobs.junior': 'Junior',
    'jobs.mid': 'Mid-level', 
    'jobs.senior': 'Senior',
    'jobs.all_types': 'Tutti i tipi',
    'jobs.full_time': 'Full-time',
    'jobs.part_time': 'Part-time',
    'jobs.contract': 'Contract',
    'jobs.all_modes': 'Tutte le modalità',
    'jobs.remote': 'Remote',
    'jobs.office': 'In sede',
    'jobs.personalized_feed': '🎯 Feed Personalizzato',
    'jobs.all_jobs': '📋 Tutti gli Annunci',
    'jobs.apply': 'Candidati',
    'jobs.loading': 'Caricamento annunci...',
    'jobs.no_jobs': 'Nessun annuncio trovato',
    'jobs.scroll_more': 'Scorri per caricare altri annunci',
    'jobs.end_results': 'Hai visualizzato tutti gli annunci disponibili',
    
    // Job card
    'job.skills_required': 'Skills richieste',
    'job.salary': 'Retribuzione',
    'job.location': 'Località',
    'job.seniority': 'Seniority',
    'job.availability': 'Disponibilità',
    'job.trust_score': 'trust',
    'job.remote_badge': 'Remote',
    
    // Comments
    'comments.title': 'Commenti',
    'comments.placeholder': 'Scrivi un commento...',
    'comments.submit': 'Commenta',
    'comments.submitting': 'Invio...',
    'comments.login_to_comment': 'per commentare questo annuncio',
    'comments.no_comments': 'Nessun commento ancora',
    'comments.be_first': 'Sii il primo a commentare!',
    
    // Authentication
    'auth.login_title': 'Accedi al tuo account',
    'auth.register_title': 'Crea il tuo account',
    'auth.email': 'Indirizzo email',
    'auth.password': 'Password',
    'auth.confirm_password': 'Conferma password',
    'auth.name': 'Nome completo',
    'auth.login_btn': 'Accedi',
    'auth.register_btn': 'Registrati',
    'auth.logging_in': 'Accesso in corso...',
    'auth.registering': 'Registrazione in corso...',
    'auth.or_continue': 'Oppure continua con',
    'auth.or_register': 'Oppure registrati con',
    'auth.have_account': 'accedi se hai già un account',
    'auth.need_account': 'registrati per un nuovo account',
    'auth.login_to_interact': 'per mettere like e commentare',
    
    // Profile & Wizard
    'profile.title': 'Il tuo Profilo',
    'profile.complete_profile': 'Completa il tuo profilo',
    'profile.edit_profile': 'Modifica Profilo',
    'profile.completed': 'Profilo completato',
    'profile.languages_title': 'Lingue parlate',
    'profile.skills_title': 'Competenze tecniche',
    'profile.seniority_title': 'Livello di seniority',
    'profile.availability_title': 'Disponibilità',
    
    // Wizard
    'wizard.step_of': 'Step {current} di {total}',
    'wizard.languages_step': 'Lingue parlate',
    'wizard.languages_desc': 'Seleziona le lingue che parli fluentemente',
    'wizard.languages_placeholder': 'Aggiungi una lingua...',
    'wizard.skills_step': 'Skills tecniche',
    'wizard.skills_desc': 'Aggiungi le tue competenze tecniche principali',
    'wizard.skills_placeholder': 'Aggiungi una skill...',
    'wizard.seniority_step': 'Livello di seniority',
    'wizard.seniority_desc': 'Seleziona il tuo livello di esperienza',
    'wizard.availability_step': 'Disponibilità',
    'wizard.availability_desc': 'Indica la tua disponibilità lavorativa',
    'wizard.back': 'Indietro',
    'wizard.next': 'Avanti',
    'wizard.cancel': 'Annulla',
    'wizard.complete': 'Completa',
    
    // Common
    'common.or': 'O',
    'common.and': 'e',
    'common.login': 'Accedi',
    'common.register': 'Registrati'
  },

  en: {
    // Navigation
    'nav.brand': 'ITJobHub',
    'nav.jobs': 'Jobs',
    'nav.profile': 'Profile',
    'nav.login': 'Login',
    'nav.register': 'Sign Up',
    'nav.logout': 'Logout',
    'nav.hello': 'Hi',
    
    // Homepage
    'home.title': 'Welcome to ITJobHub',
    'home.subtitle': 'The platform to find your dream job in the IT world',
    'home.register_free': 'Sign Up Free',
    'home.login': 'Login',
    'home.opportunities_title': 'Exclusive Opportunities',
    'home.opportunities_desc': 'Access the best job offers in the technology sector',
    'home.growth_title': 'Professional Growth',
    'home.growth_desc': 'Develop your career with the most innovative companies',
    'home.remote_title': 'Remote & Flexible',
    'home.remote_desc': 'Find remote jobs with flexible schedules',
    
    // Jobs page
    'jobs.title': 'Job Listings',
    'jobs.search_placeholder': 'Search by title, company, skills...',
    'jobs.search_label': 'Search jobs',
    'jobs.published_label': 'Published',
    'jobs.seniority_label': 'Seniority',
    'jobs.work_type_label': 'Work type',
    'jobs.mode_label': 'Mode',
    'jobs.search_btn': 'Search',
    'jobs.all_dates': 'All dates',
    'jobs.today': 'Today',
    'jobs.week': 'Last week',
    'jobs.month': 'Last month',
    'jobs.3months': 'Last 3 months',
    'jobs.all_levels': 'All levels',
    'jobs.junior': 'Junior',
    'jobs.mid': 'Mid-level',
    'jobs.senior': 'Senior',
    'jobs.all_types': 'All types',
    'jobs.full_time': 'Full-time',
    'jobs.part_time': 'Part-time',
    'jobs.contract': 'Contract',
    'jobs.all_modes': 'All modes',
    'jobs.remote': 'Remote',
    'jobs.office': 'On-site',
    'jobs.personalized_feed': '🎯 Personalized Feed',
    'jobs.all_jobs': '📋 All Jobs',
    'jobs.apply': 'Apply',
    'jobs.loading': 'Loading jobs...',
    'jobs.no_jobs': 'No jobs found',
    'jobs.scroll_more': 'Scroll to load more jobs',
    'jobs.end_results': 'You have viewed all available jobs',
    
    // Job card
    'job.skills_required': 'Required Skills',
    'job.salary': 'Salary',
    'job.location': 'Location',
    'job.seniority': 'Seniority',
    'job.availability': 'Availability',
    'job.trust_score': 'trust',
    'job.remote_badge': 'Remote',
    
    // Comments
    'comments.title': 'Comments',
    'comments.placeholder': 'Write a comment...',
    'comments.submit': 'Comment',
    'comments.submitting': 'Sending...',
    'comments.login_to_comment': 'to comment on this job',
    'comments.no_comments': 'No comments yet',
    'comments.be_first': 'Be the first to comment!',
    
    // Authentication
    'auth.login_title': 'Sign in to your account',
    'auth.register_title': 'Create your account',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.confirm_password': 'Confirm password',
    'auth.name': 'Full name',
    'auth.login_btn': 'Sign In',
    'auth.register_btn': 'Sign Up',
    'auth.logging_in': 'Signing in...',
    'auth.registering': 'Signing up...',
    'auth.or_continue': 'Or continue with',
    'auth.or_register': 'Or sign up with',
    'auth.have_account': 'sign in if you already have an account',
    'auth.need_account': 'sign up for a new account',
    'auth.login_to_interact': 'to like and comment',
    
    // Profile & Wizard
    'profile.title': 'Your Profile',
    'profile.complete_profile': 'Complete your profile',
    'profile.edit_profile': 'Edit Profile',
    'profile.completed': 'Profile completed',
    'profile.languages_title': 'Languages spoken',
    'profile.skills_title': 'Technical skills',
    'profile.seniority_title': 'Seniority level',
    'profile.availability_title': 'Availability',
    
    // Wizard
    'wizard.step_of': 'Step {current} of {total}',
    'wizard.languages_step': 'Languages spoken',
    'wizard.languages_desc': 'Select the languages you speak fluently',
    'wizard.languages_placeholder': 'Add a language...',
    'wizard.skills_step': 'Technical skills',
    'wizard.skills_desc': 'Add your main technical competencies',
    'wizard.skills_placeholder': 'Add a skill...',
    'wizard.seniority_step': 'Seniority level',
    'wizard.seniority_desc': 'Select your experience level',
    'wizard.availability_step': 'Availability',
    'wizard.availability_desc': 'Indicate your work availability',
    'wizard.back': 'Back',
    'wizard.next': 'Next',
    'wizard.cancel': 'Cancel',
    'wizard.complete': 'Complete',
    
    // Common
    'common.or': 'Or',
    'common.and': 'and',
    'common.login': 'Login',
    'common.register': 'Sign Up'
  },

  es: {
    // Navigation
    'nav.brand': 'ITJobHub',
    'nav.jobs': 'Ofertas',
    'nav.profile': 'Perfil',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',
    'nav.hello': 'Hola',
    
    // Homepage
    'home.title': 'Bienvenido a ITJobHub',
    'home.subtitle': 'La plataforma para encontrar el trabajo de tus sueños en el mundo IT',
    'home.register_free': 'Regístrate Gratis',
    'home.login': 'Iniciar Sesión',
    'home.opportunities_title': 'Oportunidades Exclusivas',
    'home.opportunities_desc': 'Accede a las mejores ofertas de trabajo en el sector tecnológico',
    'home.growth_title': 'Crecimiento Profesional',
    'home.growth_desc': 'Desarrolla tu carrera con las empresas más innovadoras',
    'home.remote_title': 'Remoto y Flexible',
    'home.remote_desc': 'Encuentra trabajos remotos y con horarios flexibles',
    
    // Jobs page
    'jobs.title': 'Ofertas de Trabajo',
    'jobs.search_placeholder': 'Buscar por título, empresa, habilidades...',
    'jobs.search_label': 'Buscar ofertas',
    'jobs.published_label': 'Publicado',
    'jobs.seniority_label': 'Experiencia',
    'jobs.work_type_label': 'Tipo de trabajo',
    'jobs.mode_label': 'Modalidad',
    'jobs.search_btn': 'Buscar',
    'jobs.all_dates': 'Todas las fechas',
    'jobs.today': 'Hoy',
    'jobs.week': 'Última semana',
    'jobs.month': 'Último mes',
    'jobs.3months': 'Últimos 3 meses',
    'jobs.all_levels': 'Todos los niveles',
    'jobs.junior': 'Junior',
    'jobs.mid': 'Intermedio',
    'jobs.senior': 'Senior',
    'jobs.all_types': 'Todos los tipos',
    'jobs.full_time': 'Tiempo completo',
    'jobs.part_time': 'Tiempo parcial',
    'jobs.contract': 'Contrato',
    'jobs.all_modes': 'Todas las modalidades',
    'jobs.remote': 'Remoto',
    'jobs.office': 'Presencial',
    'jobs.personalized_feed': '🎯 Feed Personalizado',
    'jobs.all_jobs': '📋 Todas las Ofertas',
    'jobs.apply': 'Postular',
    'jobs.loading': 'Cargando ofertas...',
    'jobs.no_jobs': 'No se encontraron ofertas',
    'jobs.scroll_more': 'Desliza para cargar más ofertas',
    'jobs.end_results': 'Has visto todas las ofertas disponibles'
  },

  de: {
    // Navigation
    'nav.brand': 'ITJobHub',
    'nav.jobs': 'Stellenanzeigen',
    'nav.profile': 'Profil',
    'nav.login': 'Anmelden',
    'nav.register': 'Registrieren',
    'nav.logout': 'Abmelden',
    'nav.hello': 'Hallo',
    
    // Homepage
    'home.title': 'Willkommen bei ITJobHub',
    'home.subtitle': 'Die Plattform, um Ihren Traumjob in der IT-Welt zu finden',
    'home.register_free': 'Kostenlos Registrieren',
    'home.login': 'Anmelden',
    'home.opportunities_title': 'Exklusive Möglichkeiten',
    'home.opportunities_desc': 'Zugang zu den besten Jobangeboten im Technologiesektor',
    'home.growth_title': 'Berufliches Wachstum',
    'home.growth_desc': 'Entwickeln Sie Ihre Karriere mit den innovativsten Unternehmen',
    'home.remote_title': 'Remote & Flexibel',
    'home.remote_desc': 'Finden Sie Remote-Jobs mit flexiblen Arbeitszeiten',
    
    // Jobs page
    'jobs.title': 'Stellenanzeigen',
    'jobs.search_placeholder': 'Nach Titel, Unternehmen, Skills suchen...',
    'jobs.search_label': 'Jobs suchen',
    'jobs.published_label': 'Veröffentlicht',
    'jobs.seniority_label': 'Erfahrung',
    'jobs.work_type_label': 'Arbeitstyp',
    'jobs.mode_label': 'Modus',
    'jobs.search_btn': 'Suchen',
    'jobs.all_dates': 'Alle Daten',
    'jobs.today': 'Heute',
    'jobs.week': 'Letzte Woche',
    'jobs.month': 'Letzter Monat',
    'jobs.3months': 'Letzte 3 Monate',
    'jobs.all_levels': 'Alle Level',
    'jobs.junior': 'Junior',
    'jobs.mid': 'Mittlere Erfahrung',
    'jobs.senior': 'Senior',
    'jobs.all_types': 'Alle Typen',
    'jobs.full_time': 'Vollzeit',
    'jobs.part_time': 'Teilzeit',
    'jobs.contract': 'Vertrag',
    'jobs.all_modes': 'Alle Modi',
    'jobs.remote': 'Remote',
    'jobs.office': 'Vor Ort',
    'jobs.personalized_feed': '🎯 Personalisierter Feed',
    'jobs.all_jobs': '📋 Alle Jobs',
    'jobs.apply': 'Bewerben',
    'jobs.loading': 'Jobs werden geladen...',
    'jobs.no_jobs': 'Keine Jobs gefunden',
    'jobs.scroll_more': 'Scrollen für weitere Jobs',
    'jobs.end_results': 'Sie haben alle verfügbaren Jobs angesehen'
  },

  fr: {
    // Navigation
    'nav.brand': 'ITJobHub',
    'nav.jobs': 'Offres',
    'nav.profile': 'Profil',
    'nav.login': 'Se connecter',
    'nav.register': "S'inscrire",
    'nav.logout': 'Se déconnecter',
    'nav.hello': 'Salut',
    
    // Homepage
    'home.title': 'Bienvenue sur ITJobHub',
    'home.subtitle': 'La plateforme pour trouver l\'emploi de vos rêves dans le monde IT',
    'home.register_free': 'Inscription Gratuite',
    'home.login': 'Se connecter',
    'home.opportunities_title': 'Opportunités Exclusives',
    'home.opportunities_desc': 'Accédez aux meilleures offres d\'emploi dans le secteur technologique',
    'home.growth_title': 'Croissance Professionnelle',
    'home.growth_desc': 'Développez votre carrière avec les entreprises les plus innovantes',
    'home.remote_title': 'Remote & Flexible',
    'home.remote_desc': 'Trouvez des emplois à distance avec des horaires flexibles',
    
    // Jobs page
    'jobs.title': 'Offres d\'Emploi',
    'jobs.search_placeholder': 'Rechercher par titre, entreprise, compétences...',
    'jobs.search_label': 'Rechercher des offres',
    'jobs.published_label': 'Publié',
    'jobs.seniority_label': 'Expérience',
    'jobs.work_type_label': 'Type de travail',
    'jobs.mode_label': 'Mode',
    'jobs.search_btn': 'Rechercher',
    'jobs.all_dates': 'Toutes les dates',
    'jobs.today': 'Aujourd\'hui',
    'jobs.week': 'Semaine dernière',
    'jobs.month': 'Mois dernier',
    'jobs.3months': '3 derniers mois',
    'jobs.all_levels': 'Tous les niveaux',
    'jobs.junior': 'Junior',
    'jobs.mid': 'Intermédiaire',
    'jobs.senior': 'Senior',
    'jobs.all_types': 'Tous les types',
    'jobs.full_time': 'Temps plein',
    'jobs.part_time': 'Temps partiel',
    'jobs.contract': 'Contrat',
    'jobs.all_modes': 'Tous les modes',
    'jobs.remote': 'Remote',
    'jobs.office': 'Sur site',
    'jobs.personalized_feed': '🎯 Feed Personnalisé',
    'jobs.all_jobs': '📋 Toutes les Offres',
    'jobs.apply': 'Postuler',
    'jobs.loading': 'Chargement des offres...',
    'jobs.no_jobs': 'Aucune offre trouvée',
    'jobs.scroll_more': 'Faites défiler pour charger plus d\'offres',
    'jobs.end_results': 'Vous avez vu toutes les offres disponibles'
  }
};

export const I18nProvider = component$(() => {
  // Create signal for language changes
  const setLanguageSignal = useSignal<SetLanguageRequest | null>(null);

  const i18nState: I18nState = useStore<I18nState>({
    currentLanguage: 'it',
    setLanguageSignal,

    t: (key: string) => {
      const currentTranslations = translations[i18nState.currentLanguage];
      if (!currentTranslations) return key;
      const translation = currentTranslations[key as keyof typeof currentTranslations];
      return translation || key;
    }
  });

  // Load saved language preference
  if (typeof localStorage !== 'undefined') {
    const savedLang = localStorage.getItem('preferred-language') as SupportedLanguage;
    if (savedLang && savedLang in translations) {
      i18nState.currentLanguage = savedLang;
    }
  }

  // Handle language change requests
  useTask$(({ track }) => {
    const langReq = track(() => setLanguageSignal.value);
    if (langReq) {
      i18nState.currentLanguage = langReq.language;
      // In a real app, you'd save this to localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('preferred-language', langReq.language);
      }
      setLanguageSignal.value = null;
    }
  });

  useContextProvider(I18nContext, i18nState);

  return <Slot />;
});

export const useI18n = () => {
  return useContext(I18nContext);
};

// Helper function for interpolation
export const interpolate = (template: string, values: Record<string, string | number>): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
};