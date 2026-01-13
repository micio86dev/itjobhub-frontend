import { component$ } from '@builder.io/qwik';
import { useTranslate, interpolate } from '~/contexts/i18n';

interface MatchFactors {
    skillsMatch: number;
    seniorityMatch: number;
    locationMatch: number;
    trustScore: number;
    timeliness: number;
    competition: number;
    applicationRate: number;
}

interface MatchBreakdownProps {
    score: number;
    factors: MatchFactors;
    details: {
        matchedSkills: string[];
        missingSkills: string[];
        seniorityGap: string;
        locationStatus: string;
    };
}

export const MatchBreakdown = component$<MatchBreakdownProps>(({ score, factors, details }) => {
    const t = useTranslate();

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-green-600 dark:text-green-400';
        if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
        if (score >= 30) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getBgColor = (score: number) => {
        if (score >= 75) return 'bg-green-100 dark:bg-green-900/30';
        if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30';
        if (score >= 30) return 'bg-orange-100 dark:bg-orange-900/30';
        return 'bg-red-100 dark:bg-red-900/30';
    };

    return (
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('match.title')}
            </h3>

            <div class="flex items-center gap-6 mb-8">
                <div class={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${getScoreColor(score)} border-current ${getBgColor(score)}`}>
                    {score}%
                </div>
                <div>
                    <h4 class={`text-lg font-bold ${getScoreColor(score)}`}>
                        {score >= 75 ? t('match.excellent') : score >= 50 ? t('match.good') : score >= 30 ? t('match.fair') : t('match.low')}
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        {t('match.subtitle')}
                    </p>
                </div>
            </div>

            <div class="space-y-4">
                {/* Skills */}
                <div>
                    <div class="flex justify-between mb-1">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{t('match.skills')} ({Math.round(factors.skillsMatch)}%)</span>
                        <span class="text-xs text-gray-500">
                            {interpolate(t('match.matched_missing'), {
                                matched: details.matchedSkills.length,
                                missing: details.missingSkills.length
                            })}
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div class="bg-indigo-600 h-2 rounded-full" style={{ width: `${factors.skillsMatch}%` }}></div>
                    </div>
                </div>

                {/* Seniority */}
                <div>
                    <div class="flex justify-between mb-1">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{t('match.seniority')} ({Math.round(factors.seniorityMatch)}%)</span>
                        <span class="text-xs text-gray-500 capitalize">{details.seniorityGap.replace('_', ' ')}</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div class="bg-indigo-600 h-2 rounded-full" style={{ width: `${factors.seniorityMatch}%` }}></div>
                    </div>
                </div>

                {/* Location */}
                <div>
                    <div class="flex justify-between mb-1">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{t('match.location')} ({Math.round(factors.locationMatch)}%)</span>
                        <span class="text-xs text-gray-500 capitalize">{details.locationStatus}</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div class="bg-indigo-600 h-2 rounded-full" style={{ width: `${factors.locationMatch}%` }}></div>
                    </div>
                </div>

                {/* Other Factors Grid */}
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div class="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-center">
                        <div class="text-xs text-gray-500 uppercase">{t('match.trust')}</div>
                        <div class="font-bold text-indigo-600 dark:text-indigo-400">{Math.round(factors.trustScore)}%</div>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-center">
                        <div class="text-xs text-gray-500 uppercase">{t('match.early_bird')}</div>
                        <div class="font-bold text-indigo-600 dark:text-indigo-400">{Math.round(factors.timeliness)}%</div>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-center">
                        <div class="text-xs text-gray-500 uppercase">{t('match.competition')}</div>
                        <div class="font-bold text-indigo-600 dark:text-indigo-400">{Math.round(factors.competition)}%</div>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-center">
                        <div class="text-xs text-gray-500 uppercase">{t('match.app_rate')}</div>
                        <div class="font-bold text-indigo-600 dark:text-indigo-400">{Math.round(factors.applicationRate)}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
});
