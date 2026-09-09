import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getOnlyChild, childLabel } from "../db.js";
import { useLiveData } from "../hooks/useLiveData.js";

const HEALTH_KEY = "gda.healthRecords";

function getHealthRecords(childId) {
  try {
    const data = JSON.parse(localStorage.getItem(HEALTH_KEY) || "{}");
    return data[childId] || [];
  } catch {
    return [];
  }
}

function saveHealthRecord(childId, records) {
  try {
    const data = JSON.parse(localStorage.getItem(HEALTH_KEY) || "{}");
    data[childId] = records;
    localStorage.setItem(HEALTH_KEY, JSON.stringify(data));
  } catch {}
}

export default function FamilyManage() {
  useLiveData();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isZh = language === 'zh';

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const child = getOnlyChild();
  const childId = child?.id || "default";
  const [records, setRecords] = useState([]);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setRecords(getHealthRecords(childId));
  }, [childId]);

  const calcBMI = (h, w) => {
    if (!h || !w) return null;
    const hM = h / 100;
    return (w / (hM * hM)).toFixed(1);
  };

  const handleSave = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h < 50 || h > 250 || w < 5 || w > 200) {
      alert(isZh ? "请输入有效的身高（50-250cm）和体重（5-200kg）" : "Enter valid height (50-250cm) and weight (5-200kg)");
      return;
    }

    let newRecords = [...records];
    const entry = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      height: h,
      weight: w,
      bmi: calcBMI(h, w),
      note: note.trim(),
    };

    if (editingId) {
      newRecords = newRecords.map((r) => (r.id === editingId ? entry : r));
    } else {
      newRecords = [entry, ...newRecords];
    }

    setRecords(newRecords);
    saveHealthRecord(childId, newRecords);
    setHeight("");
    setWeight("");
    setNote("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (!confirm(isZh ? "确定要删除这条记录吗？" : "Delete this record?")) return;
    const newRecords = records.filter((r) => r.id !== id);
    setRecords(newRecords);
    saveHealthRecord(childId, newRecords);
  };

  const handleEdit = (record) => {
    setHeight(String(record.height));
    setWeight(String(record.weight));
    setNote(record.note || "");
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setHeight("");
    setWeight("");
    setNote("");
    setEditingId(null);
    setShowForm(false);
  };

  const latest = records.length > 0 ? records[0] : null;
  const bmi = latest ? calcBMI(latest.height, latest.weight) : null;

  const getBmiStatus = (bmi) => {
    if (!bmi) return { label: isZh ? "未知" : "Unknown", color: "text-gray-500" };
    const val = parseFloat(bmi);
    if (val < 18.5) return { label: isZh ? "偏瘦" : "Underweight", color: "text-amber-500" };
    if (val < 24) return { label: isZh ? "正常" : "Normal", color: "text-emerald-500" };
    if (val < 28) return { label: isZh ? "偏重" : "Overweight", color: "text-orange-500" };
    return { label: isZh ? "肥胖" : "Obese", color: "text-rose-500" };
  };

  const bmiStatus = getBmiStatus(bmi);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-orange-300 via-amber-200 to-rose-200">
      <div className="relative z-10 mx-auto max-w-md px-5 pb-8 pt-8">
        <Link to="/parent" className="inline-block text-sm font-extrabold text-orange-800/70">
          ← {isZh ? "返回" : "Back"}
        </Link>

        <h1 className="mt-4 font-display text-3xl text-white drop-shadow-[0_3px_0_rgba(194,65,12,0.35)]">
          📊 {isZh ? "健康管理" : "Health Management"}
        </h1>
        <p className="mt-1 text-sm font-extrabold text-orange-800/70">
          {childLabel(child)} {isZh ? "的身体数据" : "'s Health Data"}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border-4 border-white bg-white/90 p-3 text-center shadow-[0_6px_0_rgba(249,115,22,0.25)]">
            <p className="text-2xl font-display text-orange-500">{latest ? latest.height : "--"}</p>
            <p className="text-xs font-bold text-orange-800/70">{isZh ? "身高 (cm)" : "Height (cm)"}</p>
          </div>
          <div className="rounded-2xl border-4 border-white bg-white/90 p-3 text-center shadow-[0_6px_0_rgba(249,115,22,0.25)]">
            <p className="text-2xl font-display text-sky-500">{latest ? latest.weight : "--"}</p>
            <p className="text-xs font-bold text-orange-800/70">{isZh ? "体重 (kg)" : "Weight (kg)"}</p>
          </div>
          <div className="rounded-2xl border-4 border-white bg-white/90 p-3 text-center shadow-[0_6px_0_rgba(249,115,22,0.25)]">
            <p className={`text-2xl font-display ${bmiStatus.color}`}>{bmi || "--"}</p>
            <p className={`text-xs font-bold ${bmiStatus.color}`}>BMI · {bmiStatus.label}</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="mt-4 w-full rounded-2xl border-b-8 border-orange-700 bg-orange-400 py-3 font-display text-xl text-white transition active:translate-y-1 active:border-b-4"
        >
          {editingId ? (isZh ? "📝 编辑记录" : "📝 Edit") : (isZh ? "➕ 添加记录" : "➕ Add Record")}
        </button>

        {showForm && (
          <div className="mt-4 rounded-[28px] border-4 border-white bg-white/90 p-4 shadow-[0_8px_0_rgba(249,115,22,0.25)]">
            <h2 className="font-display text-xl text-orange-700">
              {editingId ? (isZh ? "编辑记录" : "Edit Record") : (isZh ? "添加记录" : "Add Record")}
            </h2>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-sm font-bold text-orange-700">{isZh ? "身高 (cm)" : "Height (cm)"}</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="120"
                  className="w-full rounded-2xl border-4 border-orange-200 bg-white px-4 py-3 text-lg font-bold text-orange-900 outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-orange-700">{isZh ? "体重 (kg)" : "Weight (kg)"}</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="22.5"
                  className="w-full rounded-2xl border-4 border-orange-200 bg-white px-4 py-3 text-lg font-bold text-orange-900 outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-orange-700">{isZh ? "备注（可选）" : "Note (optional)"}</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={isZh ? "如：最近长高了不少" : "e.g. Growing fast"}
                  className="w-full rounded-2xl border-4 border-orange-200 bg-white px-4 py-3 text-lg font-bold text-orange-900 outline-none focus:border-orange-400"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 rounded-2xl border-b-4 border-emerald-700 bg-emerald-400 py-3 font-bold text-white"
                >
                  {isZh ? "保存" : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 rounded-2xl border-4 border-orange-200 bg-white py-3 font-bold text-orange-700"
                >
                  {isZh ? "取消" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

        {records.length > 0 ? (
          <div className="mt-4 rounded-[28px] border-4 border-white bg-white/90 p-4 shadow-[0_8px_0_rgba(249,115,22,0.25)]">
            <h2 className="font-display text-xl text-orange-700">{isZh ? "历史记录" : "History"}</h2>
            <div className="mt-3 space-y-2">
              {records.slice(0, 20).map((record) => (
                <div key={record.id} className="flex items-center justify-between rounded-2xl bg-orange-50 px-3 py-2">
                  <div>
                    <p className="font-extrabold text-orange-900">
                      {record.height}cm · {record.weight}kg
                      {record.bmi && (
                        <span className="ml-2 text-sm font-bold text-orange-500">BMI {record.bmi}</span>
                      )}
                    </p>
                    <p className="text-xs font-bold text-orange-400">
                      {record.date} {record.note ? `· ${record.note}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(record)}
                      className="rounded-lg bg-sky-100 px-2 py-1 text-xs font-bold text-sky-600"
                    >
                      {isZh ? "编辑" : "Edit"}
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="rounded-lg bg-rose-100 px-2 py-1 text-xs font-bold text-rose-600"
                    >
                      {isZh ? "删除" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-[28px] border-4 border-white bg-white/90 p-8 text-center">
            <p className="text-lg font-bold text-orange-400">{isZh ? "还没有健康记录" : "No health records yet"}</p>
            <p className="text-sm font-bold text-orange-300">
              {isZh ? "点击上方按钮添加孩子的身高体重" : "Add your child's height and weight"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}