import { component$, useStylesScoped$, type QRL, $ } from "@builder.io/qwik";
import styles from "./job-skills-list.css?inline";
import { useTranslate } from "~/contexts/i18n";

interface JobSkillsListProps {
  skills: string[];
  userSkills?: string[];
  onAddSkill$?: QRL<(skill: string) => Promise<void>>;
}

export const JobSkillsList = component$<JobSkillsListProps>(
  ({ skills, userSkills = [], onAddSkill$ }) => {
    useStylesScoped$(styles);
    const t = useTranslate();

    if (!skills || skills.length === 0) {
      return null;
    }

    return (
      <div class="skillsSection">
        <h3 class="skillsTitle">{t("job.skills_title")}</h3>
        <div class="skillsList">
          {skills.map((skill) => {
            const isMatched = userSkills.includes(skill);
            return (
              <div
                key={skill}
                class={["skillBadge", isMatched ? "matched" : "missing"]}
              >
                <span class="skillText">{skill}</span>
                {isMatched ? (
                  <span class="matchIcon" title={t("profile.completed")}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                ) : (
                  onAddSkill$ && (
                    <button
                      onClick$={$(() => onAddSkill$(skill))}
                      class="addSkillBtn"
                      title={t("job.add_to_profile") || "Aggiungi al profilo"}
                      aria-label={`${t("job.add_to_profile") || "Aggiungi al profilo"} ${skill}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
