import { ContentWrapper } from '../../components/ContentWrapper';
import { Charts } from './components/Charts';
import { Overview } from './components/Overview';

export const ApiKeyAnalytics = () => {
  return (
    <ContentWrapper>
      <Overview />
      <Charts />
    </ContentWrapper>
  );
};
