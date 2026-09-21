"use client";

import { ChangeEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { assignPhotos, autoBuild, buildLayoutVariants, makeEmptySpread, PhotoAsset, Spread } from "./layoutEngine";
import { preparePhotoForEditor, PHOTO_ACCEPT } from "./imageConversion";

type FilterMode = "all" | "unused";
type Snapshot = { spreads: Spread[]; currentSpread: number };
type BookSize = "20x20" | "30x30";
type CoverType = "photo" | "fabric";

const MAX_SPREADS = 15;
const MIN_SPREADS = 5;
const MIN_GAP = 1;
const MAX_GAP = 5;

const BASE_PRICE = 2500;
const FABRIC_EXTRA = 700;
const SIZE_30_EXTRA = 1500;
const EXTRA_SPREAD = 150;

const cloneSpreads = (spreads: Spread[]) => structuredClone(spreads) as Spread[];
const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
const clampSpreadCount = (value: number) => Math.max(MIN_SPREADS, Math.min(MAX_SPREADS, Math.round(value)));

function orientation(photo: PhotoAsset) {
  const a = photo.width / Math.max(1, photo.height);
  if (a >= 1.08) return "Г";
  if (a <= 0.92) return "В";
  return "К";
}

export function EditorPrototype() {
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [spreads, setSpreads] = useState<Spread[]>([]);
  const [spreadCount, setSpreadCount] = useState(10);
  const [bookSize, setBookSize] = useState<BookSize>("20x20");
  const [coverType, setCoverType] = useState<CoverType>("photo");
  const [gapMm, setGapMm] = useState(2);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [status, setStatus] = useState("Загрузите фото или перетащите снимок на пустой разворот");
  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
  const [redoStack, setRedoStack] = useState<Snapshot[]>([]);
  const [dragPhotoId, setDragPhotoId] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const originalFiles = useRef(new Map<string, File>());
  const previewUrls = useRef<string[]>([]);
  const cropDrag = useRef<{ itemIndex: number; x: number; y: number; focusX: number; focusY: number } | null>(null);
  const initialized = useRef(false);

  const current = spreads[currentSpread];
  const photoMap = useMemo(() => new Map(photos.map(p => [p.id, p])), [photos]);
  const used = useMemo(() => new Set(spreads.flatMap(s => s.items.map(i => i.photoId))), [spreads]);
  const shownPhotos = useMemo(() => filter === "unused" ? photos.filter(p => !used.has(p.id)) : photos, [photos, used, filter]);
  const selectedPlaced = selectedItem !== null ? current?.items[selectedItem] : undefined;
  const actualSpreadCount = clampSpreadCount(spreads.length || spreadCount);
  const bookPrice = useMemo(() => (
    BASE_PRICE
    + (bookSize === "30x30" ? SIZE_30_EXTRA : 0)
    + (coverType === "fabric" ? FABRIC_EXTRA : 0)
    + Math.max(0, actualSpreadCount - 5) * EXTRA_SPREAD
  ), [bookSize, coverType, actualSpreadCount]);

  useEffect(() => {
    return () => {
      previewUrls.current.forEach(url => URL.revokeObjectURL(url));
      previewUrls.current = [];
      originalFiles.current.clear();
    };
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let size: BookSize = "20x20";
    let cover: CoverType = "photo";
    let count = 10;

    try {
      const saved = JSON.parse(localStorage.getItem("nevabook-photobook-order") || "{}");
      if (saved.size === "30x30") size = "30x30";
      if (saved.cover === "fabric") cover = "fabric";
      if (Number.isFinite(Number(saved.spreads))) count = clampSpreadCount(Number(saved.spreads));
    } catch {}

    const params = new URLSearchParams(window.location.search);
    if (params.get("size") === "30x30") size = "30x30";
    if (params.get("size") === "20x20") size = "20x20";
    if (params.get("cover") === "fabric") cover = "fabric";
    if (params.get("cover") === "photo") cover = "photo";
    if (params.get("spreads")) count = clampSpreadCount(Number(params.get("spreads")));

    setBookSize(size);
    setCoverType(cover);
    setSpreadCount(count);
    setSpreads(Array.from({ length: count }, (_, index) => makeEmptySpread(Date.now() + index * 911)));
    setStatus(`Книга создана: ${count} разворотов. Добавляйте фото вручную или используйте авторазмещение.`);
  }, []);

  function pushUndo() {
    setUndoStack(stack => [...stack.slice(-29), { spreads: cloneSpreads(spreads), currentSpread }]);
    setRedoStack([]);
  }

  function restoreSnapshot(snapshot: Snapshot) {
    const next = cloneSpreads(snapshot.spreads);
    setSpreads(next);
    setSpreadCount(clampSpreadCount(next.length || spreadCount));
    setCurrentSpread(Math.min(snapshot.currentSpread, Math.max(0, next.length - 1)));
    setSelectedItem(null);
  }

  function undo() {
    setUndoStack(stack => {
      if (!stack.length) return stack;
      const prev = stack[stack.length - 1];
      setRedoStack(r => [...r, { spreads: cloneSpreads(spreads), currentSpread }]);
      restoreSnapshot(prev);
      return stack.slice(0, -1);
    });
  }

  function redo() {
    setRedoStack(stack => {
      if (!stack.length) return stack;
      const next = stack[stack.length - 1];
      setUndoStack(u => [...u, { spreads: cloneSpreads(spreads), currentSpread }]);
      restoreSnapshot(next);
      return stack.slice(0, -1);
    });
  }

  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length || converting) return;

    setConverting(true);
    let added = 0;
    const failed: string[] = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      setStatus(`Подготовка превью ${index + 1} из ${files.length}: ${file.name}`);

      try {
        const prepared = await preparePhotoForEditor(file);
        const id = crypto.randomUUID();
        const previewUrl = URL.createObjectURL(prepared.preview);

        // Keep the untouched source file for the future S3/original-upload stage.
        originalFiles.current.set(id, prepared.original);
        previewUrls.current.push(previewUrl);

        const asset: PhotoAsset = {
          id,
          name: prepared.original.name,
          url: previewUrl,
          width: prepared.width,
          height: prepared.height,
          sourceFormat: prepared.sourceFormat,
          previewKind: prepared.previewKind,
        };

        // Add progressively: common JPG/PNG/WebP files appear without waiting
        // for the rest of a large selection to finish.
        setPhotos(previous => [...previous, asset]);
        added += 1;
      } catch (error) {
        console.error("Photo preview preparation failed", file.name, error);
        failed.push(file.name);
      }
    }

    setConverting(false);

    if (failed.length) {
      setStatus(`Добавлено: ${added}. Не удалось подготовить: ${failed.slice(0, 3).join(", ")}${failed.length > 3 ? "…" : ""}`);
    } else {
      setStatus(`Добавлено ${added} фото. Оригиналы не изменены; конструктор использует быстрые превью.`);
    }
  }

  function spreadWithPhotoIds(spread: Spread, photoIds: string[], previousItems = spread.items): Spread {
    const spreadPhotos = photoIds.map(id => photoMap.get(id)).filter(Boolean) as PhotoAsset[];
    if (!spreadPhotos.length) {
      return { ...spread, variants: [], layoutIndex: 0, items: [] };
    }

    const seed = Date.now() + spreadPhotos.length * 997 + currentSpread * 131;
    const variants = buildLayoutVariants(spreadPhotos, 406, 206, gapMm, seed, 36);
    return {
      ...spread,
      seed,
      variants,
      layoutIndex: 0,
      items: variants[0] ? assignPhotos(spreadPhotos, variants[0], previousItems) : [],
    };
  }

  function addPhotoToCurrentSpread(photoId: string) {
    if (!photoMap.has(photoId)) return;

    const targetIndex = current ? currentSpread : 0;
    const baseSpreads = spreads.length ? cloneSpreads(spreads) : [makeEmptySpread()];
    const target = baseSpreads[targetIndex] ?? baseSpreads[0];

    const source = (() => {
      for (let s = 0; s < baseSpreads.length; s++) {
        const i = baseSpreads[s].items.findIndex(item => item.photoId === photoId);
        if (i >= 0) return { spread: s, item: i };
      }
      return null;
    })();

    if (source?.spread === targetIndex) {
      setSelectedItem(source.item);
      setStatus("Это фото уже находится на текущем развороте.");
      return;
    }

    pushUndo();

    if (source) {
      const sourceSpread = baseSpreads[source.spread];
      const remaining = sourceSpread.items.filter(item => item.photoId !== photoId).map(item => item.photoId);
      baseSpreads[source.spread] = spreadWithPhotoIds(sourceSpread, remaining, sourceSpread.items);
    }

    const targetSpread = baseSpreads[targetIndex] ?? makeEmptySpread();
    const targetIds = [...targetSpread.items.map(item => item.photoId), photoId];
    baseSpreads[targetIndex] = spreadWithPhotoIds(targetSpread, targetIds, targetSpread.items);

    setSpreads(baseSpreads);
    setSpreadCount(clampSpreadCount(baseSpreads.length));
    setCurrentSpread(targetIndex);
    const placedIndex = baseSpreads[targetIndex].items.findIndex(item => item.photoId === photoId);
    setSelectedItem(placedIndex >= 0 ? placedIndex : null);
    setStatus(source
      ? "Фото перенесено на разворот. Раскладка автоматически перестроена."
      : "Фото добавлено. Раскладка разворота автоматически перестроена.");
  }

  function removeSelectedPhoto() {
    if (!current || selectedItem === null) {
      setStatus("Сначала выберите фото на развороте.");
      return;
    }

    const selected = current.items[selectedItem];
    if (!selected) return;

    pushUndo();
    const next = cloneSpreads(spreads);
    const remaining = next[currentSpread].items
      .filter((_, index) => index !== selectedItem)
      .map(item => item.photoId);

    next[currentSpread] = spreadWithPhotoIds(next[currentSpread], remaining, next[currentSpread].items);
    setSpreads(next);
    setSelectedItem(null);
    setStatus("Фото удалено с разворота и снова доступно в фотобанке.");
  }

  function addSpread() {
    if (spreads.length >= MAX_SPREADS) {
      setStatus("Достигнут максимум: 15 разворотов.");
      return;
    }

    pushUndo();
    const next = [...cloneSpreads(spreads), makeEmptySpread(Date.now() + spreads.length * 911)];
    setSpreads(next);
    setSpreadCount(next.length);
    setCurrentSpread(next.length - 1);
    setSelectedItem(null);
    setStatus(`Добавлен разворот ${next.length}. Стоимость книги пересчитана.`);
  }

  function changeSpreadCount(value: number) {
    const count = clampSpreadCount(value);
    if (count === spreads.length) {
      setSpreadCount(count);
      return;
    }

    if (count < spreads.length) {
      const removedWithPhotos = spreads.slice(count).some(spread => spread.items.length > 0);
      if (removedWithPhotos && !window.confirm("Последние развороты содержат фотографии. Уменьшить количество и вернуть эти фото в фотобанк?")) {
        return;
      }
    }

    pushUndo();
    const next = cloneSpreads(spreads);
    if (count > next.length) {
      for (let i = next.length; i < count; i++) next.push(makeEmptySpread(Date.now() + i * 911));
    } else {
      next.splice(count);
    }

    setSpreads(next);
    setSpreadCount(count);
    setCurrentSpread(index => Math.min(index, count - 1));
    setSelectedItem(null);
    setStatus(`Количество разворотов: ${count}. Стоимость пересчитана.`);
  }

  function runAutoBuild() {
    if (!photos.length) {
      setStatus("Сначала добавьте фотографии.");
      return;
    }

    const safeSpreadCount = clampSpreadCount(spreads.length || spreadCount);
    pushUndo();
    const next = autoBuild(photos, safeSpreadCount, gapMm).slice(0, MAX_SPREADS);
    setSpreads(next);
    setSpreadCount(next.length);
    setCurrentSpread(0);
    setSelectedItem(null);
    setStatus(`Готово: ${photos.length} фото распределено по ${next.length} разворотам. Пустые развороты сохранены.`);
  }

  function cycleLayout(delta: number) {
    if (!current?.variants.length) return;
    pushUndo();
    const next = cloneSpreads(spreads);
    const sp = next[currentSpread];
    sp.layoutIndex = (sp.layoutIndex + delta + sp.variants.length) % sp.variants.length;
    const spreadPhotos = sp.items.map(i => photoMap.get(i.photoId)).filter(Boolean) as PhotoAsset[];
    sp.items = assignPhotos(spreadPhotos, sp.variants[sp.layoutIndex], sp.items);
    setSpreads(next);
    setSelectedItem(null);
    setStatus(`Разворот ${currentSpread + 1}: новая раскладка ${sp.layoutIndex + 1}/${sp.variants.length}.`);
  }

  function changeGap(value: number) {
    const nextGap = Math.max(MIN_GAP, Math.min(MAX_GAP, Math.round(value)));
    if (nextGap === gapMm) return;
    setGapMm(nextGap);

    if (!spreads.length) {
      setStatus(`Расстояние между фотографиями: ${nextGap} мм.`);
      return;
    }

    pushUndo();
    const next = spreads.map(sp => {
      const spreadPhotos = sp.items.map(i => photoMap.get(i.photoId)).filter(Boolean) as PhotoAsset[];
      const variants = buildLayoutVariants(spreadPhotos, 406, 206, nextGap, sp.seed, 36);
      const layoutIndex = Math.min(sp.layoutIndex, Math.max(0, variants.length - 1));
      return {
        ...sp,
        variants,
        layoutIndex,
        items: variants[layoutIndex] ? assignPhotos(spreadPhotos, variants[layoutIndex], sp.items) : [],
      };
    });

    setSpreads(next);
    setSelectedItem(null);
    setStatus(`Расстояние между фотографиями изменено на ${nextGap} мм.`);
  }

  function setSelectedZoom(value: number) {
    if (selectedItem === null || !current) return;
    const zoom = Math.max(1, Math.min(3, value));
    setSpreads(prev => {
      const next = cloneSpreads(prev);
      const item = next[currentSpread]?.items[selectedItem];
      if (!item) return prev;
      item.zoom = zoom;
      return next;
    });
  }

  function resetCrop() {
    if (!current) return;
    pushUndo();
    const next = cloneSpreads(spreads);

    if (selectedItem === null) {
      next[currentSpread].items.forEach(i => { i.focusX = 0.5; i.focusY = 0.5; i.zoom = 1; });
    } else {
      const item = next[currentSpread].items[selectedItem];
      if (item) { item.focusX = 0.5; item.focusY = 0.5; item.zoom = 1; }
    }

    setSpreads(next);
    setStatus(selectedItem === null ? "Кадрирование разворота сброшено." : "Кадрирование выбранного фото сброшено.");
  }

  function onCropPointerDown(e: ReactPointerEvent<HTMLDivElement>, itemIndex: number) {
    if (!current) return;
    const item = current.items[itemIndex];
    cropDrag.current = { itemIndex, x: e.clientX, y: e.clientY, focusX: item.focusX, focusY: item.focusY };
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelectedItem(itemIndex);
  }

  function onCropPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = cropDrag.current;
    if (!drag || !current) return;
    const dx = (e.clientX - drag.x) / Math.max(80, e.currentTarget.clientWidth);
    const dy = (e.clientY - drag.y) / Math.max(80, e.currentTarget.clientHeight);
    setSpreads(prev => {
      const next = cloneSpreads(prev);
      const item = next[currentSpread]?.items[drag.itemIndex];
      if (!item) return prev;
      const zoom = item.zoom ?? 1;
      item.focusX = Math.max(0, Math.min(1, drag.focusX - dx / zoom));
      item.focusY = Math.max(0, Math.min(1, drag.focusY - dy / zoom));
      return next;
    });
  }

  function onCropPointerUp() {
    if (cropDrag.current) {
      setStatus("Положение фото сохранено.");
      cropDrag.current = null;
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "SELECT" || target?.tagName === "TEXTAREA") return;

      if (e.key === "ArrowLeft" && currentSpread > 0) setCurrentSpread(v => v - 1);
      if (e.key === "ArrowRight" && currentSpread < spreads.length - 1) setCurrentSpread(v => v + 1);
      if (e.key === "ArrowUp") { e.preventDefault(); cycleLayout(-1); }
      if (e.key === "ArrowDown") { e.preventDefault(); cycleLayout(1); }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedItem !== null) {
        e.preventDefault();
        removeSelectedPhoto();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const light = spreads.slice(0, MAX_SPREADS).map(s => ({
          id: s.id,
          layoutIndex: s.layoutIndex,
          seed: s.seed,
          variants: s.variants,
          items: s.items.map(i => ({ ...i, zoom: i.zoom ?? 1 })),
        }));
        localStorage.setItem("nevabook-editor-draft-v4", JSON.stringify({
          spreadCount: Math.min(spreads.length || spreadCount, MAX_SPREADS),
          gapMm,
          bookSize,
          coverType,
          spreads: light,
        }));
      } catch {}
    }, 500);
    return () => window.clearTimeout(timer);
  }, [spreads, spreadCount, gapMm, bookSize, coverType]);

  return (
    <main className="proEditor">
      <header className="proEditorTopbar">
        <div className="editorProjectTitle">
          <span className="editorDot" />
          <div><strong>Моя фотокнига</strong><small>{bookSize === "20x20" ? "20 × 20 см" : "30 × 30 см"} · до {MAX_SPREADS} разворотов</small></div>
        </div>

        <div className="editorTopControls">
          <label>
            Разворотов
            <select value={spreads.length || spreadCount} onChange={e => changeSpreadCount(Number(e.target.value))}>
              {Array.from({ length: MAX_SPREADS - MIN_SPREADS + 1 }, (_, i) => MIN_SPREADS + i).map(v => <option key={v}>{v}</option>)}
            </select>
          </label>
          <button className="editorGhostBtn" onClick={undo} disabled={!undoStack.length}>↶ Отменить</button>
          <button className="editorGhostBtn" onClick={redo} disabled={!redoStack.length}>↷ Вернуть</button>
          <button className="editorSaveBtn">Сохранено локально</button>
        </div>
      </header>

      <div className="proEditorWorkspace">
        <aside className="proPhotoBank">
          <div className="bankHeading">
            <div><span>ФОТОГРАФИИ</span><strong>{photos.length}</strong></div>
            <label className={`editorUploadBtn ${converting ? "disabled" : ""}`}>
              {converting ? "Подготовка…" : "+ Добавить"}
              <input hidden multiple disabled={converting} accept={PHOTO_ACCEPT} type="file" onChange={addPhotos} />
            </label>
          </div>

          <div className="bankFilters">
            <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Все</button>
            <button className={filter === "unused" ? "active" : ""} onClick={() => setFilter("unused")}>Неиспользованные <b>{photos.length - used.size}</b></button>
          </div>

          <div className="proPhotoGrid">
            {shownPhotos.map((photo, index) => (
              <div
                className={`proPhotoThumb ${used.has(photo.id) ? "used" : ""}`}
                key={photo.id}
                draggable
                onDragStart={() => setDragPhotoId(photo.id)}
                onDragEnd={() => setDragPhotoId(null)}
              >
                <img src={photo.url} alt={photo.name} />
                <span className="photoState">{used.has(photo.id) ? "✓" : index + 1}</span>
                <span className="photoOrientation">{orientation(photo)}</span>
                <small title={photo.name}>{photo.name}</small>
              </div>
            ))}
            {!photos.length && (
              <div className="emptyBank">
                Загрузите JPG, PNG, WebP, HEIC или RAW.<br />
                Оригинал сохраняется без изменений; редактор показывает быстрое превью.
              </div>
            )}
          </div>
        </aside>

        <section className="proCanvasZone">
          <div className="layoutToolbar">
            <button className="autoBuildBtn" onClick={runAutoBuild}>✦ Авторазмещение</button>
            <button className="deletePhotoBtn" onClick={removeSelectedPhoto} disabled={!selectedPlaced}>✕ Удалить фото</button>
            <button className="alternateLayoutBtn" onClick={() => cycleLayout(1)} disabled={!current?.items.length}>↻ Другая раскладка</button>

            <div className="layoutCycle">
              <button onClick={() => cycleLayout(-1)} disabled={!current?.variants.length}>‹</button>
              <span>{current?.variants.length ? `Макет ${current.layoutIndex + 1} / ${current.variants.length}` : "Пустой разворот"}</span>
              <button onClick={() => cycleLayout(1)} disabled={!current?.variants.length}>›</button>
            </div>

            <button className="editorGhostBtn" onClick={resetCrop} disabled={!current?.items.length}>Сбросить кадрирование</button>
          </div>

          <div
            className={`canvasDesk ${dragPhotoId ? "acceptingPhoto" : ""}`}
            onDragOver={e => { if (dragPhotoId) e.preventDefault(); }}
            onDrop={e => {
              e.preventDefault();
              if (dragPhotoId) addPhotoToCurrentSpread(dragPhotoId);
              setDragPhotoId(null);
            }}
          >
            {!current ? (
              <div className="editorStartCard">
                <span>NEVA-BOOK EDITOR</span>
                <h1>Соберите первую<br />раскладку.</h1>
                <p>Добавьте фотографии. JPG, PNG и WebP открываются напрямую; для HEIC и RAW создаётся только рабочее превью.</p>
                <button onClick={runAutoBuild}>✦ Авторазмещение</button>
                <small>До 15 разворотов. Промежуток между фото регулируется от 1 до 5 мм.</small>
              </div>
            ) : (
              <div
                className={`proSpread ${dragPhotoId ? "dragReady" : ""}`}
                aria-label={`Разворот ${currentSpread + 1}`}
              >
                {!current.items.length && (
                  <div className="emptySpreadDrop">
                    <strong>Перетащите фото сюда</strong>
                    <span>При добавлении каждого нового фото раскладка перестраивается автоматически.</span>
                  </div>
                )}

                {current.items.map((item, index) => {
                  const photo = photoMap.get(item.photoId);
                  if (!photo) return null;
                  const zoom = item.zoom ?? 1;

                  return (
                    <div
                      key={`${item.photoId}-${index}`}
                      className={`proSpreadSlot ${selectedItem === index ? "selected" : ""}`}
                      style={{
                        left: `${item.rect.x / 406 * 100}%`,
                        top: `${item.rect.y / 206 * 100}%`,
                        width: `${item.rect.w / 406 * 100}%`,
                        height: `${item.rect.h / 206 * 100}%`,
                      }}
                      onPointerDown={e => onCropPointerDown(e, index)}
                      onPointerMove={onCropPointerMove}
                      onPointerUp={onCropPointerUp}
                      onDoubleClick={() => {
                        pushUndo();
                        setSpreads(prev => {
                          const next = cloneSpreads(prev);
                          const placed = next[currentSpread].items[index];
                          placed.focusX = placed.focusY = 0.5;
                          placed.zoom = 1;
                          return next;
                        });
                      }}
                    >
                      <img
                        draggable={false}
                        src={photo.url}
                        alt=""
                        style={{
                          objectPosition: `${item.focusX * 100}% ${item.focusY * 100}%`,
                          transform: `scale(${zoom})`,
                        }}
                      />
                      <span className="slotNumber">{index + 1}</span>
                    </div>
                  );
                })}

                <div className="foldLine"><span>сгиб</span></div>
                <div className="safeLine leftSafe" />
                <div className="safeLine rightSafe" />
              </div>
            )}
          </div>

          <div className="editorStatusBar">
            <span>{status}</span>
            <span>Перетащите фото из банка на разворот · Delete удаляет выбранное фото · ← → меняют разворот</span>
          </div>
        </section>

        <aside className="proInspector">
          <div className="inspectorBlock">
            <span className="inspectorKicker">РАЗВОРОТ</span>
            <strong>{current ? `${currentSpread + 1} из ${spreads.length}` : "—"}</strong>
          </div>

          <div className="inspectorBlock">
            <span className="inspectorKicker">ПАРАМЕТРЫ</span>
            <dl>
              <div><dt>Размер</dt><dd>406 × 206 мм</dd></div>
              <div><dt>Расстояние</dt><dd>{gapMm} мм</dd></div>
              <div><dt>Печать</dt><dd>300 dpi</dd></div>
              <div><dt>Подрезка</dt><dd>3 мм</dd></div>
            </dl>
            <label className="editorRangeLabel">
              <span>Расстояние между фото</span><b>{gapMm} мм</b>
              <input type="range" min={MIN_GAP} max={MAX_GAP} step={1} value={gapMm} onChange={e => changeGap(Number(e.target.value))} />
              <small>1 мм</small><small>5 мм</small>
            </label>
          </div>

          <div className="inspectorBlock">
            <span className="inspectorKicker">ВЫБРАННОЕ ФОТО</span>
            {selectedPlaced ? (
              <>
                <strong className="selectedPhotoName">{photoMap.get(selectedPlaced.photoId)?.name}</strong>
                <p>Перетаскивайте изображение внутри рамки. Слайдер меняет размер выбранной фотографии внутри ячейки.</p>
                <label className="editorRangeLabel zoomRange">
                  <span>Размер фото</span><b>{Math.round((selectedPlaced.zoom ?? 1) * 100)}%</b>
                  <input
                    type="range"
                    min={100}
                    max={300}
                    step={5}
                    value={Math.round((selectedPlaced.zoom ?? 1) * 100)}
                    onPointerDown={pushUndo}
                    onChange={e => setSelectedZoom(Number(e.target.value) / 100)}
                  />
                  <small>100%</small><small>300%</small>
                </label>
                <button className="inspectorAction" onClick={resetCrop}>Сбросить кадрирование</button>
              </>
            ) : (
              <p>Нажмите на фотографию в развороте, чтобы изменить её размер и положение.</p>
            )}
          </div>

          <div className="inspectorBlock qualityBlock">
            <span className="qualityDot" />
            <div>
              <strong>Контроль качества</strong>
              <p>Оригинальный файл сохраняется без изменений. Для RAW используется встроенное превью камеры, для HEIC — облегчённое JPEG-превью. Проверку эффективного DPI подключим к оригиналу.</p>
            </div>
          </div>

          <div className="inspectorNext">
            <span>Следующий шаг</span>
            <a href="/create/cover">Выбрать обложку <b>→</b></a>
            <small>Макет книги сохранится локально.</small>
          </div>
        </aside>
      </div>

      <section className="proTimeline">
        <div className="timelineHeader">
          <strong>РАЗВОРОТЫ</strong>
          <span>{spreads.length || spreadCount} шт. · максимум {MAX_SPREADS}</span>
        </div>

        <div className="timelineRail">
          {spreads.slice(0, MAX_SPREADS).map((sp, index) => (
            <button
              key={sp.id}
              className={`timelineSpread ${currentSpread === index ? "active" : ""}`}
              onClick={() => { setCurrentSpread(index); setSelectedItem(null); }}
            >
              <div className="miniSpread">
                {sp.items.map((item, i) => (
                  <i
                    key={i}
                    style={{
                      left: `${item.rect.x / 406 * 100}%`,
                      top: `${item.rect.y / 206 * 100}%`,
                      width: `${item.rect.w / 406 * 100}%`,
                      height: `${item.rect.h / 206 * 100}%`,
                      backgroundImage: `url(${photoMap.get(item.photoId)?.url || ""})`,
                      backgroundPosition: `${item.focusX * 100}% ${item.focusY * 100}%`,
                    }}
                  />
                ))}
              </div>
              <span>{index + 1}</span>
            </button>
          ))}

          <button className="timelineAddSpread" onClick={addSpread} disabled={spreads.length >= MAX_SPREADS}>
            <b>＋</b>
            <span>Добавить<br />разворот</span>
          </button>
        </div>

        <aside className="editorPriceBlock">
          <span>СТОИМОСТЬ КНИГИ</span>
          <strong>{money(bookPrice)}</strong>
          <small>
            {bookSize === "20x20" ? "20 × 20" : "30 × 30"} · {coverType === "fabric" ? "тканевая обложка" : "фотообложка"} · {actualSpreadCount} разворотов
          </small>
        </aside>
      </section>
    </main>
  );
}
