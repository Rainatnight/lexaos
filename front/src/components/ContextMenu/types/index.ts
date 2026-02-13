export interface IContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  parentId?: string | null;
}

export interface IMenuOption {
  label: string;
  value?: string;
  action?: () => void;
  submenu?: IMenuOption[];
  hasUnderline?: boolean;
  selected?: boolean;
}
