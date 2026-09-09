import { useLanguage } from "../context/LanguageContext.jsx";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const isZh = language === 'zh';

  return (
    <button
      onClick={toggleLanguage}
      className="rounded-full border-4 border-white bg-white/20 px-4 py-2 text-sm font-extrabold text-white backdrop-blur transition hover:bg-white/40"
    >
      {isZh ? "中文" : "EN"}
    </button>
  );
}