import { cx } from "@/lib/classNames";

const PICKER_ICONS = {
  "caret-right": {
    viewBox: "0 0 256 256",
    paths: ["M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"],
  },
  clock: {
    viewBox: "0 0 256 256",
    paths: ["M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"],
  },
  "globe-simple": {
    viewBox: "0 0 256 256",
    paths: ["M128,24h0A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm87.62,96H175.79C174,83.49,159.94,57.67,148.41,42.4A88.19,88.19,0,0,1,215.63,120ZM96.23,136h63.54c-2.31,41.61-22.23,67.11-31.77,77C118.45,203.1,98.54,177.6,96.23,136Zm0-16C98.54,78.39,118.46,52.89,128,43c9.55,9.93,29.46,35.43,31.77,77Zm11.36-77.6C96.06,57.67,82,83.49,80.21,120H40.37A88.19,88.19,0,0,1,107.59,42.4ZM40.37,136H80.21c1.82,36.51,15.85,62.33,27.38,77.6A88.19,88.19,0,0,1,40.37,136Zm108,77.6c11.53-15.27,25.56-41.09,27.38-77.6h39.84A88.19,88.19,0,0,1,148.41,213.6Z"],
  },
  "para-mark": {
    viewBox: "0 0.11 25.14 23.71",
    paths: ["M16.7506 0.114342H7.01716V13.267C7.01716 14.2305 6.24304 15.0128 5.28576 15.0128H0V23.8289H8.74337V18.4992C8.74337 17.5357 9.51749 16.7534 10.4748 16.7534H16.8854C21.4904 16.7534 25.2124 12.9517 25.1363 8.29101C25.0603 3.63032 21.2761 0.114342 16.7506 0.114342Z"],
  },
} as const;

export type PickerIconName = keyof typeof PICKER_ICONS;

interface PickerIconProps {
  name: PickerIconName;
  className?: string;
}

export function PickerIcon({ name, className }: PickerIconProps) {
  const icon = PICKER_ICONS[name];

  return (
    <svg
      viewBox={icon.viewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={cx("flex-none", className ?? "size-icon-sm")}>
      {icon.paths.map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
