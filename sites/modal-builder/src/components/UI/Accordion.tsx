import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  ReactNode,
  MouseEvent,
  PropsWithChildren,
} from 'react';
import styled, { keyframes } from 'styled-components';
import { Text } from './StyledText';
import { CpslIcon } from '@getpara/react-components';
import { Switch } from './StyledSwitch';

interface AccordionContextProps {
  activeItem: string;
  toggleItem: (value: string) => void;
  hasMounted: boolean;
}

const AccordionContext = createContext<AccordionContextProps | undefined>(undefined);

interface AccordionItemContextProps {
  value: string;
  isEnabled: boolean;
  toggleEnabled: () => void;
  enableToggle: boolean;
}

const AccordionItemContext = createContext<AccordionItemContextProps | undefined>(undefined);

type AccordinoProp = {
  defaultActive?: string;
};

const Accordion: React.FC<PropsWithChildren<AccordinoProp>> = ({ children, defaultActive }) => {
  const [activeItem, setActiveItem] = useState<string>(defaultActive || '');
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  const animationDuration = 300; // Duration in milliseconds

  useEffect(() => {
    const timer = setTimeout(() => setHasMounted(true), animationDuration);
    return () => clearTimeout(timer);
  }, []);

  const toggleItem = (value: string) => {
    setActiveItem(prev => (prev === value ? '' : value));
  };

  return (
    <AccordionContext.Provider value={{ activeItem, toggleItem, hasMounted }}>
      <AccordionContainer className="accordion">{children}</AccordionContainer>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  value: string;
  enableToggle?: boolean;
  defaultToggle?: boolean;
  onToggleChange?: (value: string, isEnabled: boolean) => void;
}

const AccordionItem: React.FC<PropsWithChildren<AccordionItemProps>> = ({
  value,
  enableToggle = false,
  defaultToggle = true,
  onToggleChange,
  children,
}) => {
  const context = useContext(AccordionContext);
  const isOpen = context?.activeItem === value && context?.hasMounted;

  const [isEnabled, setIsEnabled] = useState<boolean>(defaultToggle);

  const toggleEnabled = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    if (enableToggle && onToggleChange) {
      onToggleChange(value, newEnabled);
    }
    if (!newEnabled && isOpen) {
      context?.toggleItem(value);
    }
  };

  return (
    <AccordionItemContext.Provider value={{ value, isEnabled, toggleEnabled, enableToggle }}>
      <AccordionItemContainer className={`accordion-item ${isOpen ? 'open' : ''}`}>{children}</AccordionItemContainer>
    </AccordionItemContext.Provider>
  );
};

interface AccordionTriggerProps {
  label: string;
  secondaryText?: string;
}

const AccordionTrigger: React.FC<AccordionTriggerProps> = ({ label, secondaryText }) => {
  const accordionContext = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);

  if (!accordionContext || !itemContext) {
    throw new Error('AccordionTrigger must be used within an AccordionItem and Accordion');
  }

  const { activeItem, toggleItem } = accordionContext;
  const { value, isEnabled, toggleEnabled, enableToggle } = itemContext;

  const isOpen = activeItem === value;

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    if (isEnabled) {
      toggleItem(value);
    }
  };

  const isVisible = isOpen && isEnabled && secondaryText;

  return (
    <AccordionTriggerContainer
      className={`accordion-trigger ${isOpen ? 'open' : ''}`}
      $isOpen={isOpen}
      $disabled={!isEnabled}
      $isVisible={!!isVisible}
      $enableToggle={enableToggle}
      onClick={handleClick}
    >
      <div className="trigger-row">
        <div className="label">
          <Text variant="bodyM" weight="semiBold">
            {label}
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {enableToggle && <Switch checked={isEnabled} onCheckedChange={toggleEnabled} />}
          <CpslIcon icon="chevronUp" />
        </div>
      </div>
      {secondaryText && (
        <Text variant="bodyS" weight="medium" color="secondary" className="secondary-text">
          {secondaryText}
        </Text>
      )}
    </AccordionTriggerContainer>
  );
};

interface AccordionContentProps {
  children: ReactNode;
}

const AccordionContent: React.FC<AccordionContentProps> = ({ children }) => {
  const accordionContext = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);

  if (!accordionContext || !itemContext) {
    throw new Error('AccordionContent must be used within an AccordionItem and Accordion');
  }

  const { activeItem } = accordionContext;
  const { value, isEnabled } = itemContext;

  const isOpen = activeItem === value && isEnabled;
  const [height, setHeight] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen, children]);

  return (
    <AccordionContentWrapper className={`accordion-content-wrapper ${isOpen ? 'open' : ''}`} $height={height}>
      <AccordionContentInner className="accordion-content" ref={contentRef}>
        {children}
      </AccordionContentInner>
    </AccordionContentWrapper>
  );
};

const slideIn = keyframes`
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const AccordionContainer = styled.div`
  animation: ${slideIn} 0.3s ease-out forwards;
  animation-delay: 0.05s;
`;

const AccordionItemContainer = styled.div`
  overflow: hidden;
  border-radius: 1rem;
  background-color: #ffffff;
  display: block;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05);
  margin-bottom: 0.5rem;
`;

const AccordionTriggerContainer = styled.div<{
  $isOpen: boolean;
  $disabled: boolean;
  $isVisible: boolean;
  $enableToggle: boolean;
}>`
  display: flex;
  flex-direction: column;
  padding: 1rem 1.5rem;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  background-color: #ffffff;
  opacity: ${props => (props.$disabled ? 0.6 : 1)};
  gap: ${props => (props.$isOpen ? '8px' : '0')};

  .trigger-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  cpsl-icon {
    transform: rotate(${props => (props.$isOpen ? '0deg' : '180deg')});
    transition: transform 0.3s ease-in-out;
    --icon-color: #000;
  }

  .secondary-text {
    opacity: ${props => (props.$isVisible ? '1' : '0')};
    max-height: ${props => (props.$isVisible ? '100px' : '0')};
    overflow: hidden;
    transition:
      opacity 0.3s ease,
      max-height 0.3s ease;
  }

  .trigger-row {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .label {
    flex: 1;
  }
`;

const AccordionContentWrapper = styled.div<{ $height: number }>`
  overflow: hidden;
  transition: height 0.3s ease-in-out;
  height: ${props => props.$height}px;
`;

const AccordionContentInner = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;
  transition: all 0.3s ease-in-out;

  & > :first-child {
    margin-top: 0;
  }

  & > :last-child {
    margin-bottom: 0;
  }
`;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
