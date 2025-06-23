import { CirclePlay, FileText, LayoutDashboard, LucideIcon } from 'lucide-react';
import { FlatCard } from '../../../components/FlatCard';
import { Button, Typography } from '@getpara/react-component-library';
import { DOCS_LINK, EXAMPLES_HUB_LINK, MODAL_DESIGNER_LINK } from '../../../utils/constants';
import { Link } from 'react-router-dom';

const REFERENCES: { Icon: LucideIcon; title: string; btnText: string; link: string }[] = [
  {
    Icon: FileText,
    title: 'Read The Docs',
    btnText: 'Go to Docs',
    link: DOCS_LINK,
  },
  {
    Icon: CirclePlay,
    title: 'Try The Demo',
    btnText: 'Try it out',
    link: MODAL_DESIGNER_LINK,
  },
  {
    Icon: LayoutDashboard,
    title: 'Examples Hub',
    btnText: 'See Examples',
    link: EXAMPLES_HUB_LINK,
  },
];

export const EmptyStateReferences = () => {
  return (
    <div className="para:flex para:flex-col para:md:flex-row para:gap-2 para:items-center">
      {REFERENCES.map(({ Icon, title, btnText, link }) => (
        <FlatCard key={title} className="para:p-4 para:lg:p-4 para:gap-3.5 para:flex-1 para:w-full">
          <div className="para:flex para:flex-col para:gap-2">
            <div className="para:p-1.5 para:rounded-full para:bg-muted para:w-fit">
              <Icon className="para:size-5" />
            </div>
            <Typography className="para:text-xl para:font-semibold">{title}</Typography>
          </div>
          <div>
            <Link to={link} target="_blank">
              <Button variant="neutral">{btnText}</Button>
            </Link>
          </div>
        </FlatCard>
      ))}
    </div>
  );
};
