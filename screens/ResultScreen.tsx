import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useState } from 'react';
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
  const [openGrade, setOpenGrade] = useState<string | null>(null);

  const counts = { A: 0, B: 0, C: 0, F: 0 } as Record<string, number>;
  Object.values(gradedContacts).forEach(g => { if (counts[g] !== undefined) counts[g]++; });

  const getContactsByGrade = (grade: string) =>
    contacts.filter((_, idx) => gradedContacts[idx] === grade);

  const toggleGrade = (grade: string) =>
    setOpenGrade(prev => prev === grade ? null : grade);

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
      <Text style={styles.subtitle}>카드를 눌러 연락처 목록을 확인하세요.</Text>

      {/* 등급 카드 + 펼치기 */}
      {['A', 'B', 'C', 'F'].map(g => {
        const isOpen = openGrade === g;
        const list = getContactsByGrade(g);
        return (
          <View key={g} style={styles.accordionWrap}>
            <TouchableOpacity
              style={[styles.gradeCard, { backgroundColor: GRADE_INFO[g].bg }]}
              onPress={() => toggleGrade(g)}
              activeOpacity={0.7}
            >
              <View style={styles.gradeCardLeft}>
                <Text style={[styles.gradeLabel, { color: GRADE_INFO[g].color }]}>{g}</Text>
                <Text style={[styles.gradeDesc, { color: GRADE_INFO[g].color }]}>{GRADE_INFO[g].label}</Text>
              </View>
              <View style={styles.gradeCardRight}>
                <Text style={[styles.gradeCount, { color: GRADE_INFO[g].color }]}>{counts[g]}명</Text>
                <Text style={[styles.arrow, { color: GRADE_INFO[g].color }]}>{isOpen ? '▲' : '▼'}</Text>
              </View>
            </TouchableOpacity>

            {isOpen && (
              <View style={[styles.listWrap, { borderColor: GRADE_INFO[g].bg }]}>
                {list.length === 0 ? (
                  <Text style={styles.emptyText}>해당 등급 없음</Text>
                ) : (
                  list.map((c, i) => (
                    <View key={i} style={styles.contactRow}>
                      <Text style={styles.contactName}>{c.name}</Text>
                      <Text style={styles.contactPhone}>{c.phone || '번호 없음'}</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        );
      })}

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
    padding: 24,
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
    marginBottom: 32,
  },
  accordionWrap: {
    width: '100%',
    marginBottom: 12,
  },
  gradeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  gradeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gradeCardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  gradeLabel: {
    fontSize: 28,
    fontWeight: '900',
  },
  gradeDesc: {
    fontSize: 14,
    fontWeight: '700',
  },
  gradeCount: {
    fontSize: 20,
    fontWeight: '900',
  },
  arrow: {
    fontSize: 12,
    fontWeight: '900',
  },
  listWrap: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  contactPhone: {
    fontSize: 13,
    color: '#94a3b8',
    fontVariant: ['tabular-nums'],
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    color: '#cbd5e1',
    fontWeight: '700',
  },
  excelBtn: {
    backgroundColor: '#1e293b',
    width: '100%',
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
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
    marginBottom: 40,
  },
  resetBtnText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '700',
  },
});