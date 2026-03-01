import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

type ResultRouteProp = RouteProp<RootStackParamList, 'Result'>;
type ResultNavigationProp = StackNavigationProp<RootStackParamList, 'Result'>;

const GRADE_INFO: Record<string, { label: string; color: string; bg: string }> = {
  A: { label: '신뢰 / 가족', color: '#065f46', bg: '#ecfdf5' },
  B: { label: '지인 / 친구', color: '#1e40af', bg: '#eff6ff' },
  C: { label: '이름만 안다', color: '#92400e', bg: '#fffbeb' },
  F: { label: '전혀 모름',   color: '#9f1239', bg: '#fff1f2' },
};

export default function ResultScreen() {
  const route = useRoute<ResultRouteProp>();
  const navigation = useNavigation<ResultNavigationProp>();
  const { contacts, gradedContacts } = route.params;

  const counts = { A: 0, B: 0, C: 0, F: 0 } as Record<string, number>;
  Object.values(gradedContacts).forEach(g => { if (counts[g] !== undefined) counts[g]++; });

  const downloadExcel = async () => {
    try {
      const data = contacts.map((c, idx) => ({
        이름: c.name,
        전화번호: c.phone,
        정보: c.note,
        등급: gradedContacts[idx] || '미분류',
        분류기준: GRADE_INFO[gradedContacts[idx]]?.label || '',
      }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ranking');
        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

        const uri = FileSystem.documentDirectory + `연락처분류결과_${new Date().toISOString().slice(0, 10)}.xlsx`;
        await FileSystem.writeAsStringAsync(uri, wbout, { encoding: 'base64' });
        await Sharing.shareAsync(uri);
    } catch (e) {
        Alert.alert('오류', String(e));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>분류 완료!</Text>
      <Text style={styles.subtitle}>데이터 정리가 끝났습니다.{'\n'}엑셀 파일로 결과를 확인하세요.</Text>

      {/* 등급 요약 */}
      <View style={styles.grid}>
        {['A', 'B', 'C', 'F'].map(g => (
          <View key={g} style={[styles.gradeCard, { backgroundColor: GRADE_INFO[g].bg }]}>
            <Text style={[styles.gradeLabel, { color: GRADE_INFO[g].color }]}>{g}</Text>
            <Text style={[styles.gradeCount, { color: GRADE_INFO[g].color }]}>{counts[g]}</Text>
            <Text style={[styles.gradeDesc, { color: GRADE_INFO[g].color }]}>{GRADE_INFO[g].label}</Text>
          </View>
        ))}
      </View>

      {/* 버튼 */}
      <TouchableOpacity style={styles.excelBtn} onPress={downloadExcel}>
        <Text style={styles.excelBtnText}>📊 결과 엑셀 저장</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.resetBtnText}>↩ 처음으로 돌아가기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    alignItems: 'center',
    padding: 32,
    paddingTop: 80,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
    width: '100%',
  },
  gradeCard: {
    width: '47%',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  gradeLabel: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  gradeCount: {
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 4,
  },
  gradeDesc: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  excelBtn: {
    backgroundColor: '#1e293b',
    width: '100%',
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  excelBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  resetBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  resetBtnText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '700',
  },
});