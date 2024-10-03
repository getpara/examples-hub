import {
  ErrorToast,
  SuccessToast,
  ToastConfigParams,
} from 'react-native-toast-message';

export const toastConfig = {
  success: (props: ToastConfigParams<any>) => (
    <SuccessToast
      {...props}
      style={{
        borderWidth: 1,
        borderLeftWidth: 1,
        borderColor: 'green',
        borderLeftColor: 'green',
        backgroundColor: 'black',
      }}
      text1Style={{fontSize: 14, color: 'white'}}
    />
  ),
  error: (props: ToastConfigParams<any>) => (
    <ErrorToast
      {...props}
      style={{
        borderWidth: 1,
        borderLeftWidth: 1,
        borderColor: 'red',
        borderLeftColor: 'red',
        backgroundColor: 'black',
      }}
      text1Style={{fontSize: 14, color: 'white'}}
    />
  ),
};
