import { IconType } from '../../interface.js';

export interface DropdownInputEventDetail {
  icon: IconType;
  label: string;
  value: string;
  selectedLabel?: string;
}
