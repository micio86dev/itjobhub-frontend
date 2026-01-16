import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { useTranslate } from "~/contexts/i18n";

interface NotFoundProps {
    title?: string;
    description?: string;
    icon?: string;
    backLink?: string;
    backLinkText?: string;
}

export const NotFound = component$<NotFoundProps>(({
    title,
    description,
    icon = '🔍',
    backLink = '/',
    backLinkText
}) => {
    const t = useTranslate();

    return (
        <div class="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md mx-auto">
            <div class="text-6xl mb-6">{icon}</div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {title || t('common.not_found')}
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-8">
                {description || t('common.not_found_description')}
            </p>
            <Link
                href={backLink}
                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
                {backLinkText || t('common.go_back')}
            </Link>
        </div>
    );
});
