export interface Category {
  id: string;
  name: string;
  position: number;
  parentId?: string | null;   // ← debe tener esto
  parent?: { id: string; name: string } | null;
  children: Category[];
  _count?: { children: number };
}