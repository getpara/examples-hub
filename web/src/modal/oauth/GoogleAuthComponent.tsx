import CoreCapsule from '../../core';
import { useContext } from 'react';
import { ModalStep } from '../steps';
import FlowContext from '../FlowContext';
import googleLogo from '../public/google-logo.svg';

const GoogleAuthComponent = ({ 
  width, 
  setEmail, 
  capsule, 
  setWebAuthURLForCreate, 
  setWebAuthURLForLogin, 
  setCurrentStep, 
  setIsCreateAccountType 
}: {
  width: number,
  setEmail: (newValue: string) => void;
  capsule: CoreCapsule;
  setWebAuthURLForCreate: (newValue: string) => void;
  setWebAuthURLForLogin: (newValue: string) => void;
  setCurrentStep: (newValue: ModalStep) => void;
  setIsCreateAccountType: (isCreateAccountType: boolean) => void;
}) => {  
    const { setIsLogin } = useContext(FlowContext);
  
    const handleAuthentication = async () => {
      const width = 600, height = 600;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
  
      const windowFeatures = `toolbar=no, menubar=no, width=${width}, height=${height}, top=${top}, left=${left}`;
      capsule.clearStorage();
      const googleAuthURL = await capsule.getGoogleOAuthURL();
      window.open(googleAuthURL, 'GoogleAuthPopup', windowFeatures);
      const { email, userExists } = await capsule.waitForGoogleOAuth();
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
        <button style={{ 
          color: 'white', 
          border: '2px solid #FFF', 
          padding: '10px',
          borderRadius: '10px',
          height: '50px',
          width: `${width}px`,
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
        }} onClick={handleAuthentication}>
          <img src={googleLogo} width="25" height="25" />
        </button>
      </div>
    );
  };

  export default GoogleAuthComponent