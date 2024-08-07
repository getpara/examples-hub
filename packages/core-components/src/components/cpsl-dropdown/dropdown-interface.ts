import { IconType } from '../../interface';

export interface DropdownInputEventDetail {
  icon: IconType;
  label: string;
  value: string;
  selectedLabel?: string;
}
