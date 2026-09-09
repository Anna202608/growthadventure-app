import { Link } from "react-router-dom";

export default function EmptyTaskGuide({ role }) {
  if (role === "parent") {
    return (
      <section className="rounded-[32px] border-4 border-white bg-white/90 px-5 py-7 text-center shadow-[0_10px_0_rgba(249,115,22,0.28)]">
        <p className="font-display text-2xl text-orange-700">📋 还没有任务</p>
        <p className="mt-1 text-sm font-extrabold text-orange-400">No tasks yet</p>
        <p className="mt-4 text-base font-extrabold leading-relaxed text-orange-800">
          点击“创建任务”来发布第一个任务吧！
        </p>
        <p className="mt-2 text-sm font-bold leading-relaxed text-orange-500">
          Tap “Create Task” to publish your first task!
        </p>
        <p className="mt-4 text-base font-extrabold leading-relaxed text-orange-800">
          孩子完成后会获得积分，攒起来换奖励！
        </p>
        <p className="mt-2 text-sm font-bold leading-relaxed text-orange-500">
          Your child will earn points to redeem for rewards!
        </p>
        <Link
          to="/parent/tasks/new"
          className="mt-6 block rounded-2xl border-b-8 border-emerald-700 bg-emerald-400 px-4 py-4 font-display text-xl leading-tight text-white active:translate-y-1 active:border-b-4"
        >
          创建第一个任务
          <span className="mt-1 block text-sm font-extrabold text-emerald-50">Create First Task</span>
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-[32px] border-4 border-white bg-white/90 px-5 py-7 text-center shadow-[0_10px_0_rgba(14,165,233,0.22)]">
      <p className="font-display text-2xl text-violet-800">📋 任务清单是空的</p>
      <p className="mt-1 text-sm font-extrabold text-sky-500">Your task list is empty</p>
      <p className="mt-4 text-base font-extrabold leading-relaxed text-violet-800">
        等妈妈或爸爸发布了新任务，你就可以开始赚积分啦！
      </p>
      <p className="mt-2 text-sm font-bold leading-relaxed text-sky-600">
        Wait for mom or dad to assign a task and start earning points!
      </p>
    </section>
  );
}
