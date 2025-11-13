import { ScrollArea, Separator, Typography } from '@getpara/react-component-library';
import { Section } from './Section';

type MessageProps = { message: string };

export const Message = ({ message }: MessageProps) => {
  return (
    <>
      <Section label="Message">
        <ScrollArea className="para:p-2 para:rounded para:bg-muted para:border para:border-border para:w-full para:text-xs para:font-[DM_Mono] para:max-h-[50dvh] para:overflow-y-auto para:overflow-x-hidden">
          <Typography
            color="secondary"
            className="para:text-sm para:font-[DM_Mono] para:whitespace-pre-wrap para:w-full para:min-w-0 break-anywhere"
          >
            {message}
          </Typography>
        </ScrollArea>
      </Section>
      <Separator />
    </>
  );
};
