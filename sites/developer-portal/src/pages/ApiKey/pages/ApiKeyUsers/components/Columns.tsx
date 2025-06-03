import { ColumnDef } from '@tanstack/react-table';
import { UsersTableData } from '../../../../../types/api';
import { LOGIN_METHOD_CONFIG } from '../../../../../utils/constants';
import { formatDate } from '../../../../../utils/formatDate';
import { Badge, cn, Skeleton } from '@getpara/react-component-library';
import { formatWalletAddress } from '../../../../../utils/formatWalletAddress';

const baseSkeleton = 'para:h-3.5 para:w-2xs para:rounded para:bg-foreground/10';

export const getColumns = (isLoading?: boolean): ColumnDef<UsersTableData>[] => {
  return [
    {
      accessorFn: d => d.userId ?? d.pregenWalletId,
      header: 'UUID',
      ...(isLoading && {
        cell: () => <Skeleton className={baseSkeleton} />,
      }),
    },
    {
      accessorFn: d => d.email ?? d.phoneNumber ?? d.farcasterUsername ?? d.userId ?? d.pregenIdentifier,
      header: 'Identifier',
      ...(isLoading && {
        cell: () => <Skeleton className={baseSkeleton} />,
      }),
    },
    {
      accessorFn: d => LOGIN_METHOD_CONFIG[d.lastMethod].label,
      header: 'Last Login Method',
      ...(isLoading && {
        cell: () => <Skeleton className={cn(baseSkeleton, 'para:w-24')} />,
      }),
    },
    {
      accessorFn: d => formatDate(d.firstCreated),
      header: 'Created',
      ...(isLoading && {
        cell: () => <Skeleton className={cn(baseSkeleton, 'para:w-24')} />,
      }),
    },
    {
      accessorKey: 'walletAddresses',
      header: () => <div className="para:text-right">Address</div>,
      cell: isLoading
        ? () => <Skeleton className={cn(baseSkeleton, 'para:w-24 para:h-[22px] para:ml-auto')} />
        : ({ row }) => {
            const addresses = row.getValue<string[]>('walletAddresses').filter(a => !!a);

            const shownAddresses = addresses.slice(0, 2);
            const numRemainingAddresses = addresses.length - 2;

            return (
              <div className="para:flex para:flex-wrap para:gap-1 para:justify-end">
                {shownAddresses.map(address => (
                  <Badge className="para:font-semibold" variant="outline" key={address}>
                    {formatWalletAddress(address)}
                  </Badge>
                ))}
                {numRemainingAddresses > 0 && (
                  <div className="para:basis-auto para:w-full para:flex para:justify-end">
                    <Badge className="para:font-semibold" variant="outline">{`+${numRemainingAddresses} More`}</Badge>
                  </div>
                )}
              </div>
            );
          },
    },
  ];
};
