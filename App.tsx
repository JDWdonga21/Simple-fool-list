import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';
import GradeScreen from './screens/GradeScreen';
import ResultScreen from './screens/ResultScreen';

SplashScreen.preventAutoHideAsync();

export type RootStackParamList = {
  Home: undefined;
  Grade: { contacts: Contact[]; gradedContacts?: Record<number, string> };
  Result: { contacts: Contact[]; gradedContacts: Record<number, string> };
};

export type Contact = {
  name: string;
  phone: string;
  note: string;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    const prepare = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('SplashScreen error:', e);
      }
    };
    prepare();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Grade" component={GradeScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}