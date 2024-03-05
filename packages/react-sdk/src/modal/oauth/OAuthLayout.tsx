import { Flex, Text } from "@chakra-ui/react";
import CapsuleWeb, { OAuthMethod } from "@usecapsule/web-sdk";
import { ModalStep } from "../steps";
import { useContext } from "react";
import FlowContext from "../FlowContext";
import googleLogo from '../public/google-logo.svg';
import discordLogo from '../public/discord-logo.png';
import appleLogo from '../public/apple-logo.png';
import xLogo from '../public/x-logo.png';

const logos = {
  [OAuthMethod.GOOGLE]: googleLogo,
  [OAuthMethod.DISCORD]: discordLogo,
  [OAuthMethod.APPLE]: appleLogo,
  [OAuthMethod.X]: xLogo,
}

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

const OAuthComponent = ({ 
  width, 
  setEmail, 
  capsule, 
  setWebAuthURLForCreate, 
  setWebAuthURLForLogin, 
  setCurrentStep, 
  setIsCreateAccountType,
  oAuthMethod,
}: {
  width: number,
  setEmail: (newValue: string) => void;
  capsule: CapsuleWeb;
  setWebAuthURLForCreate: (newValue: string) => void;
  setWebAuthURLForLogin: (newValue: string) => void;
  setCurrentStep: (newValue: ModalStep) => void;
  setIsCreateAccountType: (isCreateAccountType: boolean) => void;
  oAuthMethod: OAuthMethod;
}) => {
  const { setIsLogin } = useContext(FlowContext);
  
  const handleAuthentication = async () => {
    const width = 600, height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const windowFeatures = `toolbar=no, menubar=no, width=${width}, height=${height}, top=${top}, left=${left}`;
    capsule.clearStorage();
    const oAuthURL = await capsule.getOAuthURL(oAuthMethod);
    window.open(oAuthURL, `${oAuthMethod}AuthPopup`, windowFeatures);
    const { email, userExists } = await capsule.waitForOAuth();
    if (!email) {
      throw new Error('email is required');
    }

    setEmail(email);

    if (userExists) {
      const webAuthUrlForLogin = await capsule.initiateUserLogin(email);
      setIsLogin(true);
      setWebAuthURLForLogin(webAuthUrlForLogin);
      setCurrentStep(ModalStep.BIOMETRIC_LOGIN);
    } else {
      const webAuthURLForCreate = await capsule.getSetUpBiometricsURL(false);
      setIsLogin(false);
      setIsCreateAccountType(true);
      setWebAuthURLForCreate(webAuthURLForCreate);
      setCurrentStep(ModalStep.BIOMETRIC_CREATION);
    }
  };

  return (
    <div>
      <button 
        style={{ 
          color: 'white', 
          border: '2px solid #FFF', 
          padding: '10px',
          borderRadius: '10px',
          height: '50px',
          width: `${width}px`,
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
        }} 
        onClick={handleAuthentication}
        // Will remove this as new methods are added
        disabled={oAuthMethod === OAuthMethod.APPLE || oAuthMethod === OAuthMethod.X}  
      >
        <img src={logos[oAuthMethod]} width="25" height="25" />
      </button>
    </div>
  )
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
  capsule: CapsuleWeb;
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
        {oAuthMethods.map(method => <OAuthComponent 
          key={method}
          setEmail={setEmail}
          capsule={capsule as CapsuleWeb}
          setWebAuthURLForLogin={setWebAuthURLForLogin}
          setWebAuthURLForCreate={setWebAuthURLForCreate}
          setCurrentStep={setCurrentStep}
          setIsCreateAccountType={setIsCreateAccountType}
          width={componentWidths}
          oAuthMethod={method}
        />)}
      </Flex>
    </>
  )
}

export default OAuthLayout;