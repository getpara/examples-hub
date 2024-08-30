import { AddIcon, ArrowDownIcon, ArrowUpIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { Button, Flex, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import { Dispatch, Fragment, PropsWithChildren, ReactNode, SetStateAction } from 'react';

export function ArrayField<T>({
  value,
  onChange,
  remaining,
  excludeAdded = false,
  rowTitle,
  rowEnd,
  rowChild,
}: PropsWithChildren<{
  value: T[] | undefined;
  remaining?: T[];
  excludeAdded?: boolean;
  onChange: Dispatch<SetStateAction<T[]>>;
  onAdd: (_: T) => void;
  rowTitle: (_: T) => ReactNode;
  rowEnd?: (_: T) => ReactNode;
  rowChild?: (_: T) => ReactNode;
}>) {
  return (
    <VStack flexGrow={1} w="100%">
      {value?.length > 0 ? (
        value.map((item, index) => {
          return (
            <Fragment key={`${item.toString()}`}>
              <HStack w="100%" flexGrow={1} borderRadius="lg" bgColor="lightblue" py={1} px={2} h="48px">
                <Text flexGrow={1}>{rowTitle(item)}</Text>
                <Flex flexGrow={1}>{rowEnd && rowEnd(item)}</Flex>
                <HStack>
                  <IconButton
                    aria-label="Move up"
                    isDisabled={index === 0 || value.length === 1}
                    icon={<ArrowUpIcon />}
                    onClick={() => {
                      onChange(prev => [
                        ...prev.slice(0, index - 1),
                        prev[index],
                        prev[index - 1],
                        ...prev.slice(index + 1),
                      ]);
                    }}
                  />
                  <IconButton
                    aria-label="Move down"
                    isDisabled={index === value.length - 1 || value.length === 1}
                    icon={<ArrowDownIcon />}
                    onClick={() => {
                      onChange(prev => [...prev.slice(0, index), prev[index + 1], prev[index], ...prev.slice(index + 2)]);
                    }}
                  />
                  <IconButton
                    aria-label="Remove"
                    icon={<SmallCloseIcon />}
                    onClick={() => {
                      onChange(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
                    }}
                  />
                </HStack>
              </HStack>
              {rowChild && rowChild(item)}
            </Fragment>
          );
        })
      ) : (
        <Flex w="100%" alignItems="center" flexGrow={1} borderRadius="lg" bgColor="#eee" py={1} px={2} h="48px">
          Any
        </Flex>
      )}
      {remaining && (
        <HStack w="100%" alignItems="flex-start" flexWrap="wrap">
          {remaining
            .filter(i => (excludeAdded ? !value?.includes(i) : true))
            .map(item => {
              return (
                <Button
                  colorScheme="teal"
                  variant="ghost"
                  onClick={() => {
                    onChange(prev => [...prev, item]);
                  }}
                >
                  <AddIcon mr={3} />
                  {rowTitle(item)}
                </Button>
              );
            })}
        </HStack>
      )}
    </VStack>
  );
}
