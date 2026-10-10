import { Redirect } from 'expo-router';

import { useSession } from '@/hooks/useSession';

export default function Index() {
  const { currentUser } = useSession();
  return <Redirect href={currentUser ? '/home' : '/login'} />;
}
