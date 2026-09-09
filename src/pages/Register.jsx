import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import PrivacyConsent, { PRIVACY_POLICY_URL } from "../components/PrivacyConsent.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const inputClass =
  "w-full rounded-2xl border-4 border-violet-200 bg-white px-4 py-3 text-base font-bold text-violet-900 outline-none placeholder:font-bold placeholder:text-violet-300 focus:border-violet-400";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [childNativeLang, setChildNativeLang] = useState(() => (isZh ? "zh" : "en"));

  function handleSubmit(e) {
    e.preventDefault();
    if (!agreed) {
      setError(isZh ? "请先阅读并同意隐私政策" : "Please read and agree to the Privacy Policy");
      return;
    }
    if (password !== confirmPassword) {
      setError(isZh ? "两次输入的密码不一致" : "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError(isZh ? "密码至少6位字符" : "Password must be at least 6 characters");
      return;
    }

    const result = register({
      username: username.trim(),
      password,
      childNativeLang,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    navigate("/choose-role");
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-amber-300 via-rose-300 to-sky-400">
      <div className="blob pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-yellow-200/80" />
      <div
        className="blob pointer-events-none absolute -right-10 top-32 h-52 w-52 rounded-full bg-fuchsia-400/50"
        style={{ animationDelay: "1.2s" }}
      />
      <div
        className="blob pointer-events-none absolute bottom-10 left-1/4 h-36 w-36 rounded-full bg-lime-300/70"
        style={{ animationDelay: "0.6s" }}
      />
      <div
        className="blob pointer-events-none absolute bottom-24 right-8 h-28 w-28 rounded-full bg-orange-400/70"
        style={{ animationDelay: "1.8s" }}
      />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
        <div className="mb-4 flex justify-end">
          <LanguageToggle />
        </div>
        <div className="bob mb-6 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_8px_0_#f59e0b] float-icon">
            <img src="/icon.png" alt="成长大冒险" className="h-full w-full rounded-full object-cover" />
          </div>
          <h1 className="font-display text-4xl tracking-wide text-white drop-shadow-[0_4px_0_rgba(190,24,93,0.35)] float-text">
            成长大冒险
          </h1>
          <p className="mt-2 text-lg font-extrabold text-white/95">
            {isZh ? "注册账号，开始你的冒险！" : "Register and start your adventure!"}
          </p>
        </div>

        <div className="rounded-[32px] border-4 border-white bg-white/85 p-5 shadow-[0_12px_0_rgba(236,72,153,0.35)] backdrop-blur">
          <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1 block text-sm font-extrabold text-violet-700">
                {isZh ? "账号" : "Account"}
              </span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isZh ? "请输入邮箱或手机号" : "Enter your email or phone"}
                className={inputClass}
                autoComplete="username"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-extrabold text-violet-700">
                {isZh ? "密码" : "Password"}
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isZh ? "请输入密码（不少于6位）" : "Enter your password (at least 6 characters)"}
                className={inputClass}
                autoComplete="new-password"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-extrabold text-violet-700">
                {isZh ? "确认密码" : "Confirm Password"}
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isZh ? "请再输入一次密码" : "Re-enter your password"}
                className={inputClass}
                autoComplete="new-password"
              />
            </label>

            <fieldset className="block">
              <legend className="mb-1 block text-sm font-extrabold text-violet-700">
                {isZh ? "孩子身份 / 学习目标" : "Child identity / learning goal"}
              </legend>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChildNativeLang("zh")}
                  className={`rounded-2xl border-4 px-2 py-3 text-center text-sm font-extrabold ${
                    childNativeLang === "zh"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-violet-100 bg-white text-violet-500"
                  }`}
                >
                  {isZh ? "中国小朋友" : "Chinese child"}
                  <span className="mt-1 block text-[11px] font-bold opacity-80">
                    {isZh ? "学习英语" : "Learn English"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setChildNativeLang("en")}
                  className={`rounded-2xl border-4 px-2 py-3 text-center text-sm font-extrabold ${
                    childNativeLang === "en"
                      ? "border-sky-500 bg-sky-50 text-sky-800"
                      : "border-violet-100 bg-white text-violet-500"
                  }`}
                >
                  {isZh ? "外国小朋友" : "International child"}
                  <span className="mt-1 block text-[11px] font-bold opacity-80">
                    {isZh ? "学习汉语" : "Learn Chinese"}
                  </span>
                </button>
              </div>
            </fieldset>

            {error ? (
              <p className="rounded-2xl bg-rose-100 px-3 py-2 text-center text-sm font-bold text-rose-600">
                {error}
              </p>
            ) : null}

            <PrivacyConsent agreed={agreed} onChange={setAgreed} />

            <button
              type="submit"
              disabled={!agreed}
              className={`mt-1 w-full rounded-2xl py-3.5 font-display text-2xl transition ${
                agreed
                  ? "border-b-8 border-emerald-700 bg-emerald-400 text-white active:translate-y-1 active:border-b-4"
                  : "cursor-not-allowed bg-violet-100 text-violet-300"
              }`}
            >
              {isZh ? "注册" : "Register"}
            </button>
          </form>

          <p className="mt-4 text-center">
            <Link
              to="/"
              className="inline-block rounded-2xl px-3 py-2 text-base font-extrabold text-fuchsia-600 underline decoration-2 underline-offset-4"
            >
              {isZh ? "已有账号？去登录" : "Already have an account? Log in"}
            </Link>
          </p>
          <p className="mt-2 text-center">
            <a
              href={PRIVACY_POLICY_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-extrabold text-violet-500 underline decoration-2 underline-offset-4"
            >
              {isZh ? "隐私政策" : "Privacy Policy"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}