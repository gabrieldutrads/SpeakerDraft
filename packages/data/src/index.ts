import { type CalendarEvent, type Outline, type StudyNote, type WorkspaceData } from "@speaker-draft/core";

const STORAGE_KEY = "speakerdraft.workspace.v1";

function readWorkspace(): WorkspaceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { outlines: [], notes: [], events: [] };
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null || !("outlines" in value) || !("notes" in value) || !("events" in value)) return { outlines: [], notes: [], events: [] };
    const workspace = value as WorkspaceData;
    if (!Array.isArray(workspace.outlines) || !Array.isArray(workspace.notes) || !Array.isArray(workspace.events)) return { outlines: [], notes: [], events: [] };
    return workspace;
  } catch {
    return { outlines: [], notes: [], events: [] };
  }
}

function writeWorkspace(workspace: WorkspaceData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

export const workspaceStore = {
  load: readWorkspace,
  saveOutline(outline: Outline): void {
    const workspace = readWorkspace();
    const index = workspace.outlines.findIndex((item) => item.id === outline.id);
    if (index < 0) workspace.outlines.unshift(outline);
    else workspace.outlines[index] = outline;
    writeWorkspace(workspace);
  },
  addNote(note: StudyNote): void {
    const workspace = readWorkspace();
    workspace.notes.unshift(note);
    writeWorkspace(workspace);
  },
  addEvent(event: CalendarEvent): void {
    const workspace = readWorkspace();
    workspace.events.push(event);
    workspace.events.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
    writeWorkspace(workspace);
  },
};
