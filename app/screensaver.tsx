import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
  useWindowDimensions,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useRecord } from './context/RecordContext';

type ScreensaverStyle = 'bounce' | 'zoom' | 'float' | 'rotate' | 'fade' | 'kaleidoscope';

export default function ScreensaverScreen() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { selectedRecord } = useRecord();
  const params = useLocalSearchParams();
  const mode = params.mode as string || 'screensaver';
  
  const [currentStyle, setCurrentStyle] = useState<ScreensaverStyle>(mode === 'kaleidoscope' ? 'kaleidoscope' : 'bounce');
  const [showHeader, setShowHeader] = useState(false);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  
  // Animation values
  const bounceX = useRef(new Animated.Value(screenWidth / 2)).current;
  const bounceY = useRef(new Animated.Value(screenHeight / 2)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  
  // Velocity for bounce
  const velocityX = useRef(2);
  const velocityY = useRef(2);
  const currentX = useRef(screenWidth / 2);
  const currentY = useRef(screenHeight / 2);
  
  const ALBUM_SIZE = Math.min(screenWidth, screenHeight) * 0.4;
  const KALEIDOSCOPE_SIZE = Math.max(screenWidth, screenHeight) * 1.2;
  
  // Switch styles every 10 seconds (only if in screensaver mode)
  useEffect(() => {
    if (mode === 'kaleidoscope') {
      setCurrentStyle('kaleidoscope');
      return;
    }
    
    const styles: ScreensaverStyle[] = ['bounce', 'zoom', 'float', 'rotate', 'fade'];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % styles.length;
      setCurrentStyle(styles[currentIndex]);
      
      // Reset animations
      currentX.current = screenWidth / 2;
      currentY.current = screenHeight / 2;
      bounceX.setValue(screenWidth / 2);
      bounceY.setValue(screenHeight / 2);
      scale.setValue(1);
      rotation.setValue(0);
      opacity.setValue(1);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [screenWidth, screenHeight, bounceX, bounceY, scale, rotation, opacity, mode]);
  
  // Bounce animation
  useEffect(() => {
    if (currentStyle !== 'bounce') return;
    
    const animate = () => {
      const newX = currentX.current + velocityX.current;
      if (newX <= ALBUM_SIZE / 2 || newX >= screenWidth - ALBUM_SIZE / 2) {
        velocityX.current *= -1;
      }
      currentX.current = Math.max(ALBUM_SIZE / 2, Math.min(screenWidth - ALBUM_SIZE / 2, newX));
      bounceX.setValue(currentX.current);
      
      const newY = currentY.current + velocityY.current;
      if (newY <= ALBUM_SIZE / 2 + insets.top + 60 || newY >= screenHeight - ALBUM_SIZE / 2 - insets.bottom - 60) {
        velocityY.current *= -1;
      }
      currentY.current = Math.max(
        ALBUM_SIZE / 2 + insets.top + 60,
        Math.min(screenHeight - ALBUM_SIZE / 2 - insets.bottom - 60, newY)
      );
      bounceY.setValue(currentY.current);
    };
    
    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [currentStyle, screenWidth, screenHeight, ALBUM_SIZE, insets, bounceX, bounceY]);
  
  // Zoom animation
  useEffect(() => {
    if (currentStyle !== 'zoom') return;
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.7,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [currentStyle, scale]);
  
  // Float animation
  useEffect(() => {
    if (currentStyle !== 'float') return;
    
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(bounceX, {
            toValue: centerX + 100,
            duration: 4000,
            useNativeDriver: false,
          }),
          Animated.timing(bounceX, {
            toValue: centerX - 100,
            duration: 4000,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.timing(bounceY, {
            toValue: centerY - 80,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(bounceY, {
            toValue: centerY + 80,
            duration: 3000,
            useNativeDriver: false,
          }),
        ]),
      ])
    ).start();
  }, [currentStyle, screenWidth, screenHeight, bounceX, bounceY]);
  
  // Rotate animation
  useEffect(() => {
    if (currentStyle !== 'rotate') return;
    
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, [currentStyle, rotation]);
  
  // Fade animation
  useEffect(() => {
    if (currentStyle !== 'fade') return;
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [currentStyle, opacity]);
  
  // Kaleidoscope animation - rotates multiple copies at different speeds
  const rotation2 = useRef(new Animated.Value(0)).current;
  const rotation3 = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  
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
  
  useEffect(() => {
    if (currentStyle !== 'kaleidoscope') return;
    
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();
    
    Animated.loop(
      Animated.timing(rotation2, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
    
    Animated.loop(
      Animated.timing(rotation3, {
        toValue: 1,
        duration: 25000,
        useNativeDriver: true,
      })
    ).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [currentStyle, rotation, rotation2, rotation3, pulse]);
  
  if (!selectedRecord?.coverImage) {
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
            <ArrowLeft size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const rotationDegrees = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const getAnimatedStyle = () => {
    const baseStyle = {
      width: ALBUM_SIZE,
      height: ALBUM_SIZE,
    };
    
    switch (currentStyle) {
      case 'bounce':
        return {
          ...baseStyle,
          position: 'absolute' as const,
          left: bounceX,
          top: bounceY,
          marginLeft: -ALBUM_SIZE / 2,
          marginTop: -ALBUM_SIZE / 2,
        };
      
      case 'zoom':
        return {
          ...baseStyle,
          transform: [{ scale }],
        };
      
      case 'float':
        return {
          ...baseStyle,
          position: 'absolute' as const,
          left: bounceX,
          top: bounceY,
          marginLeft: -ALBUM_SIZE / 2,
          marginTop: -ALBUM_SIZE / 2,
        };
      
      case 'rotate':
        return {
          ...baseStyle,
          transform: [{ rotate: rotationDegrees }],
        };
      
      case 'fade':
        return {
          ...baseStyle,
          opacity,
        };
      
      case 'kaleidoscope':
        return baseStyle;
      
      default:
        return baseStyle;
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={1}
      onPress={handleScreenTap}
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
          <ArrowLeft size={24} color="#000000" />
        </TouchableOpacity>
      </Animated.View>
      
      <View style={styles.screensaverContainer}>
        {currentStyle === 'kaleidoscope' ? (
          <View style={styles.kaleidoscopeContainer}>
            {/* Outer ring - 12 segments */}
            {[...Array(12)].map((_, i) => {
              const rotateZ = rotation.interpolate({
                inputRange: [0, 1],
                outputRange: [`${i * 30}deg`, `${i * 30 + 360}deg`],
              });
              
              return (
                <Animated.View
                  key={`outer-${i}`}
                  style={[
                    styles.kaleidoscopeSegment,
                    {
                      width: KALEIDOSCOPE_SIZE * 0.55,
                      height: KALEIDOSCOPE_SIZE * 0.55,
                      transform: [
                        { rotate: rotateZ },
                        { scale: pulse },
                      ],
                    },
                  ]}
                >
                  <View style={styles.albumCover}>
                    <Image 
                      source={{ uri: selectedRecord.coverImage }} 
                      style={styles.coverImage}
                      resizeMode="cover"
                    />
                    <View style={[styles.kaleidoscopeOverlay, { opacity: 0.2 }]} />
                  </View>
                </Animated.View>
              );
            })}
            
            {/* Middle ring - 8 segments, counter rotation */}
            {[...Array(8)].map((_, i) => {
              const rotateZ = rotation2.interpolate({
                inputRange: [0, 1],
                outputRange: [`${i * 45 + 360}deg`, `${i * 45}deg`],
              });
              
              return (
                <Animated.View
                  key={`middle-${i}`}
                  style={[
                    styles.kaleidoscopeSegment,
                    {
                      width: KALEIDOSCOPE_SIZE * 0.38,
                      height: KALEIDOSCOPE_SIZE * 0.38,
                      transform: [
                        { rotate: rotateZ },
                      ],
                    },
                  ]}
                >
                  <View style={styles.albumCover}>
                    <Image 
                      source={{ uri: selectedRecord.coverImage }} 
                      style={styles.coverImage}
                      resizeMode="cover"
                    />
                    <View style={[styles.kaleidoscopeOverlay, { opacity: 0.15 }]} />
                  </View>
                </Animated.View>
              );
            })}
            
            {/* Inner ring - 6 segments */}
            {[...Array(6)].map((_, i) => {
              const rotateZ = rotation3.interpolate({
                inputRange: [0, 1],
                outputRange: [`${i * 60}deg`, `${i * 60 + 360}deg`],
              });
              
              return (
                <Animated.View
                  key={`inner-${i}`}
                  style={[
                    styles.kaleidoscopeSegment,
                    {
                      width: KALEIDOSCOPE_SIZE * 0.25,
                      height: KALEIDOSCOPE_SIZE * 0.25,
                      transform: [
                        { rotate: rotateZ },
                        { scale: pulse },
                      ],
                    },
                  ]}
                >
                  <View style={styles.albumCover}>
                    <Image 
                      source={{ uri: selectedRecord.coverImage }} 
                      style={styles.coverImage}
                      resizeMode="cover"
                    />
                    <View style={[styles.kaleidoscopeOverlay, { opacity: 0.1 }]} />
                  </View>
                </Animated.View>
              );
            })}
            
            {/* Center piece - pulsing */}
            <Animated.View 
              style={[
                styles.kaleidoscopeCenter,
                {
                  width: KALEIDOSCOPE_SIZE * 0.15,
                  height: KALEIDOSCOPE_SIZE * 0.15,
                  transform: [{ scale: pulse }],
                }
              ]}
            >
              <Image 
                source={{ uri: selectedRecord.coverImage }} 
                style={styles.coverImage}
                resizeMode="cover"
              />
            </Animated.View>
          </View>
        ) : (
          <Animated.View style={[styles.albumWrapper, getAnimatedStyle()]}>
            <View style={styles.albumCover}>
              <Image 
                source={{ uri: selectedRecord.coverImage }} 
                style={styles.coverImage}
                resizeMode="cover"
              />
            </View>
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 6,
  },
  screensaverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumCover: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  kaleidoscopeContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kaleidoscopeSegment: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kaleidoscopeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  kaleidoscopeCenter: {
    borderRadius: 1000,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 15,
  },
});
