import { HexAlphaColorPicker } from 'react-colorful';

import styled from 'styled-components';
import { CpslPopover } from '@getpara/react-components';

interface ColorPickerPopoverProps {
  id: string;
  color?: string;
  onChange?: (newColor: string) => void;
}

export const ColorPickerPopover = ({ id, color, onChange }: ColorPickerPopoverProps) => {
  return (
    <Container id={id} slot="end">
      <Swatch style={{ backgroundColor: color || 'black' }} />
      <Popover trigger={id} transformOriginHorizontal="center">
        <HexAlphaColorPicker color={color || '#000'} onChange={onChange} />
      </Popover>
    </Container>
  );
};

const Container = styled.div`
  height: 20px;
  width: 20px;

  padding: 4px;
`;

const Swatch = styled.div`
  height: 100%;
  width: 100%;
  border-radius: 4px;
  border: 1px solid black;
`;

const Popover = styled(CpslPopover)`
  height: 232px;
  width: 232px !important;
  display: flex;
  justify-content: center;
  align-items: center;
`;
