import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text } from 'react-native';
import { Button } from '@rneui/themed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthSelection'>;

export default function AuthSelection({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Authentication Methods</Text>
        <Text style={styles.subtitle}>Choose your preferred way to authenticate</Text>

        <View style={styles.buttonsContainer}>
          <Button
            title="Email Authentication"
            onPress={() => navigation.navigate('EmailAuth')}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
          />
          
          <Button
            title="Phone Authentication"
            onPress={() => navigation.navigate('PhoneAuth')}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
          />
          
          <Button
            title="OAuth Authentication"
            onPress={() => navigation.navigate('OauthAuth')}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  buttonsContainer: {
    marginTop: 16,
    gap: 12,
  },
  button: {
    backgroundColor: '#fc6c58',
    borderRadius: 8,
    paddingVertical: 14,
  },
  buttonContainer: {
    width: '100%',
  },
});