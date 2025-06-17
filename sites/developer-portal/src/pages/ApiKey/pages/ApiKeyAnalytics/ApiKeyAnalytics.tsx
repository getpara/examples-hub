import { ContentWrapper } from '../../components/ContentWrapper';
import { Charts } from './components/Charts';
import { Overview } from './components/Overview';

export const ApiKeyAnalytics = () => {
  return (
    <ContentWrapper
      columnOne={
        <>
          <Overview />
          <Charts />
        </>
      }
      className="para:max-w-full"
    />
  );
};
