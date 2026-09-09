export const DEFAULT_CHILD_AVATAR = "🧒";

export function isPhotoAvatar(avatar) {
  return typeof avatar === "string" && avatar.startsWith("data:image");
}

export default function ChildAvatar({ avatar, fallback = DEFAULT_CHILD_AVATAR, className = "", textClassName = "" }) {
  if (isPhotoAvatar(avatar)) {
    return <img src={avatar} alt="" className={`rounded-full object-cover ${className}`} />;
  }
  return <span className={textClassName || className}>{avatar || fallback}</span>;
}
