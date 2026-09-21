export type PreparedPhoto = {
  original: File;
  preview: Blob;
  width: number;
  height: number;
  sourceFormat: string;
  previewKind: "original" | "embedded" | "generated";
};

const RAW_EXTENSIONS = new Set([
  "3fr", "ari", "arw", "bay", "cr2", "cr3", "crw", "dcr", "dng", "erf",
  "fff", "iiq", "k25", "kdc", "mef", "mos", "mrw", "nef", "nrw", "orf",
  "pef", "raf", "raw", "rw2", "rwl", "sr2", "srf", "srw", "x3f",
]);

const HEIC_EXTENSIONS = new Set(["heic", "heif", "hif"]);
const DIRECT_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "bmp"]);

export const PHOTO_ACCEPT = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp",
  "image/heic", "image/heif",
  ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp",
  ".heic", ".heif", ".hif",
  ...Array.from(RAW_EXTENSIONS, ext => `.${ext}`),
].join(",");

function extension(name: string) {
  const lower = name.toLowerCase();
  const part = lower.split(".").pop();
  return part && part !== lower ? part : "";
}

function sourceFormat(file: File) {
  const ext = extension(file.name);
  return (ext || file.type.replace(/^image\//, "") || "IMAGE").toUpperCase();
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality = 0.86) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error("Не удалось создать JPEG-превью.")),
      "image/jpeg",
      quality,
    );
  });
}

async function getImageSize(blob: Blob) {
  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const next = new Image();
      next.onload = () => resolve(next);
      next.onerror = () => reject(new Error("Браузер не смог прочитать изображение."));
      next.src = url;
    });
    return { width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function makeSmallJpegPreview(blob: Blob, maxEdge = 2200, quality = 0.86) {
  const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Браузер не поддерживает создание превью.");

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    return {
      blob: await canvasToJpeg(canvas, quality),
      width,
      height,
    };
  } finally {
    bitmap.close();
  }
}

async function prepareDirectImage(file: File): Promise<PreparedPhoto> {
  const { width, height } = await getImageSize(file);
  return {
    original: file,
    preview: file,
    width,
    height,
    sourceFormat: sourceFormat(file),
    previewKind: "original",
  };
}

async function prepareHeic(file: File): Promise<PreparedPhoto> {
  const { heicTo } = await import("heic-to/next");
  const decoded = await heicTo({
    blob: file,
    type: "image/jpeg",
    quality: 0.82,
  });

  if (!(decoded instanceof Blob)) {
    throw new Error("HEIC/HEIF не удалось прочитать.");
  }

  const preview = await makeSmallJpegPreview(decoded, 2200, 0.84);
  return {
    original: file,
    preview: preview.blob,
    width: preview.width,
    height: preview.height,
    sourceFormat: sourceFormat(file),
    previewKind: "generated",
  };
}

function bitmapThumbnailToJpeg(data: Uint8Array, width: number, height: number) {
  if (!width || !height) throw new Error("RAW-превью имеет неизвестный размер.");

  const pixelCount = width * height;
  const rgba = new Uint8ClampedArray(pixelCount * 4);

  if (data.length >= pixelCount * 3) {
    for (let i = 0; i < pixelCount; i++) {
      const src = i * 3;
      const dst = i * 4;
      rgba[dst] = data[src];
      rgba[dst + 1] = data[src + 1];
      rgba[dst + 2] = data[src + 2];
      rgba[dst + 3] = 255;
    }
  } else if (data.length >= pixelCount) {
    for (let i = 0; i < pixelCount; i++) {
      const value = data[i];
      const dst = i * 4;
      rgba[dst] = value;
      rgba[dst + 1] = value;
      rgba[dst + 2] = value;
      rgba[dst + 3] = 255;
    }
  } else {
    throw new Error("Не удалось прочитать встроенное RAW-превью.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Браузер не поддерживает RAW-превью.");
  ctx.putImageData(new ImageData(rgba, width, height), 0, 0);
  return canvasToJpeg(canvas, 0.86);
}

async function prepareRaw(file: File): Promise<PreparedPhoto> {
  // LibRaw lives in /public/vendor/libraw and is loaded only when a RAW file is selected.
  const moduleUrl = "/vendor/libraw/index.js";
  const libRawModule = await import(/* webpackIgnore: true */ moduleUrl);

  type RawThumb = {
    data: Uint8Array;
    width: number;
    height: number;
    format: "jpeg" | "bitmap" | "unknown";
  };

  type RawImage = {
    width: number;
    height: number;
    colors: number;
    bits: number;
    data: Uint8Array | Uint16Array;
  };

  const LibRaw = libRawModule.default as new () => {
    open(bytes: Uint8Array, settings?: Record<string, unknown>): Promise<void>;
    thumbnailData(): Promise<RawThumb | undefined>;
    imageData(): Promise<RawImage | undefined>;
    dispose(): void;
  };

  const decoder = new LibRaw();

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());

    // open_buffer parses the RAW container but does not perform full demosaicing.
    await decoder.open(bytes, {
      outputBps: 8,
      outputColor: 1,
      useCameraWb: true,
      useCameraMatrix: 1,
      userFlip: -1,
    });

    const thumb = await decoder.thumbnailData();

    if (thumb?.data?.length && thumb.width > 0 && thumb.height > 0) {
      if (thumb.format === "jpeg") {
        return {
          original: file,
          preview: new Blob([thumb.data], { type: "image/jpeg" }),
          width: thumb.width,
          height: thumb.height,
          sourceFormat: sourceFormat(file),
          previewKind: "embedded",
        };
      }

      if (thumb.format === "bitmap") {
        return {
          original: file,
          preview: await bitmapThumbnailToJpeg(thumb.data, thumb.width, thumb.height),
          width: thumb.width,
          height: thumb.height,
          sourceFormat: sourceFormat(file),
          previewKind: "embedded",
        };
      }
    }

    // Rare fallback: some RAW files do not contain an embedded usable preview.
    // Only then do the expensive full decode.
    const decoded = await decoder.imageData();
    if (!decoded?.data || !decoded.width || !decoded.height) {
      throw new Error("RAW не содержит доступного превью.");
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
    if (!ctx) throw new Error("Браузер не поддерживает RAW.");
    ctx.putImageData(new ImageData(rgba, width, height), 0, 0);

    const decodedBlob = await canvasToJpeg(canvas, 0.84);
    const preview = await makeSmallJpegPreview(decodedBlob, 2200, 0.84);

    return {
      original: file,
      preview: preview.blob,
      width: preview.width,
      height: preview.height,
      sourceFormat: sourceFormat(file),
      previewKind: "generated",
    };
  } finally {
    decoder.dispose();
  }
}

export async function preparePhotoForEditor(file: File): Promise<PreparedPhoto> {
  const ext = extension(file.name);

  if (RAW_EXTENSIONS.has(ext)) {
    return prepareRaw(file);
  }

  if (HEIC_EXTENSIONS.has(ext) || file.type === "image/heic" || file.type === "image/heif") {
    return prepareHeic(file);
  }

  if (DIRECT_IMAGE_EXTENSIONS.has(ext) || [
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp",
  ].includes(file.type)) {
    return prepareDirectImage(file);
  }

  throw new Error("Формат пока не поддерживается.");
}
