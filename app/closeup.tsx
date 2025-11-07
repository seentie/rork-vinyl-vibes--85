import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  Settings,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useRecord } from './context/RecordContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CloseUpScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStopped, setIsStopped] = useState(true);
  const [rpm, setRpm] = useState<33 | 45>(33);
  
  const { selectedRecord, currentSong, tracks } = useRecord();
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const stylusPosition = useRef(new Animated.Value(0)).current;
  const spinAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const stylusAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const insets = useSafeAreaInsets();

  const currentTrack = tracks[0] || {
    title: 'Saturday Morning Forever',
    artist: 'Old Skool Apps',
    album: 'The Retro Renaissance',
  };

  const theme = {
    background: ['#1A1A1A', '#2A2A2A', '#1A1A1A'],
    accent: '#FFD700',
    vinyl: ['#1A1A1A', '#0D0D0D'],
    text: '#FFFFFF',
  };

  // Spinning effect
  useEffect(() => {
    if (spinAnimation.current) {
      spinAnimation.current.stop();
    }
    
    if (isPlaying && !isStopped) {
      const duration = rpm === 45 ? 1333 : 1818;
      
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

  // Stylus movement
  useEffect(() => {
    if (isPlaying && !isStopped) {
      const currentValue = (stylusPosition as any)._value || 0;
      stylusAnimation.current = Animated.timing(stylusPosition, {
        toValue: 1,
        duration: (1 - currentValue) * 180000,
        useNativeDriver: true,
      });
      stylusAnimation.current.start();
    } else {
      if (stylusAnimation.current) {
        stylusAnimation.current.stop();
      }
      
      if (isStopped) {
        Animated.timing(stylusPosition, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    }

    return () => {
      if (stylusAnimation.current) {
        stylusAnimation.current.stop();
      }
    };
  }, [isPlaying, isStopped, stylusPosition]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'clamp',
  });

  const stylusProgressX = stylusPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, screenWidth * 0.35],
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
      <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backButton, { borderColor: theme.accent }]}
          >
            <ArrowLeft size={20} color={theme.accent} />
          </TouchableOpacity>
          <Text style={[styles.brandText, { color: theme.accent }]}>CLOSE UP</Text>
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

        {/* Close-up view of record player */}
        <View style={styles.playerContainer}>
          {/* Turntable surface - angled perspective */}
          <View style={styles.turntableSurface}>
            {/* Record on platter */}
            <View style={styles.recordContainer}>
              <Animated.View
                style={[
                  styles.record,
                  { transform: [{ rotate: spin }] },
                ]}
              >
                {/* Record grooves */}
                {[...Array(15)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.groove,
                      {
                        width: screenWidth * 0.85 - (i * 25),
                        height: screenWidth * 0.85 - (i * 25),
                      },
                    ]}
                  />
                ))}
                
                {/* Record Label */}
                <View style={[styles.label, { backgroundColor: theme.accent }]}>
                  <Text 
                    style={styles.labelTitle} 
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {selectedRecord?.albumName || currentTrack?.album || 'The Retro Renaissance'}
                  </Text>
                  <Text 
                    style={styles.labelArtist}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {selectedRecord?.artistName || currentTrack?.artist || 'Old Skool Apps'}
                  </Text>
                  <View style={styles.centerHole} />
                </View>
              </Animated.View>
            </View>

            {/* Stylus arm positioned on the record */}
            <Animated.View
              style={[
                styles.stylusArmContainer,
                {
                  transform: [
                    { translateX: stylusProgressX },
                  ],
                },
              ]}
            >
              <View style={styles.stylusArm}>
                <View style={styles.stylusBase} />
                <View style={styles.stylusShaft} />
                <View style={styles.stylusCartridge}>
                  <View style={styles.stylusNeedle} />
                </View>
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={[styles.trackTitle, { color: theme.text }]}>
            {currentSong || currentTrack?.title || 'Saturday Morning Forever'}
          </Text>
          <Text style={[styles.trackArtist, { color: theme.text, opacity: 0.8 }]}>
            {selectedRecord?.artistName || currentTrack?.artist || 'Old Skool Apps'}
          </Text>
          <Text style={[styles.trackAlbum, { color: theme.text, opacity: 0.6 }]}>
            {selectedRecord?.albumName || currentTrack?.album || 'The Retro Renaissance'}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handlePlayPause}
            style={[styles.controlButton, styles.playButton, { borderColor: theme.accent }]}
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
          >
            <View style={[styles.stopIcon, { backgroundColor: theme.accent }]} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleStop}
            style={styles.controlButton}
          >
            <RotateCcw color={theme.accent} size={24} />
          </TouchableOpacity>
        </View>
      </View>
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
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 2,
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
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  turntableSurface: {
    width: screenWidth * 0.95,
    height: screenHeight * 0.5,
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
  },
  recordContainer: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -(screenWidth * 0.85) / 2,
    width: screenWidth * 0.85,
    height: screenWidth * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  record: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  groove: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
  },
  label: {
    width: screenWidth * 0.3,
    height: screenWidth * 0.3,
    borderRadius: (screenWidth * 0.3) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    padding: 10,
    position: 'relative',
  },
  labelTitle: {
    fontSize: 11,
    fontWeight: '900' as const,
    color: '#1A0E08',
    letterSpacing: 0.3,
    textAlign: 'center' as const,
    maxWidth: screenWidth * 0.25,
  },
  labelArtist: {
    fontSize: 9,
    color: '#2C1810',
    marginTop: 2,
    textAlign: 'center' as const,
    maxWidth: screenWidth * 0.25,
  },
  centerHole: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0A0A0A',
  },
  stylusArmContainer: {
    position: 'absolute',
    top: '20%',
    right: screenWidth * 0.15,
    width: 140,
    height: 100,
  },
  stylusArm: {
    position: 'relative',
    width: 140,
    height: 100,
  },
  stylusBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 22,
    height: 22,
    backgroundColor: '#A8A8A8',
    borderRadius: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  stylusShaft: {
    position: 'absolute',
    top: 10,
    left: 22,
    width: 80,
    height: 5,
    backgroundColor: '#B5B5B5',
    borderRadius: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  stylusCartridge: {
    position: 'absolute',
    top: 6,
    left: 102,
    width: 18,
    height: 12,
    backgroundColor: '#909090',
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  stylusNeedle: {
    position: 'absolute',
    bottom: -10,
    left: 8,
    width: 2,
    height: 12,
    backgroundColor: '#606060',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  trackInfo: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginVertical: 20,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 4,
    textAlign: 'center' as const,
  },
  trackArtist: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center' as const,
  },
  trackAlbum: {
    fontSize: 14,
    textAlign: 'center' as const,
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
