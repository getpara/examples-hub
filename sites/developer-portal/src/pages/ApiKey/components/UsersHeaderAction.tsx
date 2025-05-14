import { Button, toast } from '@getpara/react-component-library';
import { useParams } from 'react-router-dom';
import { useApiKeyUsersCSV } from '../../../hooks/api/queries/useApiKeyUsersCSV';
import { FileDown } from 'lucide-react';
import { AxiosError } from 'axios';

export const UsersHeaderAction = () => {
  const { apiKey, env, projectId } = useParams();

  const { refetch, isFetching } = useApiKeyUsersCSV(projectId ?? '', apiKey ?? '', env ?? '');

  const handleClick = async () => {
    const { data, error } = await refetch({});

    if (error) {
      const errorText =
        (error as AxiosError).status === 429
          ? 'Rate limit exceeded, try again in a few minutes.'
          : 'If the problem persists, contact Para support.';

      toast.error('Failed to Download File', {
        description: errorText,
      });
      return;
    }

    if (data) {
      const blob = new Blob([data.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <Button variant="neutral" disabled={isFetching} isLoading={isFetching} onClick={handleClick}>
      Download .csv
      <FileDown />
    </Button>
  );
};
