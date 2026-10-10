export type OutlineStatus = "draft" | "ready";

export interface Outline {
  id: string;
  title: string;
  reference: string;
  category: string;
  updatedAt: string;
  status: OutlineStatus;
  content: string;
}

export interface StudyNote {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  kind: string;
  reference: string;
}

export interface WorkspaceData {
  outlines: Outline[];
  notes: StudyNote[];
  events: CalendarEvent[];
}

export const demoWorkspace: WorkspaceData = {
  outlines: [
    { id: "demo-hope", title: "Esperança em tempos de espera", reference: "Salmo 27:14", category: "Mensagem", updatedAt: "2026-10-08T14:00:00.000Z", status: "draft", content: "A espera também pode ser um lugar de formação.\n\n1. A espera revela onde está nossa confiança\nQuando os caminhos parecem silenciosos, voltamos o coração para aquilo que permanece.\n\n2. Coragem também é permanecer\nA fidelidade se constrói nas pequenas decisões de cada dia." },
    { id: "demo-grace", title: "A graça que nos encontra", reference: "Efésios 2:8–9", category: "Estudo", updatedAt: "2026-10-06T16:30:00.000Z", status: "ready", content: "A graça é presente, não conquista.\n\n1. Somos alcançados\n2. Vivemos com gratidão" },
    { id: "demo-service", title: "Chamados para servir", reference: "Marcos 10:45", category: "Estudo", updatedAt: "2026-10-03T10:00:00.000Z", status: "draft", content: "O serviço cristão nasce do amor e segue o exemplo de Jesus." },
  ],
  notes: [],
  events: [],
};
