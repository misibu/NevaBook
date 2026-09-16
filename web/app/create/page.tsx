import type { Metadata } from "next";
import { EditorPrototype } from "./EditorPrototype";

export const metadata: Metadata = { title: "Конструктор", robots: { index: false, follow: false } };

export default function CreatePage() { return <EditorPrototype />; }
