import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useState } from 'react';
import { RootStackParamList } from '../App';

type GradeRouteProp = RouteProp<RootStackParamList, 'Grade'>;
type GradeNavigationProp = StackNavigationProp<RootStackParamList, 'Grade'>;

const GRADES = [
  { g: 'A', l: '신뢰 / 가족', color: '#ecfdf5', border: '#6ee7b7', text: '#065f46' },
  { g: 'B', l: '지인 / 친구', color: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
  { g: 'C', l: '이름만 안다', color: '#fffbeb', border: '#fcd34d', text: '#92400e' },
  { g: 'F', l: '전혀 모름',   color: '#fff1f2', border: '#fda4af', text: '#9f1239' },
];

export default function GradeScreen() {
  const navigation = useNavigation<GradeNavigationProp>();
  const route = useRoute<GradeRouteProp>();
  const { contacts } = route.params;

  const initialGraded = route.params.gradedContacts || {};
  const firstUngraded = contacts.findIndex((_, idx) => !initialGraded[idx]);

  const [currentIndex, setCurrentIndex] = useState(firstUngraded >= 0 ? firstUngraded : 0);
  const [gradedContacts, setGradedContacts] = useState<Record<number, string>>(initialGraded);

  const handleGrade = (grade: string) => {
    const next = { ...gradedContacts, [currentIndex]: grade };
    setGradedContacts(next);

    if (currentIndex < contacts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate('Result', { contacts, gradedContacts: next });
    }
  };

  const current = contacts[currentIndex];
  const progress = ((currentIndex + 1) / contacts.length) * 100;

  return (
    <View style={styles.container}>
      {/* 진행바 */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{currentIndex + 1} / {contacts.length}</Text>

      {/* 연락처 카드 */}
      <View style={styles.card}>
        <Text style={styles.name}>{current.name}</Text>
        <Text style={styles.phone}>{current.phone || '번호 없음'}</Text>
        {current.note ? <Text style={styles.note}>{current.note}</Text> : null}
      </View>

      {/* 등급 버튼 */}
      <View style={styles.grid}>
        {GRADES.map(item => (
          <TouchableOpacity
            key={item.g}
            style={[styles.gradeBtn, { backgroundColor: item.color, borderColor: item.border }]}
            onPress={() => handleGrade(item.g)}
            activeOpacity={0.7}
          >
            <Text style={[styles.gradeLabel, { color: item.text }]}>{item.g}</Text>
            <Text style={[styles.gradeDesc, { color: item.text }]}>{item.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 이전 / 건너뛰기 */}
      <View style={styles.footer}>
        <TouchableOpacity
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex(currentIndex - 1)}
        >
          <Text style={[styles.footerBtn, currentIndex === 0 && { opacity: 0.2 }]}>← 이전</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Result', { contacts, gradedContacts })}>
          <Text style={styles.footerBtn}>중단하고 저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    paddingTop: 60,
  },
  progressBg: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#4f46e5',
    borderRadius: 999,
  },
  progressText: {
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '900',
    color: '#4f46e5',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  phone: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4f46e5',
    marginBottom: 8,
    fontVariant: ['tabular-nums'],
  },
  note: {
    fontSize: 12,
    color: '#94a3b8',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gradeBtn: {
    width: '47%',
    paddingVertical: 24,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
  },
  gradeLabel: {
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 4,
  },
  gradeDesc: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerBtn: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94a3b8',
  },
});