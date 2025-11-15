import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  useWindowDimensions,
  Image,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useRecord } from './context/RecordContext';
const decadeThemes = {
  '1940s': {
    background: ['#8B4513', '#654321', '#2F1B14'],
    accent: '#D4AF37',
    vinyl: ['#1A1A1A', '#0D0D0D'],
  },
  '1950s': {
    background: ['#FF6B6B', '#FF8E53', '#FF6B9D'],
    accent: '#FFD700',
    vinyl: ['#2F0147', '#1A0033'],
  },
  '1960s': {
    background: ['#4ECDC4', '#45B7D1', '#96CEB4'],
    accent: '#FF69B4',
    vinyl: ['#2F0147', '#1A0033'],
  },
  '1970s': {
    background: ['#FFA726', '#FF7043', '#8D6E63'],
    accent: '#FFD23F',
    vinyl: ['#3A0CA3', '#240046'],
  },
  '1980s': {
    background: ['#9C27B0', '#E91E63', '#3F51B5'],
    accent: '#00FFFF',
    vinyl: ['#1A1A2E', '#0F0F1E'],
  },
  '1990s': {
    background: ['#607D8B', '#546E7A', '#37474F'],
    accent: '#FF4500',
    vinyl: ['#1C1C1C', '#0A0A0A'],
  },
  '2000s': {
    background: ['#001F3F', '#003366', '#004080'],
    accent: '#39FF14',
    vinyl: ['#0A0E27', '#050714'],
  },
};

export default function NakedVinylScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const VINYL_SIZE = screenWidth * 0.85;
  const insets = useSafeAreaInsets();
  const [showHeader, setShowHeader] = useState(false);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const spinAnimation = useRef<Animated.CompositeAnimation | null>(null);
  
  const { selectedRecord } = useRecord();
  
  // Get theme - using 1950s as default to match the main display default
  const defaultTheme = decadeThemes['1950s'];
  const theme = defaultTheme;
  
  const albumName = selectedRecord?.albumName || 'The Retro Renaissance';
  const artistName = selectedRecord?.artistName || 'Old Skool Apps';

  // Initialize spin value
  useEffect(() => {
    spinValue.setValue(0);
  }, [spinValue]);

  // Always spinning at 33rpm
  useEffect(() => {
    // Stop any existing animation
    if (spinAnimation.current) {
      spinAnimation.current.stop();
      spinAnimation.current = null;
    }
    
    // 33 RPM = 1818ms per rotation
    const duration = 1818;
    
    // Get current rotation value
    const currentValue = (spinValue as any)._value || 0;
    const normalizedValue = currentValue % 1;
    
    // Set starting position
    spinValue.setValue(normalizedValue);
    
    // Create continuous loop animation
    spinAnimation.current = Animated.loop(
      Animated.timing(spinValue, {
        toValue: normalizedValue + 1000,
        duration: duration * 1000,
        useNativeDriver: true,
        easing: (t) => t,
      })
    );
    
    spinAnimation.current.start();

    return () => {
      if (spinAnimation.current) {
        spinAnimation.current.stop();
        spinAnimation.current = null;
      }
    };
  }, [spinValue]);

  // Header show/hide animation
  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: showHeader ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showHeader, headerOpacity]);

  const handleScreenTap = () => {
    setShowHeader(!showHeader);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={1}
      onPress={handleScreenTap}
    >
      <LinearGradient
        colors={theme.background as [string, string, ...string[]]}
        style={styles.gradient}
      >
        <Animated.View style={[styles.header, { paddingTop: insets.top, opacity: headerOpacity }]}>
          <TouchableOpacity 
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.back();
            }}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={theme.accent} />
          </TouchableOpacity>
        </Animated.View>
        
        <View style={styles.vinylContainer}>
          <View style={styles.recordContainer}>
            <Animated.View
              style={[
                styles.record,
                {
                  width: VINYL_SIZE,
                  height: VINYL_SIZE,
                  borderRadius: VINYL_SIZE / 2,
                  transform: [{ rotate: spin }],
                },
              ]}
            >
              {/* Record Grooves */}
              {[...Array(12)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.groove,
                    {
                      width: VINYL_SIZE - (i * (VINYL_SIZE * 0.05)),
                      height: VINYL_SIZE - (i * (VINYL_SIZE * 0.05)),
                    },
                  ]}
                />
              ))}
              
              {/* Record Label */}
              <View style={[styles.label, { 
                width: VINYL_SIZE * 0.35,
                height: VINYL_SIZE * 0.35,
                borderRadius: (VINYL_SIZE * 0.35) / 2,
                backgroundColor: theme.accent 
              }]}>
                {selectedRecord?.coverImage ? (
                  <View style={styles.labelWithImage}>
                    <Image 
                      source={{ uri: selectedRecord.coverImage }}
                      style={[styles.albumCoverImage, {
                        width: VINYL_SIZE * 0.35,
                        height: VINYL_SIZE * 0.35,
                        borderRadius: (VINYL_SIZE * 0.35) / 2,
                      }]}
                      resizeMode="cover"
                    />
                    <View style={styles.centerHole} />
                  </View>
                ) : (
                  <>
                    <View style={styles.labelContent}>
                      <Text style={[styles.albumText, { fontSize: VINYL_SIZE * 0.04 }]} numberOfLines={2}>
                        {albumName}
                      </Text>
                      <Text style={[styles.artistText, { fontSize: VINYL_SIZE * 0.03 }]} numberOfLines={1}>
                        {artistName}
                      </Text>
                    </View>
                    <View style={styles.centerHole} />
                  </>
                )}
              </View>
            </Animated.View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    zIndex: 100,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  vinylContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  record: {
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  groove: {
    position: 'absolute' as const,
    borderRadius: 10000,
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
  },
  label: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden' as const,
  },
  labelWithImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumCoverImage: {
    position: 'absolute' as const,
  },
  labelContent: {
    position: 'absolute' as const,
    top: '25%',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  albumText: {
    color: '#0A0A0A',
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  artistText: {
    color: '#0A0A0A',
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    opacity: 0.8,
  },
  centerHole: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0A0A0A',
  },
});
