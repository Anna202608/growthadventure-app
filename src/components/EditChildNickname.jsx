import { useEffect, useRef, useState } from "react";
import { childLabel, DEFAULT_CHILD_AVATAR, updateChildAvatar, updateChildNativeLang, updateChildNickname } from "../db.js";
import { compressAvatarImage } from "../utils/image.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import ChildAvatar from "./ChildAvatar.jsx";

export default function EditChildNickname({ child, onClose }) {
  const { language } = useLanguage();
  const isZh = language === "zh";
  const fileRef = useRef(null);
  const registeredName = String(child?.name || "").trim();
  const [value, setValue] = useState(child?.nickname || childLabel(child));
  const [nativeLang, setNativeLang] = useState(child?.nativeLang === "en" ? "en" : "zh");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setValue(String(child?.nickname || childLabel(child) || ""));
    setNativeLang(child?.nativeLang === "en" ? "en" : "zh");
    setError("");
  }, [child]);

  if (!child) return null;

  async function handlePickAvatar(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const dataUrl = await compressAvatarImage(file);
      const result = updateChildAvatar(child.id, dataUrl);
      console.info("[EditChildNickname] avatar result", { childId: child.id, status: result.status, error: result.error });
      if (!result.ok) {
        setError(
          result.error === "storage"
            ? isZh
              ? "手机存储空间不够，头像没有保存成功"
              : "Not enough storage to save avatar"
            : isZh
              ? "头像保存失败，请再试一次"
              : "Could not save avatar",
        );
      }
    } catch (err) {
      console.error("[EditChildNickname] avatar failed", { childId: child.id, message: err?.message, err });
      setError(err?.message || (isZh ? "头像处理失败，请换一张照片" : "Could not process photo"));
    } finally {
      setBusy(false);
    }
  }

  function handleSave(event) {
    event.preventDefault();
    const next = value.trim();
    try {
      const result = updateChildNickname(child.id, next === registeredName ? "" : next);
      updateChildNativeLang(child.id, nativeLang);
      console.info("[EditChildNickname] save result", {
        childId: child.id,
        registeredName,
        nickname: next,
        status: result.status,
        error: result.error,
        detail: result.detail,
        result,
      });
      if (!result.ok) {
        if (result.error === "too_short") setError(isZh ? "昵称至少 2 个字" : "At least 2 characters");
        else if (result.error === "too_long") setError(isZh ? "昵称最多 12 个字" : "Up to 12 characters");
        else if (result.error === "storage") setError(isZh ? "手机存储空间不够，昵称没有保存成功" : "Not enough storage to save nickname");
        else setError(isZh ? "没能保存昵称，请再试一次" : "Could not save nickname");
        return;
      }
      onClose?.();
    } catch (err) {
      console.error("[EditChildNickname] save threw", {
        childId: child?.id,
        nickname: next,
        message: err?.message,
        err,
      });
      setError(isZh ? "没能保存昵称，请再试一次" : "Could not save nickname");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" className="absolute inset-0 bg-stone-900/45" aria-label={isZh ? "关闭" : "Close"} onClick={onClose} />
      <form
        onSubmit={handleSave}
        className="relative z-10 mx-4 mb-4 w-full max-w-md rounded-[32px] border-4 border-white bg-white p-5 shadow-[0_12px_30px_rgba(194,65,12,0.2)]"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-orange-700">{isZh ? "编辑资料" : "Edit profile"}</h2>
            <p className="mt-1 text-xs font-extrabold text-orange-400">
              {isZh ? `注册名「${registeredName || "孩子"}」不会被改掉` : `Account name "${registeredName || "child"}" stays the same`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xl font-extrabold text-orange-600"
            aria-label={isZh ? "关闭" : "Close"}
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-orange-200 bg-amber-100 text-4xl disabled:opacity-60"
            aria-label={isZh ? "更换头像" : "Change avatar"}
          >
            <ChildAvatar avatar={child.avatar} className="h-full w-full" textClassName="text-4xl" />
          </button>
          <div className="min-w-0 flex-1">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl border-b-4 border-orange-600 bg-orange-400 py-2 text-sm font-extrabold text-white disabled:opacity-60"
            >
              {busy ? (isZh ? "处理中…" : "Processing…") : isZh ? "更换头像" : "Change avatar"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                const result = updateChildAvatar(child.id, DEFAULT_CHILD_AVATAR);
                console.info("[EditChildNickname] reset avatar", result);
              }}
              className="mt-2 w-full rounded-2xl bg-orange-50 py-2 text-xs font-extrabold text-orange-600 disabled:opacity-60"
            >
              {isZh ? "恢复默认头像" : "Use default avatar"}
            </button>
            <p className="mt-1 text-[11px] font-bold text-orange-400">{isZh ? "支持 JPG/PNG，不超过 2MB" : "JPG/PNG, max 2MB"}</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handlePickAvatar} />
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-extrabold text-orange-700">{isZh ? "昵称" : "Nickname"}</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={12}
            placeholder={isZh ? "例如：小糯米" : "e.g. Apple"}
            className="w-full rounded-2xl border-4 border-orange-200 bg-orange-50 px-4 py-3 text-lg font-bold text-orange-900 outline-none placeholder:text-orange-300 focus:border-orange-400"
          />
        </label>

        <fieldset className="mt-4 block">
          <legend className="mb-1 block text-sm font-extrabold text-orange-700">
            {isZh ? "身份 / 学习目标" : "Identity / learning goal"}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setNativeLang("zh")}
              className={`rounded-2xl border-4 px-2 py-3 text-center text-sm font-extrabold ${
                nativeLang === "zh"
                  ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                  : "border-orange-100 bg-orange-50 text-orange-400"
              }`}
            >
              {isZh ? "中国小朋友" : "Chinese child"}
              <span className="mt-1 block text-[11px]">{isZh ? "学英语" : "Learn English"}</span>
            </button>
            <button
              type="button"
              onClick={() => setNativeLang("en")}
              className={`rounded-2xl border-4 px-2 py-3 text-center text-sm font-extrabold ${
                nativeLang === "en"
                  ? "border-sky-400 bg-sky-50 text-sky-800"
                  : "border-orange-100 bg-orange-50 text-orange-400"
              }`}
            >
              {isZh ? "外国小朋友" : "International child"}
              <span className="mt-1 block text-[11px]">{isZh ? "学汉语" : "Learn Chinese"}</span>
            </button>
          </div>
        </fieldset>
        {error ? <p className="mt-2 text-sm font-extrabold text-rose-500">{error}</p> : null}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              const result = updateChildNickname(child.id, "");
              console.info("[EditChildNickname] reset result", result);
              onClose?.();
            }}
            className="rounded-2xl bg-orange-100 py-3 font-extrabold text-orange-700"
          >
            {isZh ? "恢复注册名" : "Use account name"}
          </button>
          <button type="submit" className="rounded-2xl border-b-8 border-orange-700 bg-orange-400 py-3 font-display text-lg text-white">
            {isZh ? "保存" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
