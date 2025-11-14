import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/stylus');
    }, 0);

    return () => clearTimeout(timeout);
  }, [router]);

  return <View style={{ flex: 1 }} />;
}
