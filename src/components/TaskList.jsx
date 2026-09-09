import { useRef, useState } from "react";
import { completeTask, startTask, getTasks } from "../db.js";
import { compressImage } from "../utils/image.js";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function TaskList({ childId }) {
  const tasks = getTasks(childId).filter(
    (task) => task.status === "pending" || task.status === "in_progress",
  );

  if (tasks.length === 0) {
    return (
      <div className="mt-4 text-center text-sm font-bold text-sky-400">
        📋 还没有任务，等妈妈或爸爸发布吧！
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} childId={childId} />
      ))}
    </div>
  );
}

function TaskCard({ task }) {
  const { language } = useLanguage();
  const isZh = language === "zh";
  const inputRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleStart = () => {
    startTask(task.id);
    window.dispatchEvent(new Event("gda-data"));
  };

  const handleComplete = async () => {
    if (!photo) {
      setError(isZh ? "请先拍照上传完成任务的照片" : "Please take a photo first");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = completeTask(task.id, { photo });
      if (result.ok) {
        setPhoto(null);
        window.dispatchEvent(new Event("gda-data"));
        return;
      }
      if (result.code === "photo") {
        setError(isZh ? "请先拍照" : "Please take a photo first");
      } else if (result.code === "storage") {
        setError(isZh ? "手机存储空间不够，照片没有保存成功。请关掉几个网页后再试。" : "Not enough storage to save the photo. Close some tabs and try again.");
      } else {
        setError(isZh ? "提交失败，请再试一次" : "Submit failed, please try again");
      }
    } catch (err) {
      console.error("[TaskCard] submit failed", err);
      setError(err?.message || (isZh ? "提交失败，请再试一次" : "Submit failed, please try again"));
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setProcessing(true);
    try {
      const compressed = await compressImage(file, 960);
      setPhoto(compressed);
    } catch (err) {
      console.error("[TaskCard] photo compress failed", err);
      setPhoto(null);
      setError(err?.message || (isZh ? "照片处理失败，请再拍一张" : "Could not process photo, please try again"));
    } finally {
      setProcessing(false);
    }
  };

  const isPending = task.status === "pending";
  const isInProgress = task.status === "in_progress";
  const busy = loading || processing;

  return (
    <div className="rounded-2xl border-4 border-white bg-white p-4 shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-lg text-violet-800">{task.title}</p>
          <p className="text-sm font-extrabold text-amber-500">
            {isZh ? "奖励 +" : "Reward +"}
            {task.points} {isZh ? "分" : "pts"}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs font-bold ${
            isPending ? "bg-amber-100 text-amber-600" : isInProgress ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
          }`}
        >
          {isPending ? (isZh ? "待开始" : "To do") : isInProgress ? (isZh ? "进行中" : "In progress") : isZh ? "已完成" : "Done"}
        </span>
      </div>

      {isPending && (
        <button
          onClick={handleStart}
          className="mt-3 w-full rounded-2xl border-b-4 border-sky-700 bg-sky-400 py-2 font-bold text-white"
        >
          {isZh ? "开始任务" : "Start"}
        </button>
      )}

      {isInProgress && (
        <div className="mt-3 space-y-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 px-3 py-2 text-center text-sm font-bold text-violet-500 disabled:opacity-60"
          >
            {processing ? (isZh ? "正在处理照片…" : "Processing photo…") : photo ? (isZh ? "📸 已拍照，可重拍" : "📸 Photo ready, retake") : isZh ? "📷 点击拍照上传" : "📷 Take photo"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={handlePhotoUpload}
          />
          {photo ? <img src={photo} alt={isZh ? "任务照片" : "Task photo"} className="h-24 w-full rounded-xl object-cover" /> : null}
          {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-center text-xs font-extrabold text-rose-600">{error}</p> : null}
          <button
            onClick={handleComplete}
            disabled={busy || !photo}
            className={`w-full rounded-2xl py-2 font-bold text-white ${
              busy || !photo ? "bg-gray-300 text-gray-500" : "border-b-4 border-emerald-700 bg-emerald-400"
            }`}
          >
            {loading ? (isZh ? "提交中…" : "Submitting…") : isZh ? "📤 提交完成" : "📤 Submit"}
          </button>
        </div>
      )}
    </div>
  );
}
