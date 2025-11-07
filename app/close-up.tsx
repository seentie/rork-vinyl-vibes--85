import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  ArrowLeft,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useRecord } from './context/RecordContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const decadeThemes = {
  '1940s': {
    name: '1940s Jazz',
    background: ['#8B4513', '#654321', '#2F1B14'],
    accent: '#D4AF37',
    vinyl: ['#1A1A1A', '#0D0D0D'],
    text: '#F5DEB3',
  },
  '1950s': {
    name: '1950s Rock',
    background: ['#FF6B6B', '#FF8E53', '#FF6B9D'],
    accent: '#FFD700',
    vinyl: ['#2F0147', '#1A0033'],
    text: '#FFFFFF',
  },
  '1960s': {
    name: '1960s Psychedelic',
    background: ['#4ECDC4', '#45B7D1', '#96CEB4'],
    accent: '#FF69B4',
    vinyl: ['#2F0147', '#1A0033'],
    text: '#FFFFFF',
  },
  '1970s': {
    name: '1970s Disco',
    background: ['#FFA726', '#FF7043', '#8D6E63'],
    accent: '#FFD23F',
    vinyl: ['#3A0CA3', '#240046'],
    text: '#FFFFFF',
  },
  '1980s': {
    name: '1980s Neon',
    background: ['#9C27B0', '#E91E63', '#3F51B5'],
    accent: '#00FFFF',
    vinyl: ['#1A1A2E', '#0F0F1E'],
    text: '#00FFFF',
  },
  '1990s': {
    name: '1990s Grunge',
    background: ['#607D8B', '#546E7A', '#37474F'],
    accent: '#FF4500',
    vinyl: ['#1C1C1C', '#0A0A0A'],
    text: '#FFFFFF',
  },
  '2000s': {
    name: '2000s Digital',
    background: ['#001F3F', '#003366', '#004080'],
    accent: '#39FF14',
    vinyl: ['#0A0E27', '#050714'],
    text: '#00D4FF',
  },
  'ai': {
    name: 'AI Generated',
    background: ['#FF6B6B', '#FF8E53', '#FF6B9D'],
    accent: '#FFD700',
    vinyl: ['#2F0147', '#1A0033'],
    text: '#FFFFFF',
  },
  'youPick': {
    name: 'You Pick',
    background: ['#9C27B0', '#E91E63', '#3F51B5'],
    accent: '#FFD700',
    vinyl: ['#2F0147', '#1A0033'],
    text: '#FFFFFF',
  },
};

export default function CloseUpViewScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStopped, setIsStopped] = useState(true);
  const [rpm, setRpm] = useState<33 | 45>(33);
  const [currentTheme] = useState<keyof typeof decadeThemes>('1950s');

  const { selectedRecord, currentSong, tracks } = useRecord();
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const spinAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const insets = useSafeAreaInsets();

  const currentTrack = tracks[0] || tracks[0];
  const theme = decadeThemes[currentTheme];

  useEffect(() => {
    if (spinAnimation.current) {
      spinAnimation.current.stop();
    }
    
    if (isPlaying && !isStopped) {
      const duration = rpm === 45 ? 1000 : 1818;
      
      spinValue.setValue(0);
      
      spinAnimation.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
          easing: (t) => t,
        }),
        { iterations: -1 }
      );
      
      spinAnimation.current.start();
    } else if (isStopped) {
      spinValue.setValue(0);
    }

    return () => {
      if (spinAnimation.current) {
        spinAnimation.current.stop();
      }
    };
  }, [rpm, isPlaying, isStopped, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'clamp',
  });

  const handleStop = () => {
    setIsPlaying(false);
    setIsStopped(true);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePlayPause = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (isStopped) {
      setIsStopped(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleRPM = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (spinAnimation.current) {
      spinAnimation.current.stop();
    }
    
    setRpm(current => current === 33 ? 45 : 33);
  };

  return (
    <LinearGradient
      colors={theme.background as [string, string, ...string[]]}
      style={styles.container}
    >
      <ScrollView 
        style={[styles.safeArea, { paddingTop: insets.top }]} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backButton, { borderColor: theme.accent }]}
          >
            <ArrowLeft size={20} color={theme.accent} />
          </TouchableOpacity>
          <Text style={[styles.brandText, { color: theme.accent }]}>CLOSE-UP VIEW</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={toggleRPM} style={[styles.rpmButton, { borderColor: theme.accent }]}>
              <Text style={[styles.rpmText, { color: theme.accent }]}>{rpm} RPM</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/settings')} 
              style={[styles.settingsButton, { borderColor: theme.accent }]}
            >
              <Settings size={20} color={theme.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Close-up View Container */}
        <View style={styles.closeUpContainer}>
          {/* Extreme close-up side view of record edge with grooves */}
          <View style={styles.recordEdgeContainer}>
            {/* Record edge with perspective */}
            <Animated.View
              style={[
                styles.recordEdge,
                { transform: [{ rotate: spin }] },
              ]}
            >
              {/* Visible grooves from the side */}
              {[...Array(40)].map((_, i) => {
                const isDeep = i % 3 === 0;
                return (
                  <View
                    key={i}
                    style={[
                      styles.grooveLine,
                      {
                        top: i * (screenHeight * 0.015),
                        height: isDeep ? 4 : 2,
                        backgroundColor: isDeep ? '#0D0D0D' : '#1A1A1A',
                      },
                    ]}
                  />
                );
              })}
            </Animated.View>
            
            {/* Record surface (top part visible) */}
            <View style={styles.recordSurface}>
              <LinearGradient
                colors={['#1A1A1A', '#0D0D0D', '#0A0A0A']}
                style={styles.surfaceGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {/* Subtle reflection */}
                <View style={styles.reflection} />
              </LinearGradient>
            </View>
          </View>
          
          {/* Depth indicator */}
          <View style={styles.depthIndicator}>
            <Text style={[styles.depthText, { color: theme.text }]}>
              {isPlaying ? '♪ Grooves in Motion' : 'Vinyl Grooves Detail'}
            </Text>
          </View>
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={[styles.trackTitle, { color: theme.text }]}>
            {currentSong || currentTrack?.title || 'Saturday Morning Forever'}
          </Text>
          <Text style={[styles.trackArtist, { color: theme.text, opacity: 0.8 }]}>
            {currentTrack?.artist || 'Old Skool Apps'}
          </Text>
          <Text style={[styles.trackAlbum, { color: theme.text, opacity: 0.6 }]}>
            {currentTrack?.album || 'The Retro Renaissance'}
          </Text>
          <View style={styles.decadeBadge}>
            <Text style={[styles.decadeText, { color: theme.accent }]}>{theme.name}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handlePlayPause}
            style={[styles.controlButton, styles.playButton, { borderColor: theme.accent }]}
            testID="play-pause-button"
          >
            {isPlaying ? (
              <Pause color={theme.accent} size={32} fill={theme.accent} />
            ) : (
              <Play color={theme.accent} size={32} fill={theme.accent} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleStop}
            style={[styles.controlButton, isStopped && { backgroundColor: theme.accent + '20' }]}
            testID="stop-button"
          >
            <View style={[styles.stopIcon, { backgroundColor: theme.accent }]} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              handleStop();
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            style={styles.controlButton}
            testID="reset-button"
          >
            <RotateCcw color={theme.accent} size={24} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    minHeight: 60,
  },
  backButton: {
    backgroundColor: '#1A1A1A',
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    flexShrink: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
    flex: 1,
    textAlign: 'center' as const,
    marginHorizontal: 10,
  },
  rpmButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  rpmText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  settingsButton: {
    backgroundColor: '#1A1A1A',
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  closeUpContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  recordEdgeContainer: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.5,
    position: 'relative',
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#0A0A0A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 25,
  },
  recordEdge: {
    position: 'absolute',
    left: -20,
    top: 0,
    width: screenWidth * 0.5,
    height: screenHeight * 0.6,
    backgroundColor: '#0D0D0D',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  grooveLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    opacity: 0.8,
  },
  recordSurface: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: screenWidth * 0.6,
    overflow: 'hidden',
  },
  surfaceGradient: {
    flex: 1,
    position: 'relative',
  },
  reflection: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '80%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    transform: [{ skewY: '-5deg' }],
  },
  depthIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  depthText: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 1,
    opacity: 0.8,
  },
  trackInfo: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 30,
    marginTop: 20,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  trackArtist: {
    fontSize: 18,
    marginBottom: 4,
    textAlign: 'center' as const,
  },
  trackAlbum: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  decadeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  decadeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
    gap: 12,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
  },
  stopIcon: {
    width: 24,
    height: 24,
    borderRadius: 3,
  },
});
