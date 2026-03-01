import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Contacts from 'expo-contacts';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { Contact } from '../utils/parser';

type HomeNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const [loading, setLoading] = useState(false);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '주소록 접근 권한이 필요해요.');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Company],
      });

      const parsed: Contact[] = data
        .filter(c => c.name || c.phoneNumbers?.length)
        .map(c => ({
          name: c.name || '이름 없음',
          phone: c.phoneNumbers?.[0]?.number?.replace(/[- ()]/g, '') || '',
          note: c.company || '',
        }));

      if (parsed.length === 0) {
        Alert.alert('연락처 없음', '불러올 연락처가 없어요.');
        return;
      }

      navigation.navigate('Grade', { contacts: parsed });
    } catch (e) {
      Alert.alert('오류', '연락처를 불러오는 중 오류가 발생했어요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 스마트 연락처 분류기</Text>
      <Text style={styles.subtitle}>기기의 주소록을 불러와서{'\n'}A/B/C/F로 분류해요</Text>

      <TouchableOpacity style={styles.button} onPress={loadContacts} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>주소록 불러오기</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 24,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
});