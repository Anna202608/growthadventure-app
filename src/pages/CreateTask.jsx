import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getFamilyChildren, getOnlyChild, addTask, TASK_TYPES, childLabel } from "../db.js";

export default function CreateTask() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState(10);
  const [type, setType] = useState("study");
  const [repeat, setRepeat] = useState("once");

  const onlyChild = getOnlyChild();
  const children = onlyChild?.id ? [onlyChild] : getFamilyChildren();
  const [childId, setChildId] = useState(children[0]?.id || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert(isZh ? "请输入任务名称" : "Please enter task name");
      return;
    }
    if (!childId) {
      alert(isZh ? "还没有绑定孩子，请先去家庭管理绑定" : "No child bound yet");
      return;
    }
    addTask({ title: title.trim(), points, type, childId, repeat });
    navigate("/parent");
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-orange-300 via-amber-200 to-rose-200">
      <div className="relative z-10 mx-auto max-w-md px-5 pb-8 pt-8">
        <Link to="/parent" className="inline-block text-sm font-extrabold text-orange-800/70">
          ← {isZh ? "返回" : "Back"}
        </Link>

        <h1 className="mt-4 font-display text-3xl text-white drop-shadow-[0_3px_0_rgba(194,65,12,0.35)]">
          {isZh ? "创建任务" : "Create Task"}
        </h1>
        <p className="mt-1 text-sm font-extrabold text-orange-800/70">
          {isZh ? "孩子拍照提交后，你确认才给积分。" : "Confirm after child uploads photo."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-[32px] border-4 border-white bg-white/85 p-5 shadow-[0_10px_0_rgba(249,115,22,0.35)]">
          <label className="block">
            <span className="mb-1 block text-sm font-extrabold text-orange-700">
              {isZh ? "任务名称" : "Task Name"}
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isZh ? "写作文" : "Write essay"}
              className="w-full rounded-2xl border-4 border-orange-200 bg-white px-4 py-3 text-lg font-bold text-orange-900 outline-none placeholder:font-bold placeholder:text-orange-300 focus:border-orange-400"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-extrabold text-orange-700">
              {isZh ? "完成后可得积分" : "Points"}
            </span>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full rounded-2xl border-4 border-orange-200 bg-white px-4 py-3 text-lg font-bold text-orange-900 outline-none focus:border-orange-400"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-extrabold text-orange-700">
              {isZh ? "分配给哪个孩子" : "Assign to"}
            </span>
            {children.length === 0 ? (
              <p className="rounded-2xl border-4 border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                {isZh ? "还没有绑定孩子。请到「家庭管理」查看家庭码，让孩子注册时填写。" : "No child bound yet."}
              </p>
            ) : (
              <select
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                className="w-full rounded-2xl border-4 border-orange-200 bg-white px-4 py-3 text-lg font-bold text-orange-900 outline-none focus:border-orange-400"
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {childLabel(child)}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-extrabold text-orange-700">
              {isZh ? "重复" : "Repeat"}
            </span>
            <div className="flex gap-3">
              {["once", "daily"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRepeat(option)}
                  className={`flex-1 rounded-2xl py-3 text-center font-bold transition ${
                    repeat === option
                      ? "border-b-8 border-orange-700 bg-orange-400 text-white"
                      : "border-4 border-orange-200 bg-white/80 text-orange-700"
                  }`}
                >
                  {option === "once" ? (isZh ? "一次性" : "Once") : (isZh ? "每天" : "Daily")}
                </button>
              ))}
            </div>
          </label>

          {children.length === 0 && (
            <div className="rounded-2xl border-4 border-rose-200 bg-rose-50 p-4 text-center">
              <p className="text-sm font-bold text-rose-600">
                {isZh ? "还没有绑定孩子。把家庭码发给孩子注册后，再来布置任务。" : "No child bound yet."}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl border-b-8 border-emerald-700 bg-emerald-400 py-4 font-display text-2xl text-white transition active:translate-y-1 active:border-b-4"
          >
            {isZh ? "保存并同步" : "Save & Sync"}
          </button>
        </form>
      </div>
    </div>
  );
}