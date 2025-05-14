import React from 'react';
import {Text, View} from 'react-native';
import {para} from '../client/para';
import {CoreMethodParams} from '@getpara/react-native-wallet';

export default function TypeTest() {
  // Test function that uses properly typed ParaCore methods
  const testParaTypes = async () => {
    // This should properly resolve if types are working
    const params: CoreMethodParams<'signUpOrLogIn'> = {
      auth: {email: 'test@example.com'},
    };

    const result = await para.signUpOrLogIn(params);
    console.log(result);
  };

  return (
    <View>
      <Text>Testing ParaCore Types</Text>
    </View>
  );
}
