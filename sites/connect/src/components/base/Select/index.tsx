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
      'boxShadow': '0 1px 1px 0 rgba(18, 18, 18, 0.1), 0 0 0 1px rgba(18, 18, 18, 0.1)',
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
