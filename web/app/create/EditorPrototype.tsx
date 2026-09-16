"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { siteConfig } from "@/lib/site";

type Photo = { id: string; name: string; url: string };

export function EditorPrototype() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [status, setStatus] = useState("Черновик не сохранён");
  const firstFour = useMemo(() => photos.slice(0, 4), [photos]);

  function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    setPhotos((current) => [...current, ...files.map((file) => ({ id: crypto.randomUUID(), name: file.name, url: URL.createObjectURL(file) }))]);
  }

  async function saveProject() {
    setStatus("Сохраняю…");
    try {
      const response = await fetch(`${siteConfig.apiUrl}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Моя фотокнига", format: "20x20", coverType: "photo", layoutJson: JSON.stringify({ photoCount: photos.length }) }),
      });
      if (!response.ok) throw new Error("API unavailable");
      const project = await response.json();
      setProjectId(project.id);
      setStatus(`Сохранено: ${project.publicCode}`);
    } catch {
      setStatus("Каркас редактора работает; подключите API для сохранения.");
    }
  }

  return (
    <main className="editorShell">
      <aside className="photoPanel">
        <div><p className="eyebrow">ФОТОГРАФИИ</p><h1>Проект 20×20</h1></div>
        <label className="uploadButton">+ Добавить фото<input hidden multiple accept="image/*" type="file" onChange={addPhotos} /></label>
        <div className="photoGrid">{photos.map((photo) => <div className="photoThumb" key={photo.id}><img alt={photo.name} src={photo.url} /><span>{photo.name}</span></div>)}</div>
      </aside>
      <section className="canvasArea">
        <div className="editorToolbar"><span>Разворот 1</span><span className="saveStatus">{status}</span><button onClick={saveProject}>{projectId ? "Сохранено" : "Сохранить проект"}</button></div>
        <div className="spread" aria-label="Макет разворота 406 на 206 мм">
          {[0,1,2,3].map((index) => <div className="spreadSlot" key={index}>{firstFour[index] ? <img alt="" src={firstFour[index].url} /> : <span>Перетащите фото</span>}</div>)}
          <div className="centerLine" />
        </div>
        <div className="spreadInfo">406 × 206 мм · рабочий разворот · 3 мм подрезка по краям</div>
        <div className="timeline"><button className="spreadMini active">1</button><button className="spreadMini">2</button><button className="spreadMini">3</button><button className="addSpread">+</button></div>
      </section>
    </main>
  );
}
