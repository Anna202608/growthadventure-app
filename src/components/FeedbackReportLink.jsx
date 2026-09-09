import { useLanguage } from "../context/LanguageContext.jsx";

export const FEEDBACK_MAILTO =
  "mailto:annaning1@outlook.com?subject=" + encodeURIComponent("成长大冒险举报");

export default function FeedbackReportLink({ className, children }) {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  return (
    <a href={FEEDBACK_MAILTO} className={className}>
      <span className="inline-flex items-center gap-1 text-base font-extrabold text-red-600">
        <span className="text-xl">🚨</span>
        {children || (isZh ? "举报" : "Report")}
      </span>
    </a>
  );
}