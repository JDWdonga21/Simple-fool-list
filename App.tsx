import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import GradeScreen from './screens/GradeScreen';
import ResultScreen from './screens/ResultScreen';

export type RootStackParamList = {
  Home: undefined;
  Grade: { contacts: Contact[] };
  Result: { contacts: Contact[]; gradedContacts: Record<number, string> };
};

export type Contact = {
  name: string;
  phone: string;
  note: string;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
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