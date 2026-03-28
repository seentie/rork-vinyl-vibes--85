import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useRecord } from './context/RecordContext';

export default function Index() {
  const router = useRouter();
  const { isInitialized } = useRecord();

  useEffect(() => {
    if (isInitialized) {
      const timeout = setTimeout(() => {
        router.replace('/stylus');
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [isInitialized, router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#9C27B0" />
    </View>
  );
}
