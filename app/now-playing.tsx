import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import {
  ArrowLeft,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useRecord } from './context/RecordContext';

export default function NowPlayingScreen() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const ALBUM_SIZE = screenWidth * 0.7;
  
  const insets = useSafeAreaInsets();
  const { selectedRecord } = useRecord();
  
  // Always playing - no play state needed
  
  // Animation values
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const lightAnimation = useRef(new Animated.Value(0)).current;
  
  // Only show this view if there's a cover image
  const hasCover = selectedRecord?.coverImage;
  
  // Ensure values are initialized to exactly correct starting values on mount
  useEffect(() => {
    glowAnimation.setValue(0);
    pulseAnimation.setValue(1);
    lightAnimation.setValue(0);
  }, []);
  
  useEffect(() => {
    // Always run animations if has cover
    if (hasCover) {
      // Small delay to ensure layout is complete before starting animations
      const timer = setTimeout(() => {
        // Glow animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnimation, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: false,
            }),
            Animated.timing(glowAnimation, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: false,
            }),
          ])
        ).start();
        
        // Pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimation, {
              toValue: 1.05,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnimation, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
        
        // Light sparkle animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(lightAnimation, {
              toValue: 1,
              duration: 800,
              useNativeDriver: false,
            }),
            Animated.timing(lightAnimation, {
              toValue: 0,
              duration: 1200,
              useNativeDriver: false,
            }),
          ])
        ).start();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [hasCover, glowAnimation, pulseAnimation, lightAnimation]);
  
  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });
  
  const lightOpacity = lightAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });
  
  if (!hasCover) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.back();
            }}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.noCoverContainer}>
          <Text style={styles.noCoverText}>No Album Cover</Text>
          <Text style={styles.noCoverSubtext}>
            This view only works for albums with cover images
          </Text>
          <TouchableOpacity 
            style={styles.goBackButton}
            onPress={() => router.back()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a', '#000000']}
      style={styles.container}
    >
      <ScrollView
        style={[styles.scrollView, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.back();
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.placeholder} />
        <View style={styles.placeholder} />
      </View>
      
      {/* Glowing NOW PLAYING Text */}
      <View style={styles.signContainer}>
        {/* Multiple text layers for glow effect */}
        <Text style={[styles.glowText, styles.glowTextOuter]}>NOW PLAYING</Text>
        <Text style={[styles.glowText, styles.glowTextMiddle]}>NOW PLAYING</Text>
        <Text style={[styles.glowText, styles.glowTextInner]}>NOW PLAYING</Text>
        <Text style={styles.mainText}>NOW PLAYING</Text>
        
        {/* Animated sparkles around text */}
        {[...Array(6)].map((_, i) => {
          const positions = [
            { left: '10%', top: '20%' },
            { right: '15%', top: '15%' },
            { left: '5%', bottom: '25%' },
            { right: '8%', bottom: '20%' },
            { left: '50%', top: '5%' },
            { right: '45%', bottom: '10%' }
          ];
          
          return (
            <Animated.View
              key={`text-sparkle-${i}`}
              style={[
                styles.textSparkle,
                positions[i],
                {
                  opacity: lightOpacity,
                },
              ]}
            />
          );
        })}
      </View>
      
      {/* Album Cover with Glow */}
      <View style={styles.albumContainer}>
        {/* Outer glow rings */}
        <Animated.View 
          style={[
            styles.glowRing,
            styles.glowRingOuter,
            {
              width: ALBUM_SIZE + 80,
              height: ALBUM_SIZE + 80,
              opacity: glowOpacity
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.glowRing,
            styles.glowRingMiddle,
            {
              width: ALBUM_SIZE + 40,
              height: ALBUM_SIZE + 40,
              opacity: glowOpacity
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.glowRing,
            styles.glowRingInner,
            {
              width: ALBUM_SIZE + 20,
              height: ALBUM_SIZE + 20,
              opacity: glowOpacity
            }
          ]} 
        />
        
        {/* Sparkle lights */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const radius = ALBUM_SIZE * 0.65;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <Animated.View
              key={`sparkle-${i}`}
              style={[
                styles.sparkleLight,
                {
                  left: screenWidth / 2 + x - 3,
                  top: screenHeight / 2 + y - 3 - 50,
                  opacity: lightOpacity,
                },
              ]}
            />
          );
        })}
        
        {/* Album Cover */}
        <Animated.View 
          style={[
            styles.albumCover,
            {
              width: ALBUM_SIZE,
              height: ALBUM_SIZE,
              transform: [{ scale: pulseAnimation }]
            }
          ]}
        >
          <Image 
            source={{ uri: selectedRecord.coverImage }} 
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.coverOverlay} />
        </Animated.View>
      </View>
      
      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.albumName} numberOfLines={2}>
          {selectedRecord.albumName}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {selectedRecord.artistName}
        </Text>
      </View>
      

      
        {/* Bottom ambient lights */}
        <View style={styles.ambientLights}>
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={`ambient-${i}`}
              style={[
                styles.ambientLight,
                {
                  left: (i * (screenWidth / 7)) + 20,
                  opacity: lightOpacity,
                },
              ]}
            />
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  placeholder: {
    width: 40,
  },
  noCoverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noCoverText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  noCoverSubtext: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center' as const,
    lineHeight: 24,
    marginBottom: 32,
  },
  goBackButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#333333',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#555555',
  },
  goBackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  signContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
    position: 'relative',
    height: 50,
  },
  glowText: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 4,
    textAlign: 'center' as const,
    textTransform: 'uppercase' as const,
  },
  glowTextOuter: {
    color: 'rgba(255, 255, 255, 0.3)',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    opacity: 0.5,
    zIndex: 1,
  },
  glowTextMiddle: {
    color: 'rgba(255, 255, 255, 0.6)',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    opacity: 0.7,
    zIndex: 2,
  },
  glowTextInner: {
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    opacity: 0.8,
    zIndex: 3,
  },
  mainText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 4,
    textAlign: 'center' as const,
    textTransform: 'uppercase' as const,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    zIndex: 4,
    opacity: 0.9,
  },
  textSparkle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 8,
  },
  albumContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 20,
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  glowRingOuter: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 15,
  },
  glowRingMiddle: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  glowRingInner: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  sparkleLight: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 10,
  },
  albumCover: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 20,
    backfaceVisibility: 'hidden' as const,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden' as const,
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  trackInfo: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 40,
    marginBottom: 40,
  },
  albumName: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  artistName: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#CCCCCC',
    textAlign: 'center' as const,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  songName: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: '#00FF00',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
  },
  ambientLights: {
    position: 'relative',
    marginTop: 40,
    left: 0,
    right: 0,
    height: 4,
  },
  ambientLight: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
});