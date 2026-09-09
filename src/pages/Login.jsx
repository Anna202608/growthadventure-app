import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import PrivacyConsent, { PRIVACY_POLICY_URL } from "../components/PrivacyConsent.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const inputClass =
  "w-full rounded-2xl border-4 border-violet-200 bg-white px-4 py-3 text-base font-bold text-violet-900 outline-none placeholder:font-bold placeholder:text-violet-300 focus:border-violet-400";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  function handleLogin(event) {
    event.preventDefault();
    if (!agreed) return;
    const result = login(username, password);
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
            {isZh ? "登录，开始今天的冒险吧！" : "Log in and start your adventure today!"}
          </p>
        </div>

        <div className="rounded-[32px] border-4 border-white bg-white/85 p-5 shadow-[0_12px_0_rgba(236,72,153,0.35)] backdrop-blur">
          <form className="mt-5 space-y-3" onSubmit={handleLogin}>
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
                autoComplete="current-password"
              />
            </label>

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
              {isZh ? "登录，出发！" : "Login, Go!"}
            </button>
          </form>

          <p className="mt-4 text-center">
            <Link
              to="/register"
              className="inline-block rounded-2xl px-3 py-2 text-base font-extrabold text-fuchsia-600 underline decoration-2 underline-offset-4"
            >
              {isZh ? "还没有账号？去注册" : "Don't have an account? Register"}
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