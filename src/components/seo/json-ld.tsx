import { component$ } from "@builder.io/qwik";

// Base URL for production
const SITE_URL = import.meta.env.PUBLIC_SITE_URL;

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
}

/**
 * Organization JSON-LD schema for the homepage
 */
export const OrganizationSchema = component$<OrganizationSchemaProps>(
  ({
    name = "DevBoards.io",
    url = SITE_URL,
    logo = `${SITE_URL}/favicon.svg`,
  }) => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: name,
      url: url,
      logo: logo,
      sameAs: [],
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={JSON.stringify(schema)}
      />
    );
  },
);

interface WebSiteSchemaProps {
  name?: string;
  url?: string;
  searchUrl?: string;
}

/**
 * WebSite JSON-LD schema with SearchAction
 */
export const WebSiteSchema = component$<WebSiteSchemaProps>(
  ({
    name = "DevBoards.io",
    url = SITE_URL,
    searchUrl = `${SITE_URL}/jobs?q={search_term_string}`,
  }) => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: name,
      url: url,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: searchUrl,
        },
        "query-input": "required name=search_term_string",
      },
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={JSON.stringify(schema)}
      />
    );
  },
);

interface JobPostingSchemaProps {
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType?: string;
  hiringOrganization: {
    name: string;
    sameAs?: string;
    logo?: string;
  };
  jobLocation?: {
    addressLocality?: string;
    addressRegion?: string;
    addressCountry?: string;
  };
  isRemote?: boolean;
  salary?: {
    currency?: string;
    minValue?: number;
    maxValue?: number;
    unitText?: string;
  };
  skills?: string[];
}

/**
 * JobPosting JSON-LD schema for job detail pages
 */
export const JobPostingSchema = component$<JobPostingSchemaProps>((props) => {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: props.title,
    description: props.description,
    datePosted: props.datePosted,
    hiringOrganization: {
      "@type": "Organization",
      name: props.hiringOrganization.name,
      ...(props.hiringOrganization.sameAs && {
        sameAs: props.hiringOrganization.sameAs,
      }),
      ...(props.hiringOrganization.logo && {
        logo: props.hiringOrganization.logo,
      }),
    },
  };

  if (props.validThrough) {
    schema["validThrough"] = props.validThrough;
  }

  if (props.employmentType) {
    // Map to schema.org employment types
    const typeMap: Record<string, string> = {
      "full-time": "FULL_TIME",
      "part-time": "PART_TIME",
      contract: "CONTRACTOR",
      freelance: "CONTRACTOR",
      internship: "INTERN",
    };
    schema["employmentType"] =
      typeMap[props.employmentType.toLowerCase()] || "OTHER";
  }

  if (props.isRemote) {
    schema["jobLocationType"] = "TELECOMMUTE";
  }

  if (props.jobLocation && !props.isRemote) {
    schema["jobLocation"] = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(props.jobLocation.addressLocality && {
          addressLocality: props.jobLocation.addressLocality,
        }),
        ...(props.jobLocation.addressRegion && {
          addressRegion: props.jobLocation.addressRegion,
        }),
        ...(props.jobLocation.addressCountry && {
          addressCountry: props.jobLocation.addressCountry || "IT",
        }),
      },
    };
  }

  if (props.salary && (props.salary.minValue || props.salary.maxValue)) {
    schema["baseSalary"] = {
      "@type": "MonetaryAmount",
      currency: props.salary.currency || "EUR",
      value: {
        "@type": "QuantitativeValue",
        ...(props.salary.minValue && { minValue: props.salary.minValue }),
        ...(props.salary.maxValue && { maxValue: props.salary.maxValue }),
        unitText: props.salary.unitText || "YEAR",
      },
    };
  }

  if (props.skills && props.skills.length > 0) {
    schema["skills"] = props.skills.join(", ");
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={JSON.stringify(schema)}
    />
  );
});

/**
 * BreadcrumbList JSON-LD schema
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export const BreadcrumbSchema = component$<BreadcrumbSchemaProps>(
  ({ items }) => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={JSON.stringify(schema)}
      />
    );
  },
);
