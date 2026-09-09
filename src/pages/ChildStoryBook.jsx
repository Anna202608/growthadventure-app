import { Link, Navigate, useParams } from "react-router-dom";
import catalog from "../data/books.json";
import StoryBook from "../components/StoryBook.jsx";
import ChildBottomNav from "../components/ChildBottomNav.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { BOOK_PAGE_POINTS, getBookProgress, getPoints } from "../db.js";
import { useLiveData } from "../hooks/useLiveData.js";

export function getStoryBooks() {
  return Array.isArray(catalog.books) ? catalog.books : [];
}

export function getStoryBookById(id) {
  return getStoryBooks().find((item) => item.id === id) || null;
}

export default function ChildStoryBook() {
  useLiveData();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { bookId } = useParams();
  const isZh = language === "zh";
  const books = getStoryBooks();
  const book = bookId ? getStoryBookById(bookId) : books[0] || null;

  if (!user) return <Navigate to="/" replace />;

  if (!book) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-fuchsia-300 via-rose-200 to-amber-200 px-4 pt-6">
        <Link to="/child/park" className="font-extrabold text-fuchsia-900/70">
          ← {isZh ? "返回游戏乐园" : "Back"}
        </Link>
        <p className="mt-8 text-center font-extrabold text-fuchsia-700">{isZh ? "还没有绘本" : "No books yet"}</p>
      </div>
    );
  }

  const progress = getBookProgress(book.id);
  const coins = getPoints();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-fuchsia-300 via-rose-200 to-amber-200">
      <div className="relative z-10 mx-auto max-w-md px-4 pb-20 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link to="/child/park" className="text-sm font-extrabold text-fuchsia-900/70">
              ← {isZh ? "返回游戏乐园" : "Back to Game Park"}
            </Link>
            <h1 className="mt-2 font-display text-2xl leading-tight text-white drop-shadow-[0_3px_0_rgba(157,23,77,0.35)]">
              {isZh ? book.series.zh : book.series.en}
            </h1>
            <p className="text-sm font-extrabold text-fuchsia-900/80">
              {isZh ? book.title.zh : book.title.en} · {isZh ? `完成一页 +${BOOK_PAGE_POINTS} 分` : `+${BOOK_PAGE_POINTS} per page`} · {isZh ? `当前 ${coins} 分` : `${coins} pts`}
            </p>
          </div>
          <LanguageToggle />
        </div>
        <p className="mt-2 text-xs font-extrabold text-fuchsia-800">
          {isZh
            ? `进度 ${progress.completedPageIds.length}/${book.pages.length}${progress.badgeAwarded ? " · 已获得小小阅读家" : ""}`
            : `Progress ${progress.completedPageIds.length}/${book.pages.length}${progress.badgeAwarded ? " · Little Reader earned" : ""}`}
        </p>
        <div className="mt-3">
          <StoryBook book={book} />
        </div>
        <ChildBottomNav />
      </div>
    </div>
  );
}
