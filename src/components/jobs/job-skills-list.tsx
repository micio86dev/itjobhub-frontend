import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./job-skills-list.css?inline";
import { useTranslate } from "~/contexts/i18n";

interface JobSkillsListProps {
  skills: string[];
}

export const JobSkillsList = component$<JobSkillsListProps>(({ skills }) => {
  useStylesScoped$(styles);
  const t = useTranslate();

  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <div class="skillsSection">
      <h3 class="skillsTitle">{t("job.skills_title")}</h3>
      <div class="skillsList">
        {skills.map((skill) => (
          <span key={skill} class="skillItem">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
});
