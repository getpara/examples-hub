import { useEffect, useState, Fragment } from 'react';
import {
  Heading,
  Container,
  Button,
  Text,
  ChakraProvider,
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

const exPolicies = `{"partner":{"createdAt":"2023-05-12T21:20:21.532Z","updatedAt":"2023-05-12T21:20:21.532Z","id":"3f5f1e8d-3b02-4690-bfe7-53208501d1d2","name":"Sandbox Example Partner","apiKey":"fdba16e45ba41e80185eb2c0195e89d4","policiesEnabled":true},"policy":{"createdAt":"2023-05-12T21:25:31.264Z","updatedAt":"2023-05-12T21:25:31.264Z","id":"f0cce7ed-13ed-47a7-a271-1f5f5fc0c368","partnerId":"3f5f1e8d-3b02-4690-bfe7-53208501d1d2","validFrom":null,"validTo":null,"scopes":[{"createdAt":"2023-05-12T21:25:31.265Z","updatedAt":"2023-05-12T21:25:31.265Z","id":"9d897246-2785-4da3-be2b-74edfb01b74d","policyId":"f0cce7ed-13ed-47a7-a271-1f5f5fc0c368","name":"Allow deploy Sepolia contract","description":"Allow deployment of smart contract on Sepolia Network","required":false,"permissionTemplates":[{"createdAt":"2023-05-12T21:25:31.265Z","updatedAt":"2023-05-12T21:25:31.265Z","id":"a28cf043-1293-4343-9ca3-534ac4ea2ab5","scopeId":"9d897246-2785-4da3-be2b-74edfb01b74d","effect":"ALLOW","chainId":"11155111","type":"DEPLOY_CONTRACT","smartContractFunction":null,"smartContractAddress":null,"conditions":[]}],"parentScopeId":null,"childScopes":[]},{"createdAt":"2023-05-12T21:25:31.265Z","updatedAt":"2023-05-12T21:25:31.265Z","id":"757130b9-e661-4886-83d4-b081c2d8a63c","policyId":"f0cce7ed-13ed-47a7-a271-1f5f5fc0c368","name":"Allow transfer of Sepolia to 0x42c9a72c9dfcc92cae0de9510160cea2da27af91","description":"Allow transfer of Sepolia to the address 0x42c9a72c9dfcc92cae0de9510160cea2da27af91","required":true,"permissionTemplates":[],"parentScopeId":null,"childScopes":[{"createdAt":"2023-05-12T21:25:31.265Z","updatedAt":"2023-05-12T21:25:31.265Z","id":"61170f01-0133-4957-bcf7-abc878c29df3","policyId":"f0cce7ed-13ed-47a7-a271-1f5f5fc0c368","name":"Nested Scope","description":"Nested scope description","required":true,"permissionTemplates":[],"parentScopeId":"757130b9-e661-4886-83d4-b081c2d8a63c","childScopes":[{"createdAt":"2023-05-12T21:25:31.265Z","updatedAt":"2023-05-12T21:25:31.265Z","id":"09f8be87-95f4-428d-b961-73e3c340e390","policyId":"f0cce7ed-13ed-47a7-a271-1f5f5fc0c368","name":"Final Nested Scope","description":"Final Nested Scope which has the actual permissions attached","required":true,"permissionTemplates":[{"createdAt":"2023-05-12T21:25:31.265Z","updatedAt":"2023-05-12T21:25:31.265Z","id":"3fd2c5c4-8a98-41e5-a7c0-362ce5423c98","scopeId":"09f8be87-95f4-428d-b961-73e3c340e390","effect":"ALLOW","chainId":"11155111","type":"TRANSFER","smartContractFunction":null,"smartContractAddress":null,"conditions":[{"createdAt":"2023-05-12T21:25:31.265Z","updatedAt":"2023-05-12T21:25:31.265Z","id":"9399700f-9bac-4161-a180-9f57205a2bf3","permissionTemplateId":"3fd2c5c4-8a98-41e5-a7c0-362ce5423c98","type":"STATIC","resource":"TO_ADDRESS","comparator":"EQUALS","reference":"0x42c9a72c9dfcc92cae0de9510160cea2da27af91"}]}],"parentScopeId":"61170f01-0133-4957-bcf7-abc878c29df3","childScopes":[]},{"createdAt":"2023-05-12T21:25:31.265Z","updatedAt":"2023-05-12T21:25:31.265Z","id":"cdb8ee9d-23b2-4dc4-820a-a18df78ac870","policyId":"f0cce7ed-13ed-47a7-a271-1f5f5fc0c368","name":"Allow Mumbai transfer and store smart contract call","description":"Allow Mumbai transfer and store smart contract call on Sepolia smart contract","required":true,"permissionTemplates":[{"createdAt":"2023-05-12T21:25:31.265Z","updatedAt":"2023-05-12T21:25:31.265Z","id":"d53385be-b85a-40db-8dfc-2a17dd43518f","scopeId":"cdb8ee9d-23b2-4dc4-820a-a18df78ac870","effect":"ALLOW","chainId":"80001","type":"TRANSFER","smartContractFunction":null,"smartContractAddress":null,"conditions":[{"createdAt":"2023-05-12T21:25:31.265Z","updatedAt":"2023-05-12T21:25:31.265Z","id":"50a21b1b-c627-478a-89ed-f4c4bcf9e903","permissionTemplateId":"d53385be-b85a-40db-8dfc-2a17dd43518f","type":"STATIC","resource":"TO_ADDRESS","comparator":"EQUALS","reference":"0x42c9a72c9dfcc92cae0de9510160cea2da27af91"}]},{"createdAt":"2023-05-12T21:25:31.265Z","updatedAt":"2023-05-12T21:25:31.265Z","id":"c9ed008d-956c-4b24-b4bc-d99ff732bda1","scopeId":"cdb8ee9d-23b2-4dc4-820a-a18df78ac870","effect":"ALLOW","chainId":"11155111","type":"CALL_CONTRACT","smartContractFunction":"store","smartContractAddress":"0xc08c00e1aa97a18583dc1a72a7e9fb9ce56cfef5","conditions":[]}],"parentScopeId":"61170f01-0133-4957-bcf7-abc878c29df3","childScopes":[]}]}]}]}}`;

const ScopeCheckbox = ({
  scope,
  selectedScopeIds,
  onSelect,
  final = false,
}) => {
  const isChecked = selectedScopeIds.has(scope.id);

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    onSelect(scope, checked);
  };

  const ContentWrapper = final ? Box : AccordionButton;
  const Panel = final ? Box : AccordionPanel;
  return (
    <AccordionItem
      paddingTop={'4px'}
      paddingBottom={'4px'}
      borderBottomWidth={'0 !important'}
    >
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
        {scope.childScopes?.map((childScope) =>
          childScope?.childScopes?.length > 0 ? (
            <Accordion allowMultiple key={childScope.id}>
              <ScopeCheckbox
                scope={childScope}
                onSelect={onSelect}
                selectedScopeIds={selectedScopeIds}
              />
            </Accordion>
          ) : (
            <ScopeCheckbox
              scope={childScope}
              final
              onSelect={onSelect}
              selectedScopeIds={selectedScopeIds}
            />
          ),
        )}
      </Panel>
    </AccordionItem>
  );
};

const allPoliciesIds = (scopes) => {
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
  const [selectedScopeIds, setSelectedScopeIds] = useState(
    new Set(allPoliciesIds(scopes)),
  );

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
      {scopes.map((scope) => (
        <h2 key={scope.id}>
          <ScopeCheckbox
            final={!(scope.childScopes?.length > 0)}
            scope={scope}
            selectedScopeIds={selectedScopeIds}
            onSelect={(scope, isChecked: boolean) =>
              handleSelect(scope, isChecked)
            }
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
      const { permissions } = (
        await userManagementClient.getPolicyPermissions(userId, policy.id)
      ).data;
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
          <b>{partner.displayName}</b> is requesting access to perform the
          following operation on your wallet
        </Text>
        <Text mb={8} fontSize="xs" textAlign="center">
          Please only proceed if you trust {partner.displayName}.
        </Text>
        <Box height="60px" alignItems="center" display="flex">
          <CapsuleBox />
        </Box>
        <Spacer />
        <ScopeSelection
          onDone={onDone}
          scopes={policy.scopes}
          userId={userId}
          partnerId={partnerId}
        />
      </VStack>
    </Box>
  );
}

export default PermissionSelection;
