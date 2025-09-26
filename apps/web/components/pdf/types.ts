export interface Annotation {
  id: string;
  type: 'highlight' | 'note' | 'issue';
  pageNumber: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  content: string;
  color: string;
  author: string;
  timestamp: Date;
  selectedText?: string;
}

export interface PDFViewerProps {
  url: string;
  fileName: string;
  annotations?: Annotation[];
  onAnnotationChange: (annotations: Annotation[]) => void;
  readOnly?: boolean;
}

export interface AnnotationToolbarProps {
  activeMode: 'select' | 'highlight' | 'note' | 'issue';
  onModeChange: (mode: 'select' | 'highlight' | 'note' | 'issue') => void;
  onSave: () => void;
  onClear: () => void;
}

export interface PDFPageProps {
  pageNumber: number;
  scale: number;
  annotations: Annotation[];
  onAnnotationAdd: (annotation: Omit<Annotation, 'id' | 'timestamp'>) => void;
  onAnnotationUpdate: (id: string, updates: Partial<Annotation>) => void;
  onAnnotationDelete: (id: string) => void;
  activeMode: 'select' | 'highlight' | 'note' | 'issue';
}
