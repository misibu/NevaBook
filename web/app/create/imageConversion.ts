export type ConvertedPhoto = {
  file: File;
  width: number;
  height: number;
  sourceFormat: string;
};

const RAW_EXTENSIONS = new Set([
  "3fr", "ari", "arw", "bay", "cr2", "cr3", "crw", "dcr", "dng", "erf",
  "fff", "iiq", "k25", "kdc", "mef", "mos", "mrw", "nef", "nrw", "orf",
  "pef", "raf", "raw", "rw2", "rwl", "sr2", "srf", "srw", "x3f",
]);

const HEIC_EXTENSIONS = new Set(["heic", "heif", "hif"]);

export const PHOTO_ACCEPT = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp",
  "image/tiff", "image/heic", "image/heif",
  ".heic", ".heif", ".hif",
  ...Array.from(RAW_EXTENSIONS, ext => `.${ext}`),
].join(",");

function extension(name: string) {
  const part = name.toLowerCase().split(".").pop();
  return part && part !== name.toLowerCase() ? part : "";
}

function jpegName(name: string) {
  return name.replace(/\.[^.]+$/, "") + ".jpg";
}

function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.96) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error("Не удалось создать JPEG.")),
      "image/jpeg",
      quality,
    );
  });
}

async function imageBlobToJpeg(blob: Blob, outputName: string, lastModified: number): Promise<ConvertedPhoto> {
  let width = 0;
  let height = 0;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Браузер не поддерживает преобразование изображений.");

  if ("createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
      width = bitmap.width;
      height = bitmap.height;
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
    } catch {
      // Fall through to the HTMLImageElement path below.
    }
  }

  if (!width || !height) {
    const url = URL.createObjectURL(blob);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const next = new Image();
        next.onload = () => resolve(next);
        next.onerror = () => reject(new Error("Формат изображения не удалось прочитать."));
        next.src = url;
      });
      width = image.naturalWidth;
      height = image.naturalHeight;
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  const jpeg = await canvasToBlob(canvas);
  return {
    file: new File([jpeg], outputName, { type: "image/jpeg", lastModified }),
    width,
    height,
    sourceFormat: blob.type || "image",
  };
}

async function convertHeic(file: File): Promise<ConvertedPhoto> {
  const { heicTo } = await import("heic-to/next");
  const converted = await heicTo({
    blob: file,
    type: "image/jpeg",
    quality: 0.96,
  });
  if (!(converted instanceof Blob)) throw new Error("HEIC не удалось преобразовать в JPEG.");
  const result = await imageBlobToJpeg(converted, jpegName(file.name), file.lastModified);
  return { ...result, sourceFormat: extension(file.name).toUpperCase() || "HEIC" };
}

async function convertRaw(file: File): Promise<ConvertedPhoto> {
  const { default: LibRaw } = await import("libraw-wasm");
  const decoder = new LibRaw();

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    await decoder.open(bytes, {
      outputBps: 8,
      outputColor: 1,
      useCameraWb: true,
      useCameraMatrix: 1,
      userFlip: -1,
      noAutoBright: false,
    });

    const decoded = await decoder.imageData();
    if (!decoded?.data || !decoded.width || !decoded.height) {
      throw new Error("RAW-файл не удалось декодировать.");
    }

    const { width, height, colors, bits, data } = decoded;
    const rgba = new Uint8ClampedArray(width * height * 4);
    const max16 = bits > 8 ? 65535 : 255;
    const normalize = (value: number) => bits > 8 ? Math.round(value / max16 * 255) : value;

    for (let pixel = 0; pixel < width * height; pixel++) {
      const src = pixel * Math.max(1, colors);
      const dst = pixel * 4;
      if (colors <= 1) {
        const grey = normalize(Number(data[src] ?? 0));
        rgba[dst] = grey;
        rgba[dst + 1] = grey;
        rgba[dst + 2] = grey;
      } else {
        rgba[dst] = normalize(Number(data[src] ?? 0));
        rgba[dst + 1] = normalize(Number(data[src + 1] ?? data[src] ?? 0));
        rgba[dst + 2] = normalize(Number(data[src + 2] ?? data[src] ?? 0));
      }
      rgba[dst + 3] = 255;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Браузер не поддерживает преобразование RAW.");
    ctx.putImageData(new ImageData(rgba, width, height), 0, 0);

    const jpeg = await canvasToBlob(canvas);
    return {
      file: new File([jpeg], jpegName(file.name), { type: "image/jpeg", lastModified: file.lastModified }),
      width,
      height,
      sourceFormat: extension(file.name).toUpperCase() || "RAW",
    };
  } finally {
    decoder.dispose();
  }
}

export async function convertPhotoToJpeg(file: File): Promise<ConvertedPhoto> {
  const ext = extension(file.name);

  if (RAW_EXTENSIONS.has(ext)) return convertRaw(file);
  if (HEIC_EXTENSIONS.has(ext) || file.type === "image/heic" || file.type === "image/heif") {
    return convertHeic(file);
  }

  if (!file.type.startsWith("image/") && !["tif", "tiff"].includes(ext)) {
    throw new Error("Этот файл не является поддерживаемым изображением.");
  }

  const result = await imageBlobToJpeg(file, jpegName(file.name), file.lastModified);
  return { ...result, sourceFormat: ext.toUpperCase() || file.type || "IMAGE" };
}
