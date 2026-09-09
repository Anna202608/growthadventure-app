import { markWelcomeSeen } from "../onboarding.js";

export default function WelcomeGuide({ role, userId, onDone }) {
  function dismiss() {
    markWelcomeSeen(userId);
    onDone();
  }

  if (role === "parent") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-orange-950/45 px-5">
        <section className="w-full max-w-md rounded-[32px] border-4 border-white bg-white px-5 py-7 text-center shadow-[0_12px_0_rgba(249,115,22,0.35)]">
          <p className="font-display text-2xl leading-snug text-orange-700">👋 欢迎来到成长大冒险！</p>
          <p className="mt-2 text-sm font-extrabold text-orange-400">Welcome to Growth Adventure!</p>
          <ol className="mt-5 space-y-3 text-left">
            <li className="rounded-2xl bg-orange-50 px-4 py-3">
              <p className="font-extrabold text-orange-800">第一步：点击“创建任务”发布第一个任务</p>
              <p className="mt-1 text-xs font-bold text-orange-500">Step 1: Tap “Create Task” to publish your first task</p>
            </li>
            <li className="rounded-2xl bg-amber-50 px-4 py-3">
              <p className="font-extrabold text-orange-800">第二步：孩子完成后会获得积分</p>
              <p className="mt-1 text-xs font-bold text-orange-500">Step 2: Your child earns points upon completion</p>
            </li>
            <li className="rounded-2xl bg-rose-50 px-4 py-3">
              <p className="font-extrabold text-orange-800">第三步：积分可以兑换奖励或玩游戏</p>
              <p className="mt-1 text-xs font-bold text-orange-500">Step 3: Points can be redeemed for rewards or mini-games</p>
            </li>
          </ol>
          <button
            type="button"
            onClick={dismiss}
            className="mt-6 w-full rounded-2xl border-b-8 border-orange-700 bg-orange-400 py-4 font-display text-xl leading-tight text-white active:translate-y-1 active:border-b-4"
          >
            开始使用
            <span className="mt-1 block text-sm font-extrabold text-orange-50">Get Started</span>
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/45 px-5">
      <section className="w-full max-w-md rounded-[32px] border-4 border-white bg-white px-5 py-7 text-center shadow-[0_12px_0_rgba(14,165,233,0.28)]">
        <p className="font-display text-2xl leading-snug text-sky-700">🌟 欢迎，小勇士！</p>
        <p className="mt-2 text-sm font-extrabold text-sky-500">Welcome, little warrior!</p>
        <div className="mt-5 space-y-3 text-left">
          <p className="rounded-2xl bg-sky-50 px-4 py-3 font-extrabold leading-relaxed text-violet-800">
            等妈妈或爸爸发布了任务，你就可以开始赚积分啦！
            <span className="mt-1 block text-xs font-bold text-sky-600">
              Wait for mom or dad to assign a task and start earning points!
            </span>
          </p>
          <p className="rounded-2xl bg-lime-50 px-4 py-3 font-extrabold leading-relaxed text-violet-800">
            完成任务 → 拍照上传 → 家长确认 → 积分到账！
            <span className="mt-1 block text-xs font-bold text-sky-600">
              Complete task → Upload photo → Parent confirms → Points credited!
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="mt-6 w-full rounded-2xl border-b-8 border-sky-700 bg-sky-400 py-4 font-display text-xl leading-tight text-white active:translate-y-1 active:border-b-4"
        >
          知道了
          <span className="mt-1 block text-sm font-extrabold text-sky-50">Got it</span>
        </button>
      </section>
    </div>
  );
}
