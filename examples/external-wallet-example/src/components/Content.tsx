import { useAccount, useClient } from '@getpara/react-sdk';
import { useProfileBalance, useIssueJwt } from '@getpara/react-sdk-lite';
import { SolanaProfile } from './SolanaProfile';
import { CpslText, CpslCard, CpslButton } from '@getpara/react-components';
import styled from 'styled-components';
import { EvmProfile } from './EvmProfile';
import { CosmosProfile } from './CosmosProfile';
import { ParaProfile } from './ParaProfile';
import { FloatingModalOpener } from './FloatingModalOpener';
import { useEffect, useRef, useState } from 'react';

export const Content = () => {
  const { isLoading } = useAccount();

  return (
    <Container>
      {isLoading ? (
        <CpslText>Loading...</CpslText>
      ) : (
        <InnerContainer>
          <FloatingModalOpener />
          <WalletStatusPanel>
            <ConsoleDisplay />
            <SectionCard>
              <CpslText variant="headingXS" weight="semiBold">
                Status & Profiles
              </CpslText>
              <ProfileSection>
                <ParaProfile />
                <EvmProfile />
                <CosmosProfile />
                <SolanaProfile />
              </ProfileSection>
            </SectionCard>
            <ParaClientDisplay />
            <BalanceDisplay />
            <JwtDisplay />
          </WalletStatusPanel>
        </InnerContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding: 16px 16px 0 16px;
  word-wrap: break-word;
  min-height: 100%;

  @media (max-width: 1023px) {
    padding-top: 0; /* Remove top padding since FloatingModalOpener is fixed */
  }
`;

const InnerContainer = styled.div`
  flex: 1;
  gap: 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  width: 100%;
  max-width: 100%;

  @media (max-width: 1023px) {
    padding-top: 200px; /* Space for fixed FloatingModalOpener with padding */
  }

  @media (max-width: 640px) {
    padding-top: 220px; /* More space on very small screens */
  }
`;

const WalletStatusPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const SectionCard = styled(CpslCard)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// Balance Display Component
const BalanceDisplayContainer = styled.div`
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: var(--cpsl-color-text-primary);
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 400px;
  overflow-y: auto;
  margin-top: 8px;
  padding: 12px;
  background: var(--cpsl-color-background-16);
  border: 1px solid var(--cpsl-color-border);
  border-radius: 4px;
`;

const BalanceDisplay = () => {
  const { data: profileBalance, isLoading, error, isSuccess } = useProfileBalance();

  if (isLoading) {
    return (
      <SectionCard>
        <CpslText variant="headingXS" weight="semiBold">
          Profile Balance (JSON)
        </CpslText>
        <BalanceDisplayContainer>Loading balance data...</BalanceDisplayContainer>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard>
        <CpslText variant="headingXS" weight="semiBold">
          Profile Balance (JSON)
        </CpslText>
        <BalanceDisplayContainer>
          <span style={{ color: 'var(--cpsl-color-error)' }}>Error: {error.message}</span>
        </BalanceDisplayContainer>
      </SectionCard>
    );
  }

  if (!isSuccess || !profileBalance) {
    return (
      <SectionCard>
        <CpslText variant="headingXS" weight="semiBold">
          Profile Balance (JSON)
        </CpslText>
        <BalanceDisplayContainer>null</BalanceDisplayContainer>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      <CpslText variant="headingXS" weight="semiBold">
        Profile Balance (JSON)
      </CpslText>
      <BalanceDisplayContainer>{JSON.stringify(profileBalance, null, 2)}</BalanceDisplayContainer>
    </SectionCard>
  );
};

// Para Client Display Component
const ParaClientDisplay = () => {
  const para = useClient();

  return (
    <SectionCard>
      <CpslText variant="headingXS" weight="semiBold">
        Para Client
      </CpslText>
      <BalanceDisplayContainer>{para?.toString() || 'Loading...'}</BalanceDisplayContainer>
    </SectionCard>
  );
};

// JWT Display Component
const JwtDisplay = () => {
  const { issueJwtAsync, data: jwtData, isPending, error } = useIssueJwt();
  const { isConnected } = useAccount();
  const [decodedToken, setDecodedToken] = useState<any>(null);

  const handleIssueJwt = async () => {
    try {
      const result = await issueJwtAsync();
      console.log('JWT Result:', result);
      if (result?.token) {
        // Decode the JWT token (just the payload part)
        try {
          const parts = result.token.split('.');
          if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
          }
          const payload = JSON.parse(atob(parts[1]));
          console.log('Decoded payload:', payload);
          setDecodedToken(payload);
        } catch (decodeError) {
          console.error('Failed to decode JWT:', decodeError);
          setDecodedToken({ error: 'Failed to decode JWT token' });
        }
      }
    } catch (err) {
      console.error('Failed to issue JWT:', err);
    }
  };

  // Automatically issue JWT when user becomes connected
  useEffect(() => {
    if (isConnected) {
      handleIssueJwt();
    }
  }, [isConnected]);

  return (
    <SectionCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <CpslText variant="headingXS" weight="semiBold">
          JWT Token
        </CpslText>
        <CpslButton onClick={handleIssueJwt} disabled={isPending}>
          {isPending ? 'Issuing JWT...' : 'Issue JWT'}
        </CpslButton>
      </div>

      {error && (
        <BalanceDisplayContainer>
          <span style={{ color: 'var(--cpsl-color-error)' }}>Error: {error.message}</span>
        </BalanceDisplayContainer>
      )}

      {(jwtData?.token || decodedToken) && (
        <BalanceDisplayContainer>
          {jwtData?.token && (
            <div style={{ marginBottom: '12px' }}>
              <strong>Raw Token:</strong>
              <div style={{ wordBreak: 'break-all', fontSize: '11px', marginTop: '4px' }}>{jwtData.token}</div>
            </div>
          )}
          {decodedToken && !decodedToken.error && (
            <div>
              <strong>Decoded Payload:</strong>
              <pre style={{ marginTop: '4px', fontSize: '11px' }}>{JSON.stringify(decodedToken, null, 2)}</pre>
            </div>
          )}
          {decodedToken?.error && (
            <div>
              <span style={{ color: 'var(--cpsl-color-error)' }}>{decodedToken.error}</span>
            </div>
          )}
        </BalanceDisplayContainer>
      )}
    </SectionCard>
  );
};

const ConsoleLogContainer = styled.div`
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: var(--cpsl-color-text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  height: calc(20 * 1.4em); /* 20 lines at 1.4 line height */
  overflow-y: auto;
  padding: 12px;
  background: var(--cpsl-color-background-16);
  border: 1px solid var(--cpsl-color-border);
  border-radius: 4px;
  position: relative;
`;

const LogEntry = styled.div<{ level: 'log' | 'warn' | 'error' | 'info' }>`
  margin-bottom: 2px;
  color: ${props => {
    switch (props.level) {
      case 'error':
        return 'var(--cpsl-color-error)';
      case 'warn':
        return '#ff9500';
      case 'info':
        return '#007aff';
      default:
        return 'var(--cpsl-color-text-primary)';
    }
  }};
`;

const ConsoleDisplay = () => {
  const [logs, setLogs] = useState<Array<{ message: string; level: 'log' | 'warn' | 'error' | 'info'; timestamp: string }>>(
    [],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const originalConsole = useRef<typeof console>();

  useEffect(() => {
    // Store original console methods
    originalConsole.current = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
    } as typeof console;

    // Helper function to safely stringify arguments
    const stringifyArg = (arg: any): string => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'function') return `[Function: ${arg.name || 'anonymous'}]`;

      if (typeof arg === 'object') {
        try {
          const seen = new Set();
          return JSON.stringify(
            arg,
            (key, value) => {
              if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                  return '[Circular Reference]';
                }
                seen.add(value);
              }
              return value;
            },
            2,
          );
        } catch {
          return '[Object - Cannot stringify]';
        }
      }

      return String(arg);
    };

    // Override console methods
    const addLog = (level: 'log' | 'warn' | 'error' | 'info', args: any[]) => {
      const message = args.map(stringifyArg).join(' ');
      const timestamp = new Date().toLocaleTimeString();

      setLogs(prevLogs => {
        const newLogs = [...prevLogs, { message, level, timestamp }];
        // Keep only the last 1000 logs to prevent memory issues
        return newLogs.slice(-1000);
      });
    };

    // Override console methods
    console.log = (...args) => {
      originalConsole.current?.log(...args);
      addLog('log', args);
    };

    console.warn = (...args) => {
      originalConsole.current?.warn(...args);
      addLog('warn', args);
    };

    console.error = (...args) => {
      originalConsole.current?.error(...args);
      addLog('error', args);
    };

    console.info = (...args) => {
      originalConsole.current?.info(...args);
      addLog('info', args);
    };

    // Cleanup function to restore original console
    return () => {
      if (originalConsole.current) {
        console.log = originalConsole.current.log;
        console.warn = originalConsole.current.warn;
        console.error = originalConsole.current.error;
        console.info = originalConsole.current.info;
      }
    };
  }, []);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <SectionCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <CpslText variant="headingXS" weight="semiBold">
          Console Logs ({logs.length})
        </CpslText>
        <CpslButton onClick={clearLogs} variant="outline">
          Clear Logs
        </CpslButton>
      </div>
      <ConsoleLogContainer ref={containerRef}>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--cpsl-color-text-secondary)', fontStyle: 'italic' }}>No console logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <LogEntry key={index} level={log.level}>
              <span style={{ color: 'var(--cpsl-color-text-secondary)' }}>[{log.timestamp}] </span>
              {log.message}
            </LogEntry>
          ))
        )}
      </ConsoleLogContainer>
    </SectionCard>
  );
};
