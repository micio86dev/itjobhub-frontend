import {
  createContextId,
  Slot,
  component$,
  useStore,
  useContext,
  useContextProvider,
  useSignal,
  useTask$,
  useVisibleTask$,
  Signal,
  $,
  noSerialize,
} from "@builder.io/qwik";

export type SupportedLanguage = "it" | "en" | "es" | "de" | "fr";

export interface SetLanguageRequest {
  language: SupportedLanguage;
}

interface I18nState {
  currentLanguage: SupportedLanguage;
  setLanguageSignal: Signal<SetLanguageRequest | null>;
}

export const I18nContext = createContextId<I18nState>("i18n-context");

// Translation dictionaries
const translations = {
  it: {
    // Navigation
    "nav.brand": "ITJobHub",
    "nav.jobs": "Annunci",
    "nav.profile": "Profilo",
    "nav.login": "Login",
    "nav.register": "Registrati",
    "nav.logout": "Logout",
    "nav.hello": "Ciao",

    // Homepage
    "home.title": "Benvenuto in ITJobHub",
    "home.subtitle":
      "La piattaforma per trovare il lavoro dei tuoi sogni nel mondo IT",
    "home.register_free": "Registrati Gratis",
    "home.login": "Accedi",
    "home.opportunities_title": "Opportunità Esclusive",
    "home.opportunities_desc":
      "Accedi alle migliori offerte di lavoro nel settore tecnologico",
    "home.growth_title": "Crescita Professionale",
    "home.growth_desc":
      "Sviluppa la tua carriera con le aziende più innovative",
    "home.remote_title": "Remote & Flexible",
    "home.remote_desc": "Trova lavori remote e con orari flessibili",
    "home.start_search": "Inizia subito la tua ricerca",
    "home.login_register_desc":
      "Accedi o registrati per scoprire migliaia di opportunità di lavoro nel settore IT",
    "home.network_with_professionals": "Connettiti con altri professionisti",
    "home.find_opportunities": "Trova le migliori opportunità IT",

    // Jobs page
    "jobs.title": "Annunci di Lavoro",
    "jobs.search_placeholder": "Cerca per titolo, azienda, skills...",
    "jobs.search_label": "Cerca annunci",
    "jobs.published_label": "Pubblicato",
    "jobs.seniority_label": "Seniority",
    "jobs.work_type_label": "Tipo di lavoro",
    "jobs.mode_label": "Modalità",
    "jobs.search_btn": "Cerca",
    "jobs.all_dates": "Tutte le date",
    "jobs.today": "Oggi",
    "jobs.week": "Ultima settimana",
    "jobs.month": "Ultimo mese",
    "jobs.3months": "Ultimi 3 mesi",
    "jobs.all_levels": "Tutti i livelli",
    "jobs.junior": "Junior",
    "jobs.mid": "Mid-level",
    "jobs.senior": "Senior",
    "jobs.all_types": "Tutti i tipi",
    "jobs.full_time": "Full-time",
    "jobs.part_time": "Part-time",
    "jobs.contract": "Contract",
    "jobs.all_modes": "Tutte le modalità",
    "jobs.remote": "Remote",
    "jobs.office": "In sede",
    "jobs.personalized_feed": "🎯 Feed Personalizzato",
    "jobs.all_jobs": "📋 Tutti gli Annunci",
    "jobs.apply": "Candidati",
    "jobs.loading": "Caricamento annunci...",
    "jobs.no_jobs": "Nessun annuncio trovato",
    "jobs.scroll_more": "Scorri per caricare altri annunci",
    "jobs.end_results": "Hai visualizzato tutti gli annunci disponibili",
    "jobs.active_filters": "Filtri attivi:",
    "jobs.no_jobs_personalized":
      "Prova a modificare i filtri o torna alla vista generale",
    "jobs.no_jobs_general": "Non ci sono annunci disponibili al momento",
    "jobs.skills_based_on": "Basato sulle tue skills:",
    "jobs.register_msg":
      "e completa il tuo profilo per vedere annunci personalizzati basati sulle tue competenze!",
    "jobs.complete_profile_msg":
      "per ricevere annunci personalizzati basati sulle tue competenze!",

    // Job card
    "job.skills_required": "Skills richieste",
    "job.salary": "Retribuzione",
    "job.location": "Località",
    "job.seniority": "Seniority",
    "job.availability": "Disponibilità",
    "job.trust_score": "trust",
    "job.remote_badge": "Remote",
    "job.today": "Oggi",
    "job.yesterday": "Ieri",
    "job.days_ago": "{days} giorni fa",
    "job.apply": "Candidati",

    // Comments
    "comments.title": "Commenti",
    "comments.placeholder": "Scrivi un commento...",
    "comments.submit": "Commenta",
    "comments.submitting": "Invio...",
    "comments.login_to_comment": "per commentare questo annuncio",
    "comments.no_comments": "Nessun commento ancora",
    "comments.be_first": "Sii il primo a commentare!",
    "comments.anonymous_user": "Utente Anonimo",
    "comments.time_now": "Ora",
    "comments.time_minutes": "{minutes}m fa",
    "comments.time_hours": "{hours}h fa",
    "comments.time_days": "{days}g fa",

    // Authentication
    "auth.login_title": "Accedi al tuo account",
    "auth.register_title": "Crea il tuo account",
    "auth.email": "Indirizzo email",
    "auth.password": "Password",
    "auth.confirm_password": "Conferma password",
    "auth.name": "Nome completo",
    "auth.login_btn": "Accedi",
    "auth.register_btn": "Registrati",
    "auth.logging_in": "Accesso in corso...",
    "auth.registering": "Registrazione in corso...",
    "auth.or_continue": "Oppure continua con",
    "auth.or_register": "Oppure registrati con",
    "auth.have_account": "accedi se hai già un account",
    "auth.need_account": "registrati per un nuovo account",
    "auth.login_to_interact": "per mettere like e commentare",

    // Profile & Wizard
    "profile.title": "Il tuo Profilo",
    "profile.complete_profile": "Completa il tuo profilo",
    "profile.edit_profile": "Modifica Profilo",
    "profile.completed": "Profilo completato",
    "profile.languages_title": "Lingue parlate",
    "profile.skills_title": "Competenze tecniche",
    "profile.seniority_title": "Livello di seniority",
    "profile.availability_title": "Disponibilità",
    "profile.personal_info": "Informazioni Personali",
    "profile.avatar_title": "Avatar",
    "profile.change_avatar": "Cambia Avatar",
    "profile.name_label": "Nome completo",
    "profile.email_label": "Email",
    "profile.phone_label": "Telefono",
    "profile.location_label": "Località",
    "profile.birth_date_label": "Data di nascita",
    "profile.bio_label": "Bio",
    "profile.save_changes": "Salva Modifiche",
    "profile.cancel": "Annulla",
    "profile.complete_desc":
      "Aggiungi le tue competenze e preferenze per trovare le migliori opportunità di lavoro",
    "profile.occupied": "Attualmente occupato",
    "profile.professional_info": "Informazioni Professionali",

    // Wizard
    "wizard.step_of": "Step {current} di {total}",
    "wizard.languages_step": "Lingue parlate",
    "wizard.languages_desc": "Seleziona le lingue che parli fluentemente",
    "wizard.languages_placeholder": "Aggiungi una lingua...",
    "wizard.skills_step": "Skills tecniche",
    "wizard.skills_desc": "Aggiungi le tue competenze tecniche principali",
    "wizard.skills_placeholder": "Aggiungi una skill...",
    "wizard.seniority_step": "Livello di seniority",
    "wizard.seniority_desc": "Seleziona il tuo livello di esperienza",
    "wizard.junior_label": "Junior",
    "wizard.junior_desc": "0-2 anni di esperienza",
    "wizard.mid_label": "Mid-level",
    "wizard.mid_desc": "2-5 anni di esperienza",
    "wizard.senior_label": "Senior",
    "wizard.senior_desc": "5+ anni di esperienza",
    "wizard.availability_step": "Disponibilità",
    "wizard.availability_desc": "Indica la tua disponibilità lavorativa",
    "wizard.fulltime_label": "Full-time",
    "wizard.fulltime_desc": "Disponibile per lavoro a tempo pieno",
    "wizard.parttime_label": "Part-time",
    "wizard.parttime_desc": "Disponibile per lavoro part-time",
    "wizard.occupied_label": "Attualmente occupato",
    "wizard.occupied_desc": "In cerca di nuove opportunità",
    "wizard.back": "Indietro",
    "wizard.next": "Avanti",
    "wizard.cancel": "Annulla",
    "wizard.complete": "Completa",

    // Languages
    "lang.italian": "Italiano",
    "lang.english": "Inglese",
    "lang.french": "Francese",
    "lang.spanish": "Spagnolo",
    "lang.german": "Tedesco",
    "lang.portuguese": "Portoghese",
    "lang.russian": "Russo",
    "lang.chinese": "Cinese",
    "lang.japanese": "Giapponese",
    "lang.arabic": "Arabo",
    "lang.dutch": "Olandese",
    "lang.swedish": "Svedese",

    // Common
    "common.or": "O",
    "common.and": "e",
    "common.login": "Accedi",
    "common.register": "Registrati",

    // Page titles and meta descriptions
    "meta.login_title": "Login - ITJobHub",
    "meta.login_description": "Accedi al tuo account ITJobHub",
    "meta.register_title": "Registrati - ITJobHub",
    "meta.register_description": "Crea il tuo account ITJobHub",
    "meta.index_title": "ITJobHub - Trova il tuo lavoro ideale nel mondo IT",
    "meta.index_description":
      "La piattaforma per trovare il lavoro dei tuoi sogni nel mondo IT. Opportunità esclusive, crescita professionale e lavori remote.",
    "meta.jobs_title": "Annunci di Lavoro - ITJobHub",
    "meta.jobs_description":
      "Scopri le migliori opportunità di lavoro nel settore IT. Annunci personalizzati, like, commenti e molto altro.",
    "meta.profile_title": "Profilo - ITJobHub",
    "meta.profile_description": "Il tuo profilo ITJobHub",
    "meta.wizard_title": "Completa il tuo profilo - ITJobHub",
    "meta.wizard_description":
      "Completa il tuo profilo professionale su ITJobHub",

    // Success messages
    "auth.login_success":
      "Hai effettuato l'accesso con successo. Inizia a esplorare le opportunità di lavoro!",

    // Error messages
    "auth.register_error": "Errore durante la registrazione",
    "auth.password_mismatch": "Le password non corrispondono",
    "auth.password_min_length": "La password deve essere di almeno 6 caratteri",
  },

  en: {
    // Navigation
    "nav.brand": "ITJobHub",
    "nav.jobs": "Jobs",
    "nav.profile": "Profile",
    "nav.login": "Login",
    "nav.register": "Sign Up",
    "nav.logout": "Logout",
    "nav.hello": "Hi",

    // Homepage
    "home.title": "Welcome to ITJobHub",
    "home.subtitle": "The platform to find your dream job in the IT world",
    "home.register_free": "Sign Up Free",
    "home.login": "Login",
    "home.opportunities_title": "Exclusive Opportunities",
    "home.opportunities_desc":
      "Access the best job offers in the technology sector",
    "home.growth_title": "Professional Growth",
    "home.growth_desc":
      "Develop your career with the most innovative companies",
    "home.remote_title": "Remote & Flexible",
    "home.remote_desc": "Find remote jobs with flexible schedules",
    "home.start_search": "Start your job search now",
    "home.login_register_desc":
      "Login or register to discover thousands of job opportunities in the IT sector",
    "home.network_with_professionals": "Connect with other professionals",
    "home.find_opportunities": "Find the best IT opportunities",

    // Jobs page
    "jobs.title": "Job Listings",
    "jobs.search_placeholder": "Search by title, company, skills...",
    "jobs.search_label": "Search jobs",
    "jobs.published_label": "Published",
    "jobs.seniority_label": "Seniority",
    "jobs.work_type_label": "Work type",
    "jobs.mode_label": "Mode",
    "jobs.search_btn": "Search",
    "jobs.all_dates": "All dates",
    "jobs.today": "Today",
    "jobs.week": "Last week",
    "jobs.month": "Last month",
    "jobs.3months": "Last 3 months",
    "jobs.all_levels": "All levels",
    "jobs.junior": "Junior",
    "jobs.mid": "Mid-level",
    "jobs.senior": "Senior",
    "jobs.all_types": "All types",
    "jobs.full_time": "Full-time",
    "jobs.part_time": "Part-time",
    "jobs.contract": "Contract",
    "jobs.all_modes": "All modes",
    "jobs.remote": "Remote",
    "jobs.office": "On-site",
    "jobs.personalized_feed": "🎯 Personalized Feed",
    "jobs.all_jobs": "📋 All Jobs",
    "jobs.apply": "Apply",
    "jobs.loading": "Loading jobs...",
    "jobs.no_jobs": "No jobs found",
    "jobs.scroll_more": "Scroll to load more jobs",
    "jobs.end_results": "You have viewed all available jobs",
    "jobs.active_filters": "Active filters:",
    "jobs.no_jobs_personalized":
      "Try modifying the filters or return to the general view",
    "jobs.no_jobs_general": "No jobs available at the moment",
    "jobs.skills_based_on": "Based on your skills:",
    "jobs.register_msg":
      "and complete your profile to see personalized job listings based on your skills!",
    "jobs.complete_profile_msg":
      "to receive personalized job listings based on your skills!",

    // Job card
    "job.skills_required": "Required Skills",
    "job.salary": "Salary",
    "job.location": "Location",
    "job.seniority": "Seniority",
    "job.availability": "Availability",
    "job.trust_score": "trust",
    "job.remote_badge": "Remote",
    "job.today": "Today",
    "job.yesterday": "Yesterday",
    "job.days_ago": "{days} days ago",
    "job.apply": "Apply",

    // Comments
    "comments.title": "Comments",
    "comments.placeholder": "Write a comment...",
    "comments.submit": "Comment",
    "comments.submitting": "Posting...",
    "comments.login_to_comment": "to comment on this listing",
    "comments.no_comments": "No comments yet",
    "comments.be_first": "Be the first to comment!",
    "comments.anonymous_user": "Anonymous User",
    "comments.time_now": "Now",
    "comments.time_minutes": "{minutes}m ago",
    "comments.time_hours": "{hours}h ago",
    "comments.time_days": "{days}d ago",

    // Authentication
    "auth.login_title": "Sign in to your account",
    "auth.register_title": "Create your account",
    "auth.email": "Email address",
    "auth.password": "Password",
    "auth.confirm_password": "Confirm password",
    "auth.name": "Full name",
    "auth.login_btn": "Sign In",
    "auth.register_btn": "Sign Up",
    "auth.logging_in": "Signing in...",
    "auth.registering": "Signing up...",
    "auth.or_continue": "Or continue with",
    "auth.or_register": "Or sign up with",
    "auth.have_account": "sign in if you already have an account",
    "auth.need_account": "sign up for a new account",
    "auth.login_to_interact": "to like and comment",

    // Profile & Wizard
    "profile.title": "Your Profile",
    "profile.complete_profile": "Complete your profile",
    "profile.edit_profile": "Edit Profile",
    "profile.completed": "Profile completed",
    "profile.languages_title": "Languages spoken",
    "profile.skills_title": "Technical skills",
    "profile.seniority_title": "Seniority level",
    "profile.availability_title": "Availability",
    "profile.personal_info": "Personal Information",
    "profile.avatar_title": "Avatar",
    "profile.change_avatar": "Change Avatar",
    "profile.name_label": "Full name",
    "profile.email_label": "Email",
    "profile.phone_label": "Phone",
    "profile.location_label": "Location",
    "profile.birth_date_label": "Birth date",
    "profile.bio_label": "Bio",
    "profile.save_changes": "Save Changes",
    "profile.cancel": "Cancel",
    "profile.complete_desc":
      "Add your skills and preferences to find the best job opportunities",
    "profile.occupied": "Currently employed",
    "profile.professional_info": "Professional Information",

    // Wizard
    "wizard.step_of": "Step {current} of {total}",
    "wizard.languages_step": "Languages spoken",
    "wizard.languages_desc": "Select the languages you speak fluently",
    "wizard.languages_placeholder": "Add a language...",
    "wizard.skills_step": "Technical skills",
    "wizard.skills_desc": "Add your main technical competencies",
    "wizard.skills_placeholder": "Add a skill...",
    "wizard.seniority_step": "Seniority level",
    "wizard.seniority_desc": "Select your experience level",
    "wizard.junior_label": "Junior",
    "wizard.junior_desc": "0-2 years of experience",
    "wizard.mid_label": "Mid-level",
    "wizard.mid_desc": "2-5 years of experience",
    "wizard.senior_label": "Senior",
    "wizard.senior_desc": "5+ years of experience",
    "wizard.availability_step": "Availability",
    "wizard.availability_desc": "Indicate your work availability",
    "wizard.fulltime_label": "Full-time",
    "wizard.fulltime_desc": "Available for full-time work",
    "wizard.parttime_label": "Part-time",
    "wizard.parttime_desc": "Available for part-time work",
    "wizard.occupied_label": "Currently employed",
    "wizard.occupied_desc": "Looking for new opportunities",
    "wizard.back": "Back",
    "wizard.next": "Next",
    "wizard.cancel": "Cancel",
    "wizard.complete": "Complete",

    // Languages
    "lang.italian": "Italian",
    "lang.english": "English",
    "lang.french": "French",
    "lang.spanish": "Spanish",
    "lang.german": "German",
    "lang.portuguese": "Portuguese",
    "lang.russian": "Russian",
    "lang.chinese": "Chinese",
    "lang.japanese": "Japanese",
    "lang.arabic": "Arabic",
    "lang.dutch": "Dutch",
    "lang.swedish": "Swedish",

    // Common
    "common.or": "Or",
    "common.and": "and",
    "common.login": "Login",
    "common.register": "Sign Up",

    // Page titles and meta descriptions
    "meta.login_title": "Login - ITJobHub",
    "meta.login_description": "Sign in to your ITJobHub account",
    "meta.register_title": "Sign Up - ITJobHub",
    "meta.register_description": "Create your ITJobHub account",
    "meta.index_title": "ITJobHub - Find your ideal IT job",
    "meta.index_description":
      "The platform to find your dream job in the IT world. Exclusive opportunities, professional growth and remote jobs.",
    "meta.jobs_title": "Job Listings - ITJobHub",
    "meta.jobs_description":
      "Discover the best IT job opportunities. Personalized listings, likes, comments and much more.",
    "meta.profile_title": "Profile - ITJobHub",
    "meta.profile_description": "Your ITJobHub profile",
    "meta.wizard_title": "Complete your profile - ITJobHub",
    "meta.wizard_description": "Complete your professional profile on ITJobHub",

    // Success messages
    "auth.login_success":
      "You have successfully logged in. Start exploring job opportunities!",

    // Error messages
    "auth.register_error": "Error during registration",
    "auth.password_mismatch": "Passwords do not match",
    "auth.password_min_length": "Password must be at least 6 characters",
  },

  es: {
    // Navigation
    "nav.brand": "ITJobHub",
    "nav.jobs": "Ofertas",
    "nav.profile": "Perfil",
    "nav.login": "Iniciar Sesión",
    "nav.register": "Registrarse",
    "nav.logout": "Cerrar Sesión",
    "nav.hello": "Hola",

    // Homepage
    "home.title": "Bienvenido a ITJobHub",
    "home.subtitle":
      "La plataforma para encontrar el trabajo de tus sueños en el mundo IT",
    "home.register_free": "Regístrate Gratis",
    "home.login": "Iniciar Sesión",
    "home.opportunities_title": "Oportunidades Exclusivas",
    "home.opportunities_desc":
      "Accede a las mejores ofertas de trabajo en el sector tecnológico",
    "home.growth_title": "Crecimiento Profesional",
    "home.growth_desc":
      "Desarrolla tu carrera con las empresas más innovadoras",
    "home.remote_title": "Remoto y Flexible",
    "home.remote_desc": "Encuentra trabajos remotos y con horarios flexibles",

    // Jobs page
    "jobs.title": "Ofertas de Trabajo",
    "jobs.search_placeholder": "Buscar por título, empresa, habilidades...",
    "jobs.search_label": "Buscar ofertas",
    "jobs.published_label": "Publicado",
    "jobs.seniority_label": "Experiencia",
    "jobs.work_type_label": "Tipo de trabajo",
    "jobs.mode_label": "Modalidad",
    "jobs.search_btn": "Buscar",
    "jobs.all_dates": "Todas las fechas",
    "jobs.today": "Hoy",
    "jobs.week": "Última semana",
    "jobs.month": "Último mes",
    "jobs.3months": "Últimos 3 meses",
    "jobs.all_levels": "Todos los niveles",
    "jobs.junior": "Junior",
    "jobs.mid": "Intermedio",
    "jobs.senior": "Senior",
    "jobs.all_types": "Todos los tipos",
    "jobs.full_time": "Tiempo completo",
    "jobs.part_time": "Tiempo parcial",
    "jobs.contract": "Contrato",
    "jobs.all_modes": "Todas las modalidades",
    "jobs.remote": "Remoto",
    "jobs.office": "Presencial",
    "jobs.personalized_feed": "🎯 Feed Personalizado",
    "jobs.all_jobs": "📋 Todas las Ofertas",
    "jobs.apply": "Postular",
    "jobs.loading": "Cargando ofertas...",
    "jobs.no_jobs": "No se encontraron ofertas",
    "jobs.scroll_more": "Desliza para cargar más ofertas",
    "jobs.end_results": "Has visto todas las ofertas disponibles",
    "jobs.active_filters": "Filtros activos:",
    "jobs.no_jobs_personalized":
      "Intenta modificar los filtros o vuelve a la vista general",
    "jobs.no_jobs_general": "No hay ofertas disponibles en este momento",
    "jobs.skills_based_on": "Basado en tus habilidades:",
    "jobs.register_msg":
      "y completa tu perfil para ver ofertas personalizadas basadas en tus habilidades!",
    "jobs.complete_profile_msg":
      "para recibir ofertas personalizadas basadas en tus habilidades!",

    // Job card
    "job.skills_required": "Habilidades requeridas",
    "job.salary": "Salario",
    "job.location": "Ubicación",
    "job.seniority": "Experiencia",
    "job.availability": "Disponibilidad",
    "job.trust_score": "confianza",
    "job.remote_badge": "Remoto",
    "job.today": "Hoy",
    "job.yesterday": "Ayer",
    "job.days_ago": "Hace {days} días",
    "job.apply": "Postular",

    // Homepage
    "home.start_search": "Comienza tu búsqueda ahora",
    "home.login_register_desc":
      "Inicia sesión o regístrate para descubrir miles de oportunidades laborales en el sector IT",
    "home.network_with_professionals": "Conéctate con otros profesionales",

    // Authentication
    "auth.login_title": "Inicia sesión en tu cuenta",
    "auth.register_title": "Crea tu cuenta",
    "auth.email": "Dirección de email",
    "auth.password": "Contraseña",
    "auth.confirm_password": "Confirmar contraseña",
    "auth.name": "Nombre completo",
    "auth.login_btn": "Iniciar Sesión",
    "auth.register_btn": "Registrarse",
    "auth.logging_in": "Iniciando sesión...",
    "auth.registering": "Registrándose...",
    "auth.or_continue": "O continúa con",
    "auth.or_register": "O regístrate con",
    "auth.have_account": "inicia sesión si ya tienes una cuenta",
    "auth.need_account": "regístrate para una nueva cuenta",
    "auth.login_to_interact": "para dar me gusta y comentar",

    // Common
    "common.or": "O",
    "common.and": "y",
    "common.login": "Iniciar Sesión",
    "common.register": "Registrarse",

    // Page titles and meta descriptions
    "meta.login_title": "Iniciar Sesión - ITJobHub",
    "meta.login_description": "Inicia sesión en tu cuenta de ITJobHub",
    "meta.register_title": "Registrarse - ITJobHub",
    "meta.register_description": "Crea tu cuenta de ITJobHub",
    "meta.index_title": "ITJobHub - Encuentra tu trabajo ideal en IT",
    "meta.index_description":
      "La plataforma para encontrar el trabajo de tus sueños en el mundo IT. Oportunidades exclusivas, crecimiento profesional y trabajos remotos.",
    "meta.jobs_title": "Ofertas de Trabajo - ITJobHub",
    "meta.jobs_description":
      "Descubre las mejores oportunidades de trabajo en IT. Ofertas personalizadas, me gusta, comentarios y mucho más.",
    "meta.profile_title": "Perfil - ITJobHub",
    "meta.profile_description": "Tu perfil de ITJobHub",
    "meta.wizard_title": "Completa tu perfil - ITJobHub",
    "meta.wizard_description": "Completa tu perfil profesional en ITJobHub",

    // Success messages
    "auth.login_success":
      "¡Has iniciado sesión exitosamente. ¡Comienza a explorar oportunidades de trabajo!",

    // Error messages
    "auth.register_error": "Error durante el registro",
    "auth.password_mismatch": "Las contraseñas no coinciden",
    "auth.password_min_length":
      "La contraseña debe tener al menos 6 caracteres",

    // Profile & Wizard
    "profile.title": "Tu Perfil",
    "profile.complete_profile": "Completa tu perfil",
    "profile.edit_profile": "Editar Perfil",
    "profile.completed": "Perfil completado",
    "profile.languages_title": "Idiomas hablados",
    "profile.skills_title": "Habilidades técnicas",
    "profile.seniority_title": "Nivel de experiencia",
    "profile.availability_title": "Disponibilidad",
    "profile.personal_info": "Información Personal",
    "profile.avatar_title": "Avatar",
    "profile.change_avatar": "Cambiar Avatar",
    "profile.name_label": "Nombre completo",
    "profile.email_label": "Email",
    "profile.phone_label": "Teléfono",
    "profile.location_label": "Ubicación",
    "profile.birth_date_label": "Fecha de nacimiento",
    "profile.bio_label": "Biografía",
    "profile.save_changes": "Guardar Cambios",
    "profile.cancel": "Cancelar",
    "profile.complete_desc":
      "Añade tus habilidades y preferencias para encontrar las mejores oportunidades de trabajo",
    "profile.occupied": "Actualmente empleado",
    "profile.professional_info": "Información Profesional",

    // Wizard
    "wizard.step_of": "Paso {current} de {total}",
    "wizard.languages_step": "Idiomas hablados",
    "wizard.languages_desc": "Selecciona los idiomas que hablas con fluidez",
    "wizard.languages_placeholder": "Añadir un idioma...",
    "wizard.skills_step": "Habilidades técnicas",
    "wizard.skills_desc": "Añade tus principales competencias técnicas",
    "wizard.skills_placeholder": "Añadir una habilidad...",
    "wizard.seniority_step": "Nivel de experiencia",
    "wizard.seniority_desc": "Selecciona tu nivel de experiencia",
    "wizard.junior_label": "Junior",
    "wizard.junior_desc": "0-2 años de experiencia",
    "wizard.mid_label": "Intermedio",
    "wizard.mid_desc": "2-5 años de experiencia",
    "wizard.senior_label": "Senior",
    "wizard.senior_desc": "5+ años de experiencia",
    "wizard.availability_step": "Disponibilidad",
    "wizard.availability_desc": "Indica tu disponibilidad laboral",
    "wizard.fulltime_label": "Tiempo completo",
    "wizard.fulltime_desc": "Disponible para trabajo a tiempo completo",
    "wizard.parttime_label": "Tiempo parcial",
    "wizard.parttime_desc": "Disponible para trabajo a tiempo parcial",
    "wizard.occupied_label": "Actualmente empleado",
    "wizard.occupied_desc": "Buscando nuevas oportunidades",
    "wizard.back": "Atrás",
    "wizard.next": "Siguiente",
    "wizard.cancel": "Cancelar",
    "wizard.complete": "Completar",
  },

  de: {
    // Navigation
    "nav.brand": "ITJobHub",
    "nav.jobs": "Stellenanzeigen",
    "nav.profile": "Profil",
    "nav.login": "Anmelden",
    "nav.register": "Registrieren",
    "nav.logout": "Abmelden",
    "nav.hello": "Hallo",

    // Homepage
    "home.title": "Willkommen bei ITJobHub",
    "home.subtitle":
      "Die Plattform, um Ihren Traumjob in der IT-Welt zu finden",
    "home.register_free": "Kostenlos Registrieren",
    "home.login": "Anmelden",
    "home.opportunities_title": "Exklusive Möglichkeiten",
    "home.opportunities_desc":
      "Zugang zu den besten Jobangeboten im Technologiesektor",
    "home.growth_title": "Berufliches Wachstum",
    "home.growth_desc":
      "Entwickeln Sie Ihre Karriere mit den innovativsten Unternehmen",
    "home.remote_title": "Remote & Flexibel",
    "home.remote_desc": "Finden Sie Remote-Jobs mit flexiblen Arbeitszeiten",

    // Jobs page
    "jobs.title": "Stellenanzeigen",
    "jobs.search_placeholder": "Nach Titel, Unternehmen, Skills suchen...",
    "jobs.search_label": "Jobs suchen",
    "jobs.published_label": "Veröffentlicht",
    "jobs.seniority_label": "Erfahrung",
    "jobs.work_type_label": "Arbeitstyp",
    "jobs.mode_label": "Modus",
    "jobs.search_btn": "Suchen",
    "jobs.all_dates": "Alle Daten",
    "jobs.today": "Heute",
    "jobs.week": "Letzte Woche",
    "jobs.month": "Letzter Monat",
    "jobs.3months": "Letzte 3 Monate",
    "jobs.all_levels": "Alle Level",
    "jobs.junior": "Junior",
    "jobs.mid": "Mittlere Erfahrung",
    "jobs.senior": "Senior",
    "jobs.all_types": "Alle Typen",
    "jobs.full_time": "Vollzeit",
    "jobs.part_time": "Teilzeit",
    "jobs.contract": "Vertrag",
    "jobs.all_modes": "Alle Modi",
    "jobs.remote": "Remote",
    "jobs.office": "Vor Ort",
    "jobs.personalized_feed": "🎯 Personalisierter Feed",
    "jobs.all_jobs": "📋 Alle Jobs",
    "jobs.apply": "Bewerben",
    "jobs.loading": "Jobs werden geladen...",
    "jobs.no_jobs": "Keine Jobs gefunden",
    "jobs.scroll_more": "Scrollen für weitere Jobs",
    "jobs.end_results": "Sie haben alle verfügbaren Jobs angesehen",
    "jobs.active_filters": "Aktive Filter:",
    "jobs.no_jobs_personalized":
      "Versuchen Sie, die Filter zu ändern oder zur allgemeinen Ansicht zurückzukehren",
    "jobs.no_jobs_general": "Im Moment sind keine Jobs verfügbar",
    "jobs.skills_based_on": "Basierend auf Ihren Fähigkeiten:",
    "jobs.register_msg":
      "und vervollständigen Sie Ihr Profil, um personalisierte Stellenanzeigen basierend auf Ihren Fähigkeiten zu sehen!",
    "jobs.complete_profile_msg":
      "um personalisierte Stellenanzeigen basierend auf Ihren Fähigkeiten zu erhalten!",

    // Job card
    "job.skills_required": "Erforderliche Fähigkeiten",
    "job.salary": "Gehalt",
    "job.location": "Standort",
    "job.seniority": "Erfahrung",
    "job.availability": "Verfügbarkeit",
    "job.trust_score": "Vertrauen",
    "job.remote_badge": "Remote",
    "job.today": "Heute",
    "job.yesterday": "Gestern",
    "job.days_ago": "Vor {days} Tagen",
    "job.apply": "Bewerben",

    // Homepage
    "home.start_search": "Starten Sie jetzt Ihre Jobsuche",
    "home.login_register_desc":
      "Melden Sie sich an oder registrieren Sie sich, um Tausende von Jobangeboten im IT-Sektor zu entdecken",
    "home.network_with_professionals":
      "Vernetzen Sie sich mit anderen Fachleuten",

    // Authentication
    "auth.login_title": "Melden Sie sich bei Ihrem Konto an",
    "auth.register_title": "Erstellen Sie Ihr Konto",
    "auth.email": "E-Mail-Adresse",
    "auth.password": "Passwort",
    "auth.confirm_password": "Passwort bestätigen",
    "auth.name": "Vollständiger Name",
    "auth.login_btn": "Anmelden",
    "auth.register_btn": "Registrieren",
    "auth.logging_in": "Anmelden...",
    "auth.registering": "Registrierung...",
    "auth.or_continue": "Oder weiter mit",
    "auth.or_register": "Oder registrieren mit",
    "auth.have_account": "melden Sie sich an, wenn Sie bereits ein Konto haben",
    "auth.need_account": "registrieren Sie sich für ein neues Konto",
    "auth.login_to_interact": "um zu liken und zu kommentieren",

    // Common
    "common.or": "Oder",
    "common.and": "und",
    "common.login": "Anmelden",
    "common.register": "Registrieren",

    // Page titles and meta descriptions
    "meta.login_title": "Anmelden - ITJobHub",
    "meta.login_description": "Melden Sie sich bei Ihrem ITJobHub-Konto an",
    "meta.register_title": "Registrieren - ITJobHub",
    "meta.register_description": "Erstellen Sie Ihr ITJobHub-Konto",
    "meta.index_title": "ITJobHub - Finden Sie Ihren idealen IT-Job",
    "meta.index_description":
      "Die Plattform, um Ihren Traumjob in der IT-Welt zu finden. Exklusive Möglichkeiten, berufliches Wachstum und Remote-Jobs.",
    "meta.jobs_title": "Stellenanzeigen - ITJobHub",
    "meta.jobs_description":
      "Entdecken Sie die besten IT-Arbeitsmöglichkeiten. Personalisierte Anzeigen, Likes, Kommentare und vieles mehr.",
    "meta.profile_title": "Profil - ITJobHub",
    "meta.profile_description": "Ihr ITJobHub-Profil",
    "meta.wizard_title": "Vervollständigen Sie Ihr Profil - ITJobHub",
    "meta.wizard_description":
      "Vervollständigen Sie Ihr berufliches Profil auf ITJobHub",

    // Success messages
    "auth.login_success":
      "Sie haben sich erfolgreich angemeldet. Beginnen Sie mit der Erkundung von Arbeitsmöglichkeiten!",

    // Error messages
    "auth.register_error": "Fehler bei der Registrierung",
    "auth.password_mismatch": "Passwörter stimmen nicht überein",
    "auth.password_min_length":
      "Das Passwort muss mindestens 6 Zeichen lang sein",

    // Profile & Wizard
    "profile.title": "Ihr Profil",
    "profile.complete_profile": "Profil vervollständigen",
    "profile.edit_profile": "Profil bearbeiten",
    "profile.completed": "Profil vollständig",
    "profile.languages_title": "Gesprochene Sprachen",
    "profile.skills_title": "Technische Fähigkeiten",
    "profile.seniority_title": "Erfahrungslevel",
    "profile.availability_title": "Verfügbarkeit",
    "profile.personal_info": "Persönliche Informationen",
    "profile.avatar_title": "Avatar",
    "profile.change_avatar": "Avatar ändern",
    "profile.name_label": "Vollständiger Name",
    "profile.email_label": "E-Mail",
    "profile.phone_label": "Telefon",
    "profile.location_label": "Standort",
    "profile.birth_date_label": "Geburtsdatum",
    "profile.bio_label": "Biografie",
    "profile.save_changes": "Änderungen speichern",
    "profile.cancel": "Abbrechen",
    "profile.complete_desc":
      "Fügen Sie Ihre Fähigkeiten und Präferenzen hinzu, um die besten Arbeitsmöglichkeiten zu finden",
    "profile.occupied": "Derzeit beschäftigt",
    "profile.professional_info": "Berufliche Informationen",

    // Wizard
    "wizard.step_of": "Schritt {current} von {total}",
    "wizard.languages_step": "Gesprochene Sprachen",
    "wizard.languages_desc": "Wählen Sie die Sprachen aus, die Sie fließend sprechen",
    "wizard.languages_placeholder": "Sprache hinzufügen...",
    "wizard.skills_step": "Technische Fähigkeiten",
    "wizard.skills_desc": "Fügen Sie Ihre wichtigsten technischen Kompetenzen hinzu",
    "wizard.skills_placeholder": "Fähigkeit hinzufügen...",
    "wizard.seniority_step": "Erfahrungslevel",
    "wizard.seniority_desc": "Wählen Sie Ihr Erfahrungslevel aus",
    "wizard.junior_label": "Junior",
    "wizard.junior_desc": "0-2 Jahre Erfahrung",
    "wizard.mid_label": "Mittlere Erfahrung",
    "wizard.mid_desc": "2-5 Jahre Erfahrung",
    "wizard.senior_label": "Senior",
    "wizard.senior_desc": "5+ Jahre Erfahrung",
    "wizard.availability_step": "Verfügbarkeit",
    "wizard.availability_desc": "Geben Sie Ihre Arbeitsverfügbarkeit an",
    "wizard.fulltime_label": "Vollzeit",
    "wizard.fulltime_desc": "Verfügbar für Vollzeitarbeit",
    "wizard.parttime_label": "Teilzeit",
    "wizard.parttime_desc": "Verfügbar für Teilzeitarbeit",
    "wizard.occupied_label": "Derzeit beschäftigt",
    "wizard.occupied_desc": "Auf der Suche nach neuen Möglichkeiten",
    "wizard.back": "Zurück",
    "wizard.next": "Weiter",
    "wizard.cancel": "Abbrechen",
    "wizard.complete": "Abschließen",
  },

  fr: {
    // Navigation
    "nav.brand": "ITJobHub",
    "nav.jobs": "Offres",
    "nav.profile": "Profil",
    "nav.login": "Se connecter",
    "nav.register": "S'inscrire",
    "nav.logout": "Se déconnecter",
    "nav.hello": "Salut",

    // Homepage
    "home.title": "Bienvenue sur ITJobHub",
    "home.subtitle":
      "La plateforme pour trouver l'emploi de vos rêves dans le monde IT",
    "home.register_free": "Inscription Gratuite",
    "home.login": "Se connecter",
    "home.opportunities_title": "Opportunités Exclusives",
    "home.opportunities_desc":
      "Accédez aux meilleures offres d'emploi dans le secteur technologique",
    "home.growth_title": "Croissance Professionnelle",
    "home.growth_desc":
      "Développez votre carrière avec les entreprises les plus innovantes",
    "home.remote_title": "Remote & Flexible",
    "home.remote_desc":
      "Trouvez des emplois à distance avec des horaires flexibles",

    // Jobs page
    "jobs.title": "Offres d'Emploi",
    "jobs.search_placeholder":
      "Rechercher par titre, entreprise, compétences...",
    "jobs.search_label": "Rechercher des offres",
    "jobs.published_label": "Publié",
    "jobs.seniority_label": "Expérience",
    "jobs.work_type_label": "Type de travail",
    "jobs.mode_label": "Mode",
    "jobs.search_btn": "Rechercher",
    "jobs.all_dates": "Toutes les dates",
    "jobs.today": "Aujourd'hui",
    "jobs.week": "Semaine dernière",
    "jobs.month": "Mois dernier",
    "jobs.3months": "3 derniers mois",
    "jobs.all_levels": "Tous les niveaux",
    "jobs.junior": "Junior",
    "jobs.mid": "Intermédiaire",
    "jobs.senior": "Senior",
    "jobs.all_types": "Tous les types",
    "jobs.full_time": "Temps plein",
    "jobs.part_time": "Temps partiel",
    "jobs.contract": "Contrat",
    "jobs.all_modes": "Tous les modes",
    "jobs.remote": "Remote",
    "jobs.office": "Sur site",
    "jobs.personalized_feed": "🎯 Feed Personnalisé",
    "jobs.all_jobs": "📋 Toutes les Offres",
    "jobs.apply": "Postuler",
    "jobs.loading": "Chargement des offres...",
    "jobs.no_jobs": "Aucune offre trouvée",
    "jobs.scroll_more": "Faites défiler pour charger plus d'offres",
    "jobs.end_results": "Vous avez vu toutes les offres disponibles",
    "jobs.active_filters": "Filtres actifs:",
    "jobs.no_jobs_personalized":
      "Essayez de modifier les filtres ou revenez à la vue générale",
    "jobs.no_jobs_general": "Aucune offre disponible pour le moment",
    "jobs.skills_based_on": "Basé sur vos compétences:",
    "jobs.register_msg":
      "et complétez votre profil pour voir des offres personnalisées basées sur vos compétences!",
    "jobs.complete_profile_msg":
      "pour recevoir des offres personnalisées basées sur vos compétences!",

    // Job card
    "job.skills_required": "Compétences requises",
    "job.salary": "Salaire",
    "job.location": "Lieu",
    "job.seniority": "Expérience",
    "job.availability": "Disponibilité",
    "job.trust_score": "confiance",
    "job.remote_badge": "Remote",
    "job.today": "Aujourd'hui",
    "job.yesterday": "Hier",
    "job.days_ago": "Il y a {days} jours",
    "job.apply": "Postuler",

    // Comments
    "comments.title": "Commentaires",
    "comments.placeholder": "Écrivez un commentaire...",
    "comments.submit": "Commenter",
    "comments.submitting": "Envoi...",
    "comments.login_to_comment": "pour commenter cette offre",
    "comments.no_comments": "Pas encore de commentaires",
    "comments.be_first": "Soyez le premier à commenter!",

    // Homepage
    "home.start_search": "Commencez votre recherche maintenant",
    "home.login_register_desc":
      "Connectez-vous ou inscrivez-vous pour découvrir des milliers d'opportunités d'emploi dans le secteur IT",
    "home.network_with_professionals":
      "Connectez-vous avec d'autres professionnels",

    // Authentication
    "auth.login_title": "Connectez-vous à votre compte",
    "auth.register_title": "Créez votre compte",
    "auth.email": "Adresse e-mail",
    "auth.password": "Mot de passe",
    "auth.confirm_password": "Confirmer le mot de passe",
    "auth.name": "Nom complet",
    "auth.login_btn": "Se connecter",
    "auth.register_btn": "S'inscrire",
    "auth.logging_in": "Connexion...",
    "auth.registering": "Inscription...",
    "auth.or_continue": "Ou continuer avec",
    "auth.or_register": "Ou s'inscrire avec",
    "auth.have_account": "connectez-vous si vous avez déjà un compte",
    "auth.need_account": "inscrivez-vous pour un nouveau compte",
    "auth.login_to_interact": "pour aimer et commenter",

    // Profile & Wizard
    "profile.title": "Votre Profil",
    "profile.complete_profile": "Complétez votre profil",
    "profile.edit_profile": "Modifier le Profil",
    "profile.completed": "Profil complété",
    "profile.languages_title": "Langues parlées",
    "profile.skills_title": "Compétences techniques",
    "profile.seniority_title": "Niveau d'expérience",
    "profile.availability_title": "Disponibilité",
    "profile.personal_info": "Informations Personnelles",
    "profile.avatar_title": "Avatar",
    "profile.change_avatar": "Changer l'Avatar",
    "profile.name_label": "Nom complet",
    "profile.email_label": "Email",
    "profile.phone_label": "Téléphone",
    "profile.location_label": "Lieu",
    "profile.birth_date_label": "Date de naissance",
    "profile.bio_label": "Bio",
    "profile.save_changes": "Sauvegarder",
    "profile.cancel": "Annuler",
    "profile.complete_desc":
      "Ajoutez vos compétences et préférences pour trouver les meilleures opportunités d'emploi",
    "profile.occupied": "Actuellement employé",
    "profile.professional_info": "Informations Professionnelles",

    // Wizard
    "wizard.step_of": "Étape {current} sur {total}",
    "wizard.languages_step": "Langues parlées",
    "wizard.languages_desc":
      "Sélectionnez les langues que vous parlez couramment",
    "wizard.languages_placeholder": "Ajouter une langue...",
    "wizard.skills_step": "Compétences techniques",
    "wizard.skills_desc": "Ajoutez vos principales compétences techniques",
    "wizard.skills_placeholder": "Ajouter une compétence...",
    "wizard.seniority_step": "Niveau d'expérience",
    "wizard.seniority_desc": "Sélectionnez votre niveau d'expérience",
    "wizard.junior_label": "Junior",
    "wizard.junior_desc": "0-2 ans d'expérience",
    "wizard.mid_label": "Intermédiaire",
    "wizard.mid_desc": "2-5 ans d'expérience",
    "wizard.senior_label": "Senior",
    "wizard.senior_desc": "5+ ans d'expérience",
    "wizard.availability_step": "Disponibilité",
    "wizard.availability_desc": "Indiquez votre disponibilité de travail",
    "wizard.fulltime_label": "Temps plein",
    "wizard.fulltime_desc": "Disponible pour du travail à temps plein",
    "wizard.parttime_label": "Temps partiel",
    "wizard.parttime_desc": "Disponible pour du travail à temps partiel",
    "wizard.occupied_label": "Actuellement employé",
    "wizard.occupied_desc": "À la recherche de nouvelles opportunités",
    "wizard.back": "Retour",
    "wizard.next": "Suivant",
    "wizard.cancel": "Annuler",
    "wizard.complete": "Terminer",

    // Common
    "common.or": "Ou",
    "common.and": "et",
    "common.login": "Se connecter",
    "common.register": "S'inscrire",

    // Page titles and meta descriptions
    "meta.login_title": "Se connecter - ITJobHub",
    "meta.login_description": "Connectez-vous à votre compte ITJobHub",
    "meta.register_title": "S'inscrire - ITJobHub",
    "meta.register_description": "Créez votre compte ITJobHub",
    "meta.index_title": "ITJobHub - Trouvez votre emploi IT idéal",
    "meta.index_description":
      "La plateforme pour trouver l'emploi de vos rêves dans le monde IT. Opportunités exclusives, croissance professionnelle et emplois à distance.",
    "meta.jobs_title": "Offres d'Emploi - ITJobHub",
    "meta.jobs_description":
      "Découvrez les meilleures opportunités d'emploi IT. Offres personnalisées, likes, commentaires et bien plus encore.",
    "meta.profile_title": "Profil - ITJobHub",
    "meta.profile_description": "Votre profil ITJobHub",
    "meta.wizard_title": "Complétez votre profil - ITJobHub",
    "meta.wizard_description":
      "Complétez votre profil professionnel sur ITJobHub",

    // Success messages
    "auth.login_success":
      "Vous vous êtes connecté avec succès. Commencez à explorer les opportunités d'emploi!",

    // Error messages
    "auth.register_error": "Erreur lors de l'inscription",
    "auth.password_mismatch": "Les mots de passe ne correspondent pas",
    "auth.password_min_length":
      "Le mot de passe doit contenir au moins 6 caractères",
  },
};

export const I18nProvider = component$(() => {
  // Create signal for language changes
  const setLanguageSignal = useSignal<SetLanguageRequest | null>(null);

  const i18nState: I18nState = useStore<I18nState>({
    currentLanguage: "it",
    setLanguageSignal,
  });

  // Load saved language preference from localStorage after hydration
  useVisibleTask$(() => {
    const savedLang = localStorage.getItem(
      "preferred-language"
    ) as SupportedLanguage;
    if (
      savedLang &&
      savedLang in translations &&
      savedLang !== i18nState.currentLanguage
    ) {
      console.log("Loading saved language from localStorage:", savedLang);
      i18nState.currentLanguage = savedLang;
    }
  });

  // Handle language change requests
  useTask$(({ track }) => {
    const langReq = track(() => setLanguageSignal.value);
    if (langReq) {
      console.log("Language change request:", langReq);
      i18nState.currentLanguage = langReq.language;
      console.log("Language changed to:", i18nState.currentLanguage);
      // Save to localStorage (will only run client-side)
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("preferred-language", langReq.language);
        console.log("Saved to localStorage:", langReq.language);
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

export const translate = (key: string, language: SupportedLanguage): string => {
  const currentTranslations = translations[language];
  if (!currentTranslations) {
    console.warn(`No translations found for language: ${language}`);
    return key;
  }
  const translation =
    currentTranslations[key as keyof typeof currentTranslations];
  if (!translation) {
    console.warn(`Translation missing for key "${key}" in language "${language}"`);
  }
  return translation || key;
};

export const useTranslate = () => {
  const i18n = useContext(I18nContext);
  return noSerialize((key: string) => translate(key, i18n.currentLanguage)) as (key: string) => string;
};

// Helper function for interpolation
export const interpolate = (
  template: string,
  values: Record<string, string | number>
): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
};
