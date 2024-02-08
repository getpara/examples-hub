import { Flex, Text } from "@chakra-ui/react";
import { Capsule } from "../../Capsule";
import CoreCapsule from "../../core";
import { ModalStep } from "../steps";
import AppleAuthComponent from "./AppleAuthComponent";
import DiscordAuthComponent from "./DiscordAuthComponent";
import GoogleAuthComponent from "./GoogleAuthComponent";
import XAuthComponent from "./XAuthComponent";
import { OAuthMethod } from "./oAuthMethods";

const calculateComponentWidth = (numComponents: number): number => {
  const totalWidth = 274;
  const spaceBetweenComponents = 16;

  if (numComponents < 1 || numComponents > 4) {
      throw new Error("Number of components must be between 1 and 4");
  }

  const totalSpaceBetween = (numComponents - 1) * spaceBetweenComponents;
  const componentWidth = (totalWidth - totalSpaceBetween) / numComponents;

  return componentWidth;
}

const OAuthLayout = ({
  oAuthMethods,
  setEmail,
  setIsCreateAccountType,
  setWebAuthURLForCreate,
  setWebAuthURLForLogin,
  setCurrentStep,
  capsule,
}: {
  oAuthMethods: OAuthMethod[];
  setWebAuthURLForCreate: (newValue: string) => void;
  setWebAuthURLForLogin: (newValue: string) => void;
  setCurrentStep: (newValue: ModalStep) => void;
  setEmail: (newValue: string) => void;
  capsule: Capsule | CoreCapsule;
  setIsCreateAccountType: (isCreateAccountType: boolean) => void;
}) => {

  const componentWidths = calculateComponentWidth(oAuthMethods.length)
  return (
    <>
    {/* @ts-ignore */}
      <Text
        alignSelf="start"
        fontSize="12px"
        fontWeight={500}
        lineHeight='16px'
        textColor="#838587"
      >
        Social Login
      </Text>
      {/* @ts-ignore */}
      <Flex width='100%' gap='4' marginTop='4px'>
        {oAuthMethods.includes(OAuthMethod.GOOGLE) && <GoogleAuthComponent 
          setEmail={setEmail}
          capsule={capsule as CoreCapsule} 
          setWebAuthURLForLogin={setWebAuthURLForLogin}
          setWebAuthURLForCreate={setWebAuthURLForCreate}
          setCurrentStep={setCurrentStep}
          setIsCreateAccountType={setIsCreateAccountType}
          width={componentWidths}
        />}
        {oAuthMethods.includes(OAuthMethod.X) && <XAuthComponent width={componentWidths} />}
        {oAuthMethods.includes(OAuthMethod.APPLE) && <AppleAuthComponent width={componentWidths} />}
        {oAuthMethods.includes(OAuthMethod.DISCORD) && <DiscordAuthComponent width={componentWidths} />}
      </Flex>
    </>
  )
}

export default OAuthLayout;