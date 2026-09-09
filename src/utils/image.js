const MAX_DATA_URL_CHARS = 700_000;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
}

function loadHtmlImage(src, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.src = "";
      reject(new Error("图片解码超时，请换一张照片试试"));
    }, timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("这张照片无法预览，请改用相册里的 JPG/PNG"));
    };
    img.src = src;
  });
}

async function sourceFromFile(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      try {
        return await createImageBitmap(file);
      } catch {
        // fall through to FileReader
      }
    }
  }
  const dataUrl = await readFileAsDataUrl(file);
  return loadHtmlImage(dataUrl);
}

function drawToCanvas(source, maxSize) {
  const width = source.width || source.naturalWidth || 1;
  const height = source.height || source.naturalHeight || 1;
  const scale = Math.min(1, maxSize / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("当前浏览器无法处理图片");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function exportJpeg(canvas, quality) {
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  if (!dataUrl || !dataUrl.startsWith("data:image")) {
    throw new Error("图片压缩失败，请再拍一张");
  }
  return dataUrl;
}

export const MAX_AVATAR_FILE_BYTES = 2 * 1024 * 1024;

export async function compressImage(file, maxSize = 960) {
  if (!file) throw new Error("没有选择图片");
  if (!String(file.type || "").startsWith("image/")) {
    throw new Error("请选择图片文件");
  }
  const source = await sourceFromFile(file);
  let size = maxSize;
  let quality = 0.72;
  let dataUrl = "";

  try {
    for (let i = 0; i < 6; i += 1) {
      const canvas = drawToCanvas(source, size);
      dataUrl = exportJpeg(canvas, quality);
      if (dataUrl.length <= MAX_DATA_URL_CHARS) break;
      quality = Math.max(0.45, quality - 0.1);
      size = Math.max(96, Math.round(size * 0.75));
    }
  } finally {
    if (typeof source.close === "function") source.close();
  }

  if (!dataUrl || dataUrl.length > MAX_DATA_URL_CHARS * 1.4) {
    throw new Error("照片太大了，请靠近一点再拍，或从相册选一张小图");
  }
  return dataUrl;
}

export async function compressAvatarImage(file) {
  if (file?.size > MAX_AVATAR_FILE_BYTES) {
    throw new Error("图片不能超过 2MB，请换一张小一点的照片");
  }
  return compressImage(file, 256);
}
