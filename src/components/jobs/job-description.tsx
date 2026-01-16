import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./job-description.css?inline";
import { useTranslate } from "~/contexts/i18n";

interface JobDescriptionProps {
    description: string;
}

export const JobDescription = component$<JobDescriptionProps>(({ description }) => {
    useStylesScoped$(styles);
    const t = useTranslate();

    return (
        <div class="descriptionSection">
            <div class="prose prose-indigo max-w-none dark:prose-invert">
                <h3 class="descriptionTitle">
                    <span class="descriptionBar"></span>
                    {t('job.description_title')}
                </h3>
                <div
                    class="descriptionContent"
                    dangerouslySetInnerHTML={description}
                ></div>
            </div>
        </div>
    );
});
