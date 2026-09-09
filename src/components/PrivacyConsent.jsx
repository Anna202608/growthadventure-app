export const PRIVACY_POLICY_URL = "https://chengzhangadventure.netlify.app/privacy.html";

export default function PrivacyConsent({ agreed, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-violet-50 px-3 py-3 text-sm font-extrabold leading-relaxed text-violet-700">
      <input
        type="checkbox"
        checked={agreed}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-fuchsia-500"
      />
      <span>
        我已阅读并同意
        <a
          href={PRIVACY_POLICY_URL}
          target="_blank"
          rel="noreferrer"
          className="mx-0.5 text-fuchsia-600 underline decoration-2 underline-offset-2"
          onClick={(e) => e.stopPropagation()}
        >
          《隐私政策》
        </a>
      </span>
    </label>
  );
}
