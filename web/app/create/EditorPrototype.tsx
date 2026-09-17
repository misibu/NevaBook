"use client";

import { ChangeEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { assignPhotos, autoBuild, buildLayoutVariants, PhotoAsset, Spread } from "./layoutEngine";

type FilterMode = "all" | "unused";
type Snapshot = { spreads: Spread[]; currentSpread: number };

const MAX_SPREADS = 15;
const MIN_GAP = 1;
const MAX_GAP = 5;
const cloneSpreads = (spreads: Spread[]) => structuredClone(spreads) as Spread[];

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
  const [gapMm, setGapMm] = useState(2);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [status, setStatus] = useState("Добавьте фотографии и нажмите «Авторазмещение»");
  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
  const [redoStack, setRedoStack] = useState<Snapshot[]>([]);
  const [dragPhotoId, setDragPhotoId] = useState<string | null>(null);
  const cropDrag = useRef<{ itemIndex: number; x: number; y: number; focusX: number; focusY: number } | null>(null);

  const current = spreads[currentSpread];
  const photoMap = useMemo(() => new Map(photos.map(p => [p.id, p])), [photos]);
  const used = useMemo(() => new Set(spreads.flatMap(s => s.items.map(i => i.photoId))), [spreads]);
  const shownPhotos = useMemo(() => filter === "unused" ? photos.filter(p => !used.has(p.id)) : photos, [photos, used, filter]);
  const selectedPlaced = selectedItem !== null ? current?.items[selectedItem] : undefined;

  function pushUndo() {
    setUndoStack(stack => [...stack.slice(-29), { spreads: cloneSpreads(spreads), currentSpread }]);
    setRedoStack([]);
  }

  function undo() {
    setUndoStack(stack => {
      if (!stack.length) return stack;
      const prev = stack[stack.length - 1];
      setRedoStack(r => [...r, { spreads: cloneSpreads(spreads), currentSpread }]);
      setSpreads(cloneSpreads(prev.spreads));
      setCurrentSpread(prev.currentSpread);
      setSelectedItem(null);
      return stack.slice(0, -1);
    });
  }

  function redo() {
    setRedoStack(stack => {
      if (!stack.length) return stack;
      const next = stack[stack.length - 1];
      setUndoStack(u => [...u, { spreads: cloneSpreads(spreads), currentSpread }]);
      setSpreads(cloneSpreads(next.spreads));
      setCurrentSpread(next.currentSpread);
      setSelectedItem(null);
      return stack.slice(0, -1);
    });
  }

  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setStatus(`Загружаю: ${files.length} фото…`);
    const prepared = await Promise.all(files.map(file => new Promise<PhotoAsset>((resolve) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, url, width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => resolve({ id: crypto.randomUUID(), name: file.name, url, width: 1000, height: 1000 });
      image.src = url;
    })));
    setPhotos(p => [...p, ...prepared]);
    setStatus(`Загружено фото: ${photos.length + prepared.length}. Можно запускать авторазмещение.`);
    event.target.value = "";
  }

  function runAutoBuild() {
    if (!photos.length) { setStatus("Сначала добавьте фотографии."); return; }
    const safeSpreadCount = Math.min(MAX_SPREADS, Math.max(1, spreadCount));
    if (safeSpreadCount !== spreadCount) setSpreadCount(safeSpreadCount);
    if (photos.length < safeSpreadCount) { setStatus(`Фото меньше, чем разворотов. Уменьшите число разворотов до ${photos.length} или добавьте фото.`); return; }
    pushUndo();
    const next = autoBuild(photos, safeSpreadCount, gapMm);
    setSpreads(next.slice(0, MAX_SPREADS));
    setCurrentSpread(0);
    setSelectedItem(null);
    setStatus(`Готово: ${photos.length} фото / ${next.length} разворотов. Расстояние между фото — ${gapMm} мм.`);
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
        items: variants[layoutIndex] ? assignPhotos(spreadPhotos, variants[layoutIndex], sp.items) : sp.items,
      };
    });
    setSpreads(next);
    setSelectedItem(null);
    setStatus(`Расстояние между фотографиями изменено на ${nextGap} мм.`);
  }

  function setSelectedZoom(value: number) {
    if (selectedItem === null || !current) return;
    const zoom = Math.max(1, Math.min(2.5, value));
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
    if (selectedItem === null) next[currentSpread].items.forEach(i => { i.focusX = 0.5; i.focusY = 0.5; i.zoom = 1; });
    else {
      const item = next[currentSpread].items[selectedItem];
      if (item) { item.focusX = 0.5; item.focusY = 0.5; item.zoom = 1; }
    }
    setSpreads(next);
    setStatus(selectedItem === null ? "Кадрирование разворота сброшено." : "Кадрирование выбранного фото сброшено.");
  }

  function dropPhoto(targetIndex: number, photoId: string) {
    if (!current) return;
    const target = current.items[targetIndex];
    if (!target || target.photoId === photoId) return;
    pushUndo();
    const next = cloneSpreads(spreads);
    let source: { s: number; i: number } | null = null;
    next.some((sp, s) => sp.items.some((item, i) => {
      if (item.photoId === photoId) { source = { s, i }; return true; }
      return false;
    }));
    const oldTargetId = next[currentSpread].items[targetIndex].photoId;
    if (source) {
      const sourceItem = next[source.s].items[source.i];
      sourceItem.photoId = oldTargetId;
      sourceItem.focusX = 0.5;
      sourceItem.focusY = 0.5;
      sourceItem.zoom = 1;
    }
    const targetItem = next[currentSpread].items[targetIndex];
    targetItem.photoId = photoId;
    targetItem.focusX = 0.5;
    targetItem.focusY = 0.5;
    targetItem.zoom = 1;
    setSpreads(next);
    setStatus(source ? "Фото обменены местами." : "Фото заменено.");
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
      if (target?.tagName === "INPUT" || target?.tagName === "SELECT") return;
      if (e.key === "ArrowLeft" && currentSpread > 0) setCurrentSpread(v => v - 1);
      if (e.key === "ArrowRight" && currentSpread < spreads.length - 1) setCurrentSpread(v => v + 1);
      if (e.key === "ArrowUp") { e.preventDefault(); cycleLayout(-1); }
      if (e.key === "ArrowDown") { e.preventDefault(); cycleLayout(1); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const light = spreads.slice(0, MAX_SPREADS).map(s => ({ id: s.id, layoutIndex: s.layoutIndex, seed: s.seed, variants: s.variants, items: s.items.map(i => ({ ...i, zoom: i.zoom ?? 1 })) }));
        localStorage.setItem("nevabook-editor-draft-v3", JSON.stringify({ spreadCount: Math.min(spreadCount, MAX_SPREADS), gapMm, spreads: light }));
      } catch {}
    }, 500);
    return () => window.clearTimeout(timer);
  }, [spreads, spreadCount, gapMm]);

  return (
    <main className="proEditor">
      <header className="proEditorTopbar">
        <div className="editorProjectTitle"><span className="editorDot" /><div><strong>Моя фотокнига</strong><small>20 × 20 см · разворот 406 × 206 мм</small></div></div>
        <div className="editorTopControls">
          <label>Разворотов<select value={spreadCount} onChange={e => setSpreadCount(Math.min(MAX_SPREADS, Number(e.target.value)))}>{[5,8,10,12,15].map(v => <option key={v}>{v}</option>)}</select></label>
          <button className="editorGhostBtn" onClick={undo} disabled={!undoStack.length}>↶ Отменить</button>
          <button className="editorGhostBtn" onClick={redo} disabled={!redoStack.length}>↷ Вернуть</button>
          <button className="editorSaveBtn">Сохранено локально</button>
        </div>
      </header>

      <div className="proEditorWorkspace">
        <aside className="proPhotoBank">
          <div className="bankHeading"><div><span>ФОТОГРАФИИ</span><strong>{photos.length}</strong></div><label className="editorUploadBtn">+ Добавить<input hidden multiple accept="image/*" type="file" onChange={addPhotos} /></label></div>
          <div className="bankFilters"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Все</button><button className={filter === "unused" ? "active" : ""} onClick={() => setFilter("unused")}>Неиспользованные <b>{photos.length - used.size}</b></button></div>
          <div className="proPhotoGrid">{shownPhotos.map((photo, index) => <div className={`proPhotoThumb ${used.has(photo.id) ? "used" : ""}`} key={photo.id} draggable onDragStart={() => setDragPhotoId(photo.id)} onDragEnd={() => setDragPhotoId(null)}><img src={photo.url} alt={photo.name} /><span className="photoState">{used.has(photo.id) ? "✓" : index + 1}</span><span className="photoOrientation">{orientation(photo)}</span><small title={photo.name}>{photo.name}</small></div>)}{!photos.length && <div className="emptyBank">Загрузите фотографии.<br/>Они появятся здесь в два ряда.</div>}</div>
        </aside>

        <section className="proCanvasZone">
          <div className="layoutToolbar">
            <button className="autoBuildBtn" onClick={runAutoBuild}>✦ Авторазмещение</button>
            <button className="alternateLayoutBtn" onClick={() => cycleLayout(1)} disabled={!current}>↻ Другая раскладка</button>
            <div className="layoutCycle"><button onClick={() => cycleLayout(-1)} disabled={!current}>‹</button><span>{current ? `Макет ${current.layoutIndex + 1} / ${current.variants.length}` : "Варианты макета"}</span><button onClick={() => cycleLayout(1)} disabled={!current}>›</button></div>
            <button className="editorGhostBtn" onClick={resetCrop} disabled={!current}>Сбросить кадрирование</button>
          </div>
          <div className="canvasDesk">
            {!current ? <div className="editorStartCard"><span>NEVA-BOOK EDITOR</span><h1>Соберите первую<br/>раскладку.</h1><p>Добавьте фотографии, выберите количество разворотов и запустите авторазмещение.</p><button onClick={runAutoBuild}>✦ Авторазмещение</button><small>До 15 разворотов. Промежуток между фото регулируется от 1 до 5 мм.</small></div> :
            <div className="proSpread" aria-label={`Разворот ${currentSpread + 1}`}>{current.items.map((item, index) => { const photo = photoMap.get(item.photoId); if (!photo) return null; const zoom = item.zoom ?? 1; return <div key={`${item.photoId}-${index}`} className={`proSpreadSlot ${selectedItem === index ? "selected" : ""}`} style={{left:`${item.rect.x/406*100}%`,top:`${item.rect.y/206*100}%`,width:`${item.rect.w/406*100}%`,height:`${item.rect.h/206*100}%`}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(dragPhotoId)dropPhoto(index,dragPhotoId)}} onPointerDown={e=>onCropPointerDown(e,index)} onPointerMove={onCropPointerMove} onPointerUp={onCropPointerUp} onDoubleClick={()=>{pushUndo();setSpreads(prev=>{const next=cloneSpreads(prev);const x=next[currentSpread].items[index];x.focusX=x.focusY=.5;x.zoom=1;return next})}}><img draggable={false} src={photo.url} alt="" style={{objectPosition:`${item.focusX*100}% ${item.focusY*100}%`,transform:`scale(${zoom})`}}/><span className="slotNumber">{index+1}</span></div>})}<div className="foldLine"><span>сгиб</span></div><div className="safeLine leftSafe"/><div className="safeLine rightSafe"/></div>}
          </div>
          <div className="editorStatusBar"><span>{status}</span><span>← → развороты · «Другая раскладка» меняет макет · выберите фото для увеличения и кадрирования</span></div>
        </section>

        <aside className="proInspector">
          <div className="inspectorBlock"><span className="inspectorKicker">РАЗВОРОТ</span><strong>{current ? `${currentSpread+1} из ${spreads.length}` : "—"}</strong></div>
          <div className="inspectorBlock">
            <span className="inspectorKicker">ПАРАМЕТРЫ</span>
            <dl><div><dt>Размер</dt><dd>406 × 206 мм</dd></div><div><dt>Расстояние</dt><dd>{gapMm} мм</dd></div><div><dt>Печать</dt><dd>300 dpi</dd></div><div><dt>Подрезка</dt><dd>3 мм</dd></div></dl>
            <label className="editorRangeLabel"><span>Расстояние между фото</span><b>{gapMm} мм</b><input type="range" min={MIN_GAP} max={MAX_GAP} step={1} value={gapMm} onChange={e => changeGap(Number(e.target.value))}/><small>1 мм</small><small>5 мм</small></label>
          </div>
          <div className="inspectorBlock">
            <span className="inspectorKicker">ВЫБРАННОЕ ФОТО</span>
            {selectedPlaced ? <><strong className="selectedPhotoName">{photoMap.get(selectedPlaced.photoId)?.name}</strong><p>Перетаскивайте изображение внутри рамки. Слайдер увеличивает фотографию для точного кадрирования.</p><label className="editorRangeLabel zoomRange"><span>Масштаб</span><b>{Math.round((selectedPlaced.zoom ?? 1) * 100)}%</b><input type="range" min={100} max={250} step={5} value={Math.round((selectedPlaced.zoom ?? 1)*100)} onPointerDown={pushUndo} onChange={e => setSelectedZoom(Number(e.target.value)/100)}/><small>100%</small><small>250%</small></label><button className="inspectorAction" onClick={resetCrop}>Сбросить кадрирование</button></> : <p>Нажмите на фотографию в развороте, чтобы настроить её положение и масштаб.</p>}
          </div>
          <div className="inspectorBlock qualityBlock"><span className="qualityDot"/><div><strong>Контроль качества</strong><p>Проверка разрешения будет подключена вместе с серверным хранилищем оригиналов.</p></div></div>
          <div className="inspectorNext"><span>Следующий шаг</span><a href="/create/cover">Выбрать обложку <b>→</b></a><small>Макет книги сохранится локально.</small></div>
        </aside>
      </div>

      <section className="proTimeline"><div className="timelineHeader"><strong>РАЗВОРОТЫ</strong><span>{spreads.length || spreadCount} шт. · максимум {MAX_SPREADS}</span></div><div className="timelineRail">{spreads.slice(0, MAX_SPREADS).map((sp,index)=><button key={sp.id} className={`timelineSpread ${currentSpread===index?"active":""}`} onClick={()=>{setCurrentSpread(index);setSelectedItem(null)}}><div className="miniSpread">{sp.items.map((item,i)=><i key={i} style={{left:`${item.rect.x/406*100}%`,top:`${item.rect.y/206*100}%`,width:`${item.rect.w/406*100}%`,height:`${item.rect.h/206*100}%`,backgroundImage:`url(${photoMap.get(item.photoId)?.url||""})`,backgroundPosition:`${item.focusX*100}% ${item.focusY*100}%`}}/>)}</div><span>{index+1}</span></button>)}{!spreads.length&&Array.from({length:Math.min(spreadCount, MAX_SPREADS)}).map((_,i)=><button key={i} className="timelineSpread placeholder"><div className="miniSpread"/><span>{i+1}</span></button>)}</div></section>
    </main>
  );
}
