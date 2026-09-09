import { useEffect, useState } from "react";
import {
  COMMENT_EVENT,
  COMMENT_MAX_CHARS,
  addVideoComment,
  deleteVideoComment,
  isCommentVisible,
  listVideoComments,
  reviewVideoComment,
} from "../videoStore.js";
import { reportExchangeTarget } from "../exchange.js";
import { useLanguage } from "../context/LanguageContext.jsx";

function formatCommentTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function VideoComments({ videoId, user, isPublisherParent = false }) {
  const { language } = useLanguage();
  const isZh = language === "zh";
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const canPost = Boolean(user);
  const count = [...text].length;
  const over = count > COMMENT_MAX_CHARS;
  const empty = !text.trim();

  useEffect(() => {
    let alive = true;
    async function load() {
      const rows = await listVideoComments(videoId);
      const visible = rows.filter((item) =>
        isCommentVisible(item, { userId: user?.userId, isPublisherParent }),
      );
      if (alive) setComments(visible);
    }
    load();
    window.addEventListener(COMMENT_EVENT, load);
    return () => {
      alive = false;
      window.removeEventListener(COMMENT_EVENT, load);
    };
  }, [videoId, user?.userId, isPublisherParent]);

  function handleChange(event) {
    const next = event.target.value;
    const chars = [...next];
    setText(chars.length > COMMENT_MAX_CHARS ? chars.slice(0, COMMENT_MAX_CHARS).join("") : next);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canPost || empty || over) return;
    try {
      await addVideoComment({
        videoId,
        authorId: user.userId,
        authorName: user.nickname || user.name,
        content: text,
      });
      setText("");
      setError("");
    } catch (err) {
      setError(err.message || (isZh ? "发送失败，请再试一次" : "Could not send"));
    }
  }

  const pending = comments.filter((item) => item.status === "pending");

  return (
    <section className="mt-4">
      <h3 className="font-display text-xl text-violet-800">{isZh ? "留言" : "Comments"}</h3>
      <p className="text-xs font-extrabold text-violet-400">
        {isZh ? "留言先只给自己看，发布者家长通过后才会公开" : "Comments stay private until the publisher's parent approves"}
      </p>
      {canPost ? (
        <form className="mt-3" onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={handleChange}
            rows={3}
            placeholder={isZh ? "写一句友好的话（最多280字）" : "Write something kind (max 280)"}
            className="w-full resize-none rounded-2xl border-4 border-violet-200 px-4 py-3 text-base font-bold text-violet-900 outline-none placeholder:font-bold placeholder:text-violet-300 focus:border-violet-400"
          />
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className={`text-sm font-extrabold ${over ? "text-rose-500" : "text-violet-400"}`}>
              {count} / {COMMENT_MAX_CHARS}
            </span>
            <button
              type="submit"
              disabled={empty || over}
              className={`rounded-2xl px-5 py-2 font-display text-lg text-white ${
                empty || over ? "cursor-not-allowed bg-violet-200" : "border-b-4 border-orange-700 bg-orange-400"
              }`}
            >
              {isZh ? "提交审核" : "Send for review"}
            </button>
          </div>
          {error ? <p className="mt-2 text-sm font-extrabold text-rose-500">{error}</p> : null}
        </form>
      ) : null}

      {isPublisherParent && pending.length > 0 ? (
        <div className="mt-3 rounded-2xl bg-amber-50 p-3">
          <p className="text-sm font-extrabold text-amber-700">{isZh ? "待审核留言" : "Pending comments"}</p>
          {pending.map((item) => (
            <article key={item.id} className="mt-2 rounded-2xl bg-white px-3 py-2">
              <p className="text-sm font-bold text-violet-700">{item.content}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="rounded-xl bg-emerald-100 px-2 py-1 text-xs font-extrabold text-emerald-700"
                  onClick={() => reviewVideoComment(item.id, "approve")}
                >
                  {isZh ? "通过" : "Approve"}
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-rose-100 px-2 py-1 text-xs font-extrabold text-rose-600"
                  onClick={() => reviewVideoComment(item.id, "reject")}
                >
                  {isZh ? "拒绝" : "Reject"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
        {comments.filter((item) => item.status !== "pending" || item.authorId === user?.userId).length === 0 ? (
          <p className="rounded-2xl bg-violet-50 px-4 py-4 text-center text-sm font-extrabold text-violet-400">
            {isZh ? "还没有公开留言" : "No public comments yet"}
          </p>
        ) : (
          comments
            .filter((item) => item.status === "approved" || (!item.status && item.status !== "rejected"))
            .concat(comments.filter((item) => item.status === "pending" && item.authorId === user?.userId))
            .map((item) => (
              <article key={item.id} className="rounded-2xl bg-violet-50 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-extrabold text-violet-800">{item.authorName}</p>
                    <p className="text-xs font-bold text-violet-400">
                      {formatCommentTime(item.createdAt)}
                      {item.status === "pending" ? (isZh ? " · 仅自己可见" : " · only you") : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => reportExchangeTarget({ targetType: "comment", targetId: item.id, reason: "不适合孩子" })}
                    className="rounded-xl bg-orange-100 px-2 py-1 text-xs font-extrabold text-orange-600"
                  >
                    {isZh ? "举报" : "Report"}
                  </button>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm font-bold leading-relaxed text-violet-700">{item.content}</p>
                {user?.userId && item.authorId === user.userId ? (
                  <button
                    type="button"
                    onClick={() => deleteVideoComment(item.id, user.userId)}
                    className="mt-2 text-xs font-extrabold text-rose-500"
                  >
                    {isZh ? "删除" : "Delete"}
                  </button>
                ) : null}
              </article>
            ))
        )}
      </div>
    </section>
  );
}
