import { useEffect, useState } from "react";
import {
  COMMENT_EVENT,
  addComment,
  addReport,
  approveComment,
  getFamilyId,
  listComments,
  visibleComments,
} from "../utils/exchangeStorage.js";
import { useLanguage } from "../context/LanguageContext.jsx";

const REPORT_REASONS = ["不适合孩子", "暴力", "色情", "其他"];

export default function ExchangeComments({ contentId, isPublisherParent = false }) {
  const { language } = useLanguage();
  const isZh = language === "zh";
  const familyId = getFamilyId();
  const [rows, setRows] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [reportFor, setReportFor] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      const all = await listComments(contentId);
      if (alive) setRows(all);
    }
    load();
    window.addEventListener(COMMENT_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      alive = false;
      window.removeEventListener(COMMENT_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, [contentId]);

  const shown = visibleComments(rows, { familyId, isPublisherParent });
  const pending = rows.filter((item) => item.status === "pending");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await addComment({ contentId, text });
      setText("");
      setError("");
    } catch (err) {
      setError(err.message || (isZh ? "发送失败" : "Failed"));
    }
  }

  return (
    <section className="mt-4">
      <h3 className="font-display text-xl text-violet-800">{isZh ? "留言" : "Comments"}</h3>
      <p className="text-xs font-extrabold text-violet-400">
        {isZh ? "提交后仅自己可见，发布者家长点「通过」后才会公开" : "Private until the publisher's parent approves"}
      </p>
      <form className="mt-3" onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={isZh ? "写一句友好的话" : "Write something kind"}
          className="w-full resize-none rounded-2xl border-4 border-violet-200 px-4 py-3 text-base font-bold text-violet-900 outline-none"
        />
        <button type="submit" className="mt-2 rounded-2xl bg-orange-400 px-5 py-2 font-display text-lg text-white">
          {isZh ? "提交审核" : "Submit"}
        </button>
        {error ? <p className="mt-2 text-sm font-extrabold text-rose-500">{error}</p> : null}
      </form>

      {isPublisherParent && pending.length > 0 ? (
        <div className="mt-3 rounded-2xl bg-amber-50 p-3">
          <p className="text-sm font-extrabold text-amber-700">{isZh ? "待审核留言" : "Pending"}</p>
          {pending.map((item) => (
            <article key={item.id} className="mt-2 rounded-2xl bg-white px-3 py-2">
              <p className="text-sm font-bold text-violet-700">{item.text}</p>
              <button
                type="button"
                className="mt-2 rounded-xl bg-emerald-100 px-2 py-1 text-xs font-extrabold text-emerald-700"
                onClick={() => approveComment(item.id)}
              >
                {isZh ? "通过" : "Approve"}
              </button>
            </article>
          ))}
        </div>
      ) : null}

      <div className="mt-3 space-y-2">
        {shown.map((item) => (
          <article key={item.id} className="rounded-2xl bg-violet-50 px-4 py-3">
            <p className="text-sm font-bold text-violet-700">{item.text}</p>
            <p className="mt-1 text-xs font-extrabold text-violet-400">
              {item.status === "pending" ? (isZh ? "仅自己可见" : "Only you") : isZh ? "已公开" : "Public"}
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-extrabold text-orange-600"
              onClick={() => setReportFor(item.id)}
            >
              {isZh ? "举报" : "Report"}
            </button>
          </article>
        ))}
      </div>

      {reportFor ? (
        <ReportSheet
          isZh={isZh}
          onClose={() => setReportFor("")}
          onPick={(reason) => {
            addReport({ contentId: reportFor, reason });
            setReportFor("");
          }}
        />
      ) : null}
    </section>
  );
}

export function ReportSheet({ isZh, onClose, onPick }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 px-6">
      <div className="w-full max-w-sm rounded-[28px] border-4 border-white bg-white p-5">
        <p className="font-display text-2xl text-violet-800">{isZh ? "选择举报原因" : "Why report?"}</p>
        <div className="mt-3 space-y-2">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              className="w-full rounded-2xl bg-orange-50 py-3 font-extrabold text-orange-700"
              onClick={() => onPick(reason)}
            >
              {reason}
            </button>
          ))}
        </div>
        <button type="button" className="mt-3 w-full font-extrabold text-violet-400" onClick={onClose}>
          {isZh ? "取消" : "Cancel"}
        </button>
      </div>
    </div>
  );
}
