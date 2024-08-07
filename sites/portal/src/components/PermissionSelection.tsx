import { useEffect, useState } from 'react';
import {
  Button,
  Text,
  HStack,
  Checkbox,
  VStack,
  Spacer,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Flex,
} from '@chakra-ui/react';

import { userManagementClient } from '../clients/userManagementClient';
import CapsuleBox from '../assets/CapsuleBox';

const ScopeCheckbox = ({ scope, selectedScopeIds, onSelect, final = false }) => {
  const isChecked = selectedScopeIds.has(scope.id);

  const handleCheckboxChange = e => {
    const checked = e.target.checked;
    onSelect(scope, checked);
  };

  const ContentWrapper = final ? Box : AccordionButton;
  const Panel = final ? Box : AccordionPanel;
  return (
    <AccordionItem paddingTop={'4px'} paddingBottom={'4px'} borderBottomWidth={'0 !important'}>
      <HStack padding={'4px !important'} minH="48px" width="100%">
        <Checkbox
          colorScheme={'#111'}
          borderColor="#333"
          backgroundColor={'#111'}
          type="checkbox"
          isChecked={isChecked}
          onChange={handleCheckboxChange}
          size={'lg'}
        />
        <ContentWrapper
          padding={'0 !important'}
          display="flex"
          flexDirection="row"
          width="100%"
          justifyContent="space-between"
        >
          <Box display="flex">
            <Text fontSize="s" color="brand.dimmed2" textAlign="left">
              {scope.description}
            </Text>
            {scope.childScopes?.length ? (
              <Flex
                w="30px"
                minW="30px"
                height="30px"
                borderColor="#59C1A9"
                textColor="#59C1A9"
                justifyContent="center"
                alignItems="center"
                borderWidth="2px"
                borderRadius="15px"
              >
                {scope.childScopes?.length}
              </Flex>
            ) : null}
          </Box>

          <AccordionIcon color="white" />
        </ContentWrapper>
      </HStack>
      <Panel borderWidth={0}>
        {scope.childScopes?.map(childScope =>
          childScope?.childScopes?.length > 0 ? (
            <Accordion allowMultiple key={childScope.id}>
              <ScopeCheckbox scope={childScope} onSelect={onSelect} selectedScopeIds={selectedScopeIds} />
            </Accordion>
          ) : (
            <ScopeCheckbox scope={childScope} final onSelect={onSelect} selectedScopeIds={selectedScopeIds} />
          ),
        )}
      </Panel>
    </AccordionItem>
  );
};

const allPoliciesIds = scopes => {
  let policies = [];
  for (const scope of scopes) {
    policies.push(scope.id);
    // @ts-ignore
    policies = [...policies, ...allPoliciesIds(scope.childScopes)];
  }
  return policies;
};

// ScopeSelection component
const ScopeSelection = ({ scopes, userId, partnerId, onDone }) => {
  const [selectedScopeIds, setSelectedScopeIds] = useState(new Set(allPoliciesIds(scopes)));

  const handleSelect = (scope, isChecked: boolean) => {
    if (isChecked) {
      selectedScopeIds.add(scope.id);
      setSelectedScopeIds(selectedScopeIds);
    } else {
      selectedScopeIds.delete(scope.id);
      setSelectedScopeIds(selectedScopeIds);
    }
  };

  const handleSubmit = async () => {
    const scopeIds = Array.from(selectedScopeIds);
    await userManagementClient.acceptScopes(userId, { partnerId, scopeIds });
    onDone();
    // add some check in backend to not allow editing in case accidental click twice
    // Send permissionTemplatesToSend somewhere
  };

  return (
    <Accordion allowMultiple>
      {scopes.map(scope => (
        <h2 key={scope.id}>
          <ScopeCheckbox
            final={!(scope.childScopes?.length > 0)}
            scope={scope}
            selectedScopeIds={selectedScopeIds}
            onSelect={(scope, isChecked: boolean) => handleSelect(scope, isChecked)}
          />
        </h2>
      ))}
      <Button mt="8px" width="100%" colorScheme="green" onClick={handleSubmit}>
        Submit
      </Button>
    </Accordion>
  );
};

// should have some sort of text saying exactly what url is associated with
// these permissions and if they didn't come from that url to not trust them
function PermissionSelection({
  userId,
  partnerId,
  isLogin = false,
  onDone = () => undefined,
}: {
  userId: string;
  partnerId: string;
  isLogin?: boolean;
  onDone?: () => void;
}) {
  const [partnerDetails, setPartnerDetails] = useState(null);

  async function performSetup() {
    const detailsRes = (await userManagementClient.getPartner(partnerId)).data;
    if (!detailsRes.policy) {
      // no policy so no need to show any permission selection
      onDone();
      return;
    }

    if (isLogin) {
      const { policy } = detailsRes;
      const { permissions } = (await userManagementClient.getPolicyPermissions(userId, policy.id)).data;
      if (permissions.length > 0) {
        // user is logging into a partner they already have permissions for
        // so no need to go through again
        onDone();
      }
    }

    setPartnerDetails(detailsRes);
  }

  useEffect(() => {
    performSetup();
  }, []);

  if (!partnerDetails || !partnerDetails.policy) {
    return <div></div>;
  }

  // if no policy we shouldn't show any permission selection and
  // we should completely skip this flow
  const { partner, policy } = partnerDetails;
  return (
    <Box height="100%">
      <VStack alignItems="center" color="white" maxW="ld">
        <Text fontSize="m" textAlign="center">
          <b>{partner.displayName}</b> is requesting access to perform the following operation on your wallet
        </Text>
        <Text mb={8} fontSize="xs" textAlign="center">
          Please only proceed if you trust {partner.displayName}.
        </Text>
        <Box height="60px" alignItems="center" display="flex">
          <CapsuleBox />
        </Box>
        <Spacer />
        <ScopeSelection onDone={onDone} scopes={policy.scopes} userId={userId} partnerId={partnerId} />
      </VStack>
    </Box>
  );
}

export default PermissionSelection;
