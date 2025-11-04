import { Select, SelectProps } from '@mui/material';

export const StyledSelect = ({ ...props }: SelectProps<string>) => (
  <Select
    {...props}
    sx={{
      'width': '100%',
      'flex': 1,
      'height': 48,
      'borderRadius': '12px',
      'padding': '14px 12px 14px 12px',
      'gap': '10px',
      'background': 'rgba(255, 255, 255, 0.2)',
      'boxShadow': '0px 1px 1px 0px #1212121a',
      'fontFamily': 'Inter',
      'outline': 'none',
      '.MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
      '.MuiSelect-select': {
        padding: '0px',
      },
    }}
  />
);
