export default function PrivacyPolicyModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" className="absolute inset-0 bg-stone-900/45" aria-label="关闭" onClick={onClose} />
      <div className="ledger-sheet relative z-10 mx-4 mb-4 flex max-h-[86vh] w-full max-w-md flex-col rounded-[32px] border-4 border-white bg-white p-5 shadow-[0_12px_30px_rgba(194,65,12,0.2)]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-orange-700">隐私政策</h2>
            <p className="mt-1 text-sm font-bold text-orange-400">生效日期：2026年8月30日</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xl font-extrabold text-orange-600"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 text-sm font-bold leading-relaxed text-violet-800">
          <p>
            成长大冒险（以下简称“本应用”）非常重视用户的隐私。本隐私政策旨在向您说明，当您使用本应用时，我们如何处理您的信息。
          </p>
          <section>
            <h3 className="font-display text-lg text-orange-600">1. 我们收集的信息</h3>
            <p className="mt-1">本应用不收集、不存储、不上传任何您的个人信息至任何服务器。</p>
            <p className="mt-2">
              您在使用本应用时，所有数据（包括但不限于：注册账号、密码、任务记录、积分数据、游戏记录等）均仅保存在您当前设备的浏览器本地存储（localStorage）中。我们不会以任何形式收集、传输或使用这些数据。
            </p>
          </section>
          <section>
            <h3 className="font-display text-lg text-orange-600">2. 数据存储与安全</h3>
            <p className="mt-1">所有数据仅存储在您的本地设备中。</p>
            <p className="mt-2">您对您设备上的数据拥有完全的控制权。如果您清除浏览器缓存或数据，本应用中的相关记录可能会丢失。</p>
            <p className="mt-2">由于数据不存储在我们的服务器上，我们无法访问、恢复或管理您的个人数据。</p>
          </section>
          <section>
            <h3 className="font-display text-lg text-orange-600">3. 第三方服务</h3>
            <p className="mt-1">
              本应用使用 Netlify 进行托管。Netlify 可能会收集一些基础的访问信息（如IP地址、浏览器类型），但这些信息不涉及您的个人身份数据，且不受本应用控制。建议您查阅
              <a
                href="https://www.netlify.com/privacy/"
                target="_blank"
                rel="noreferrer"
                className="mx-1 text-fuchsia-600 underline"
              >
                Netlify 隐私政策
              </a>
              以了解详情。
            </p>
          </section>
          <section>
            <h3 className="font-display text-lg text-orange-600">4. 儿童隐私</h3>
            <p className="mt-1">
              本应用面向家庭使用。我们不会故意收集任何14岁以下儿童的个人信息。由于所有数据均存储在本地，我们无法识别或区分用户的年龄。家长应监督孩子的使用行为。
            </p>
          </section>
          <section>
            <h3 className="font-display text-lg text-orange-600">5. 隐私政策的变更</h3>
            <p className="mt-1">
              我们可能会不时更新本隐私政策。如有重大变更，我们会通过应用内的提示通知您。您继续使用本应用即表示您接受更新后的政策。
            </p>
          </section>
          <section>
            <h3 className="font-display text-lg text-orange-600">6. 联系我们</h3>
            <p className="mt-1">如果您对本隐私政策有任何疑问，请通过以下方式联系我们：</p>
            <p className="mt-2">
              📧 邮箱：
              <a href="mailto:annaning1@outlook.com" className="text-fuchsia-600 underline">
                annaning1@outlook.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
