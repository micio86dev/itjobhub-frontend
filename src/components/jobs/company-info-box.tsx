import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./company-info-box.css?inline";
import { useTranslate, interpolate } from "~/contexts/i18n";

interface CompanyInfoBoxProps {
  company: string;
  companyScore?: number;
}

export const CompanyInfoBox = component$<CompanyInfoBoxProps>(
  ({ company, companyScore }) => {
    useStylesScoped$(styles);
    const t = useTranslate();

    return (
      <div class="companyInfoBox">
        <div class="companyInfoHeader">
          <h3 class="companyInfoTitle">{t("job.about_company")}</h3>
          <div class="trustScore">
            <span class="trustStar">★</span>
            <span class="trustValue">
              {t("job.trust_score")}: {Math.round(companyScore || 80)}%
            </span>
          </div>
        </div>
        <p class="companyAboutText">
          {interpolate(t("job.about_company_desc"), { company })}
        </p>
      </div>
    );
  },
);
