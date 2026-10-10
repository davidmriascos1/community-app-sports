import { useLocalSearchParams } from 'expo-router';

import { ClassDetailScreen } from '@/screens/ClassDetailScreen';

export default function ClassRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ClassDetailScreen classId={id} />;
}
