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
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Edit2,
  X,
  Check,
  List,
  Plus,
  Trash2,
  ArrowRight,
  Music,
  Radio,
  Sparkles,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useRecord } from './context/RecordContext';

const { width: screenWidth } = Dimensions.get('window');
const STYLUS_SIZE = screenWidth * 0.8;



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

export default function StylusViewScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStopped, setIsStopped] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [rpm, setRpm] = useState<33 | 45>(33);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof decadeThemes>('1950s');
  const [aiTheme, setAiTheme] = useState(decadeThemes.ai);
  const [youPickTheme, setYouPickTheme] = useState(decadeThemes.youPick);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [showYouPickModal, setShowYouPickModal] = useState(false);
  const [youPickDescription, setYouPickDescription] = useState('');

  const { selectedRecord, currentSong, tracks, updateCurrentSong, stylusMovementEnabled, toggleStylusMovement, addSongToRecord, removeSongFromRecord, selectSongFromRecord } = useRecord();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSongListModal, setShowSongListModal] = useState(false);
  const [tempCurrentSong, setTempCurrentSong] = useState(currentSong);
  const [newSongTitle, setNewSongTitle] = useState('');
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const stylusPosition = useRef(new Animated.Value(0)).current;

  const spinAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const stylusAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const insets = useSafeAreaInsets();

  // Ensure values are initialized to exactly 0 on mount
  useEffect(() => {
    spinValue.setValue(0);
    stylusPosition.setValue(0);
  }, []);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  
  // Update temp song when context song changes
  useEffect(() => {
    setTempCurrentSong(currentSong);
  }, [currentSong]);
  
  const theme = currentTheme === 'ai' ? aiTheme : currentTheme === 'youPick' ? youPickTheme : decadeThemes[currentTheme];

  // Spinning effect controlled by play state
  useEffect(() => {
    // Stop any existing animation first
    if (spinAnimation.current) {
      spinAnimation.current.stop();
      spinAnimation.current = null;
    }
    
    if (isPlaying && !isStopped) {
      const duration = rpm === 45 ? 1333 : 1818;
      
      // Get current rotation value (0-1)
      const currentValue = (spinValue as any)._value || 0;
      
      // Calculate how far we are into the current rotation
      // Keep the rotation continuous by starting from current position
      const normalizedValue = currentValue % 1;
      
      // Set the starting position to current normalized value
      spinValue.setValue(normalizedValue);
      
      // Create loop animation from current position
      spinAnimation.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: normalizedValue + 1000, // Large number to keep spinning
          duration: duration * 1000, // Multiply duration to match large toValue
          useNativeDriver: true,
          easing: (t) => t,
        })
      );
      
      spinAnimation.current.start();
    }
    // If paused or stopped, keep current position - don't reset

    return () => {
      if (spinAnimation.current) {
        spinAnimation.current.stop();
        spinAnimation.current = null;
      }
    };
  }, [rpm, isPlaying, isStopped, spinValue, stylusPosition]);

  // Handle stylus movement
  // The stylus should take about 3 minutes per track/ridge on a real vinyl
  // With 12 grooves, the total duration should be around 36 minutes for the full record
  useEffect(() => {
    if (stylusMovementEnabled && isPlaying && !isStopped) {
      const currentValue = (stylusPosition as any)._value || 0;
      // 2160000ms = 36 minutes (3 minutes per ridge × 12 ridges)
      stylusAnimation.current = Animated.timing(stylusPosition, {
        toValue: 1,
        duration: (1 - currentValue) * 2160000,
        useNativeDriver: true,
      });
      stylusAnimation.current.start();
    } else {
      if (stylusAnimation.current) {
        stylusAnimation.current.stop();
      }
      
      if (isStopped || !stylusMovementEnabled) {
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
  }, [isPlaying, isStopped, stylusPosition, stylusMovementEnabled]);



  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  const stylusRotate = stylusPosition.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-25deg'],
    extrapolate: 'clamp',
  });



  const handleStop = () => {
    if (spinAnimation.current) {
      spinAnimation.current.stop();
      spinAnimation.current = null;
    }
    
    if (stylusAnimation.current) {
      stylusAnimation.current.stop();
    }
    
    // Keep the current rotation and stylus position exactly where they are
    // Don't modify spinValue or stylusPosition
    
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
    
    setRpm(current => current === 33 ? 45 : 33);
  };



  const nextTrack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Stop animations first
    if (stylusAnimation.current) {
      stylusAnimation.current.stop();
    }
    
    // Get current stylus position to calculate next groove
    const currentValue = (stylusPosition as any)._value || 0;
    // Each groove is approximately 1/12 of the record
    const nextGroovePosition = Math.min(currentValue + (1/12), 1);
    
    // Move stylus to next groove
    Animated.timing(stylusPosition, {
      toValue: nextGroovePosition,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      // If playing, resume playing from this position
      if (isPlaying) {
        // Resume will happen automatically from useEffect
      }
    });
  };

  const prevTrack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Stop animations first
    if (stylusAnimation.current) {
      stylusAnimation.current.stop();
    }
    
    // Lift stylus up and reset to starting position
    const wasPlaying = isPlaying;
    setIsPlaying(false);
    setIsStopped(true);
    
    // Animate stylus lifting back to start
    Animated.timing(stylusPosition, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      // After stylus returns to start, change track
      setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
      
      // If it was playing before, restart after a brief pause
      if (wasPlaying) {
        setTimeout(() => {
          setIsStopped(false);
          setIsPlaying(true);
        }, 300);
      }
    });
  };



  const generateAITheme = async (albumName: string, artistName: string, coverImageUri?: string) => {
    if (isGeneratingTheme) return;
    
    setIsGeneratingTheme(true);
    
    try {
      console.log('Generating theme for:', albumName, 'by', artistName);
      
      if (!albumName?.trim() || !artistName?.trim()) {
        throw new Error('Album name and artist name are required');
      }
      
      const fallbackTheme = generateEnhancedFallbackTheme(albumName, artistName, coverImageUri);
      setAiTheme(fallbackTheme);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        'Custom Theme Created!', 
        `Created a beautiful color scheme that matches "${albumName}" by ${artistName}.`,
        [{ text: 'Great!' }]
      );
      
    } catch (error) {
      console.error('Error in generateAITheme:', error);
      
      const fallbackTheme = generateEnhancedFallbackTheme(albumName, artistName, coverImageUri);
      setAiTheme(fallbackTheme);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        'Custom Theme Created!', 
        `Created a beautiful color scheme that matches "${albumName}" by ${artistName}.`,
        [{ text: 'Great!' }]
      );
    } finally {
      setIsGeneratingTheme(false);
    }
  };
  
  // Intelligent fallback color generator based on text description
  const generateFallbackFromDescription = (description: string): typeof decadeThemes.youPick => {
    const desc = description.toLowerCase();
    
    console.log('Generating fallback theme for description:', desc);
    
    // Color keyword detection with more variations
    const colorMatches: { color: string; position: number; name: string }[] = [];
    
    // Define color patterns with their hex values - order matters for priority
    const colorPatterns = [
      { pattern: /\b(sea\s*green|seafoam|aquamarine)\b/i, hex: '#14B8A6', name: 'teal' },
      { pattern: /\b(teal|turquoise|cyan)\b/i, hex: '#14B8A6', name: 'teal' },
      { pattern: /\b(red|crimson|scarlet|ruby|burgundy)\b/i, hex: '#EF4444', name: 'red' },
      { pattern: /\b(orange|tangerine|coral)\b/i, hex: '#F97316', name: 'orange' },
      { pattern: /\b(peach)\b/i, hex: '#FFDAB9', name: 'peach' },
      { pattern: /\b(yellow|lemon)\b/i, hex: '#FFD700', name: 'yellow' },
      { pattern: /\b(gold|golden|amber)\b/i, hex: '#FFD700', name: 'gold' },
      { pattern: /\b(lime)\b/i, hex: '#84CC16', name: 'lime' },
      { pattern: /\b(green|emerald|mint|forest)\b/i, hex: '#10B981', name: 'green' },
      { pattern: /\b(blue|azure|cobalt|sapphire)\b/i, hex: '#3B82F6', name: 'blue' },
      { pattern: /\b(navy)\b/i, hex: '#1E3A8A', name: 'navy' },
      { pattern: /\b(sky|ocean)\b/i, hex: '#38BDF8', name: 'sky' },
      { pattern: /\b(purple|violet|indigo|plum)\b/i, hex: '#A855F7', name: 'purple' },
      { pattern: /\b(lavender)\b/i, hex: '#C4B5FD', name: 'lavender' },
      { pattern: /\b(pink|rose|blush)\b/i, hex: '#EC4899', name: 'pink' },
      { pattern: /\b(fuchsia|magenta)\b/i, hex: '#D946EF', name: 'fuchsia' },
    ];
    
    // Find all color matches with their positions in the description
    colorPatterns.forEach(({ pattern, hex, name }) => {
      let match;
      let searchPos = 0;
      // Find all occurrences of this color
      while ((match = desc.slice(searchPos).match(pattern)) !== null) {
        const actualPosition = searchPos + (match.index || 0);
        // Avoid duplicates at the same position
        if (!colorMatches.some(m => m.position === actualPosition)) {
          colorMatches.push({ color: hex, position: actualPosition, name });
          console.log(`Found ${name} at position ${actualPosition}`);
        }
        searchPos = actualPosition + match[0].length;
        if (searchPos >= desc.length) break;
      }
    });
    
    // Sort by position to maintain order from description
    colorMatches.sort((a, b) => a.position - b.position);
    
    // Remove duplicate colors while preserving order
    const uniqueColors: string[] = [];
    const seenColors = new Set<string>();
    colorMatches.forEach(({ color }) => {
      if (!seenColors.has(color)) {
        uniqueColors.push(color);
        seenColors.add(color);
      }
    });
    
    console.log('Detected unique colors in order:', uniqueColors);
    
    // Check for modifiers
    const hasShimmer = /\b(shimmer|sparkle|sparkles|glitter|metallic|shine|shiny|glow|iridescent|glowing)\b/i.test(desc);
    const isNeon = /\bneon\b/i.test(desc);
    const isPastel = /\bpastel\b/i.test(desc);
    const isDark = /\bdark\b/i.test(desc);
    const isBright = /\b(bright|vibrant|vivid)\b/i.test(desc);
    
    console.log('Modifiers:', { hasShimmer, isNeon, isPastel, isDark, isBright });
    
    // Apply modifiers to colors
    const modifiedColors = uniqueColors.map(color => {
      if (isNeon) return lightenColor(color, 0.3);
      if (isPastel) return blendColors(color, '#FFFFFF', 0.6);
      if (isDark) return darkenColor(color, 0.3);
      if (isBright) return lightenColor(color, 0.15);
      return color;
    });
    
    console.log('Modified colors:', modifiedColors);
    
    // Default to sunset if no colors detected
    if (modifiedColors.length === 0) {
      console.log('No colors detected, using default sunset');
      modifiedColors.push('#FF6347', '#FF69B4', '#9370DB');
    }
    
    // Create a 3-color gradient
    let finalColors: string[];
    
    if (modifiedColors.length === 1) {
      // Single color: create variations
      const baseColor = modifiedColors[0];
      if (hasShimmer) {
        finalColors = [baseColor, blendColors(baseColor, '#FFD700', 0.5), lightenColor(baseColor, 0.2)];
      } else {
        finalColors = [darkenColor(baseColor, 0.15), baseColor, lightenColor(baseColor, 0.15)];
      }
    } else if (modifiedColors.length === 2) {
      // Two colors: create smooth blend
      if (hasShimmer) {
        // Blend both colors together with a shimmer effect
        // Create a middle color that's a blend of both with added brightness
        const midColor = blendColors(modifiedColors[0], modifiedColors[1], 0.5);
        const shimmerMid = lightenColor(midColor, 0.2);
        finalColors = [modifiedColors[0], shimmerMid, modifiedColors[1]];
      } else {
        // Create smooth transition
        const midColor = blendColors(modifiedColors[0], modifiedColors[1], 0.5);
        finalColors = [modifiedColors[0], midColor, modifiedColors[1]];
      }
    } else if (modifiedColors.length === 3) {
      // Perfect! Use all three
      if (hasShimmer) {
        // Add subtle shimmer to middle color
        finalColors = [
          modifiedColors[0], 
          blendColors(modifiedColors[1], '#FFD700', 0.15), 
          modifiedColors[2]
        ];
      } else {
        finalColors = modifiedColors;
      }
    } else {
      // More than 3 colors: use first, middle, and last
      const midIndex = Math.floor(modifiedColors.length / 2);
      if (hasShimmer) {
        finalColors = [
          modifiedColors[0], 
          blendColors(modifiedColors[midIndex], '#FFD700', 0.15), 
          modifiedColors[modifiedColors.length - 1]
        ];
      } else {
        finalColors = [
          modifiedColors[0], 
          modifiedColors[midIndex], 
          modifiedColors[modifiedColors.length - 1]
        ];
      }
    }
    
    console.log('Final gradient colors:', finalColors);
    
    const background = [finalColors[0], finalColors[1], finalColors[2]] as [string, string, string];
    const accent = hasShimmer ? lightenColor(finalColors[1], 0.3) : lightenColor(finalColors[1], 0.2);
    
    const vinyl = isDark ? ['#000000', '#0A0A0A'] : ['#1A1A2E', '#0F0F1E'] as [string, string];
    const text = '#FFFFFF';
    
    return {
      name: 'You Pick',
      background,
      accent,
      vinyl,
      text
    };
  };
  
  // Helper function to blend two hex colors
  const blendColors = (color1: string, color2: string, ratio: number = 0.5): string => {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);
    
    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);
    
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };
  
  // Helper function to lighten a color
  const lightenColor = (color: string, amount: number): string => {
    return blendColors(color, '#FFFFFF', amount);
  };
  
  // Helper function to darken a color
  const darkenColor = (color: string, amount: number): string => {
    return blendColors(color, '#000000', amount);
  };
  
  // Enhanced fallback theme generator with more sophisticated album/artist analysis
  const generateEnhancedFallbackTheme = (albumName: string, artistName: string, coverImageUri?: string) => {
    const album = albumName.toLowerCase();
    const artist = artistName.toLowerCase();
    
    // Define color palettes based on actual album covers and characteristics
    const colorPalettes = {
      // Specific iconic albums with accurate cover colors
      kindOfBlue: {
        background: ['#0F1B3C', '#1E3A8A', '#3B82F6'], // Deep blues matching the cover
        accent: '#60A5FA',
        vinyl: ['#1E1B4B', '#0F0F23'],
        text: '#DBEAFE'
      },
      // Françoise Hardy albums - typically vintage, muted tones
      francoiseHardy: {
        background: ['#8B7355', '#A0522D', '#D2B48C'], // Warm browns and vintage tones
        accent: '#DEB887',
        vinyl: ['#2F1B14', '#1A0E08'],
        text: '#F5F5DC'
      },
      commentTeDireAdieu: {
        background: ['#704214', '#8B4513', '#CD853F'], // Sepia and brown tones
        accent: '#F4A460',
        vinyl: ['#2F1B14', '#1A0E08'],
        text: '#FFF8DC'
      },
      thriller: {
        background: ['#7C2D12', '#DC2626', '#F59E0B'], // Red and orange from MJ's jacket
        accent: '#FCD34D',
        vinyl: ['#1F1F1F', '#0A0A0A'],
        text: '#FEF3C7'
      },
      darkSideOfMoon: {
        background: ['#000000', '#1F2937', '#4B5563'], // Dark with rainbow prism colors
        accent: '#F59E0B',
        vinyl: ['#111827', '#000000'],
        text: '#F9FAFB'
      },
      abbeyRoad: {
        background: ['#1F2937', '#374151', '#6B7280'], // Street and building grays
        accent: '#FBBF24',
        vinyl: ['#111827', '#000000'],
        text: '#F9FAFB'
      },
      nevermind: {
        background: ['#0EA5E9', '#38BDF8', '#7DD3FC'], // Pool water blues
        accent: '#FDE047',
        vinyl: ['#0C4A6E', '#082F49'],
        text: '#F0F9FF'
      },
      purpleRain: {
        background: ['#581C87', '#7C3AED', '#A855F7'], // Prince's purple
        accent: '#FDE047',
        vinyl: ['#312E81', '#1E1B4B'],
        text: '#FAF5FF'
      },
      lifeOfShowgirl: {
        background: ['#0D9488', '#14B8A6', '#5EEAD4'], // Sea green and shimmer
        accent: '#F97316', // Orange shimmer
        vinyl: ['#134E4A', '#0F2027'],
        text: '#F0FDFA'
      },
      // Taylor Swift albums with accurate colors
      lover: {
        background: ['#87CEEB', '#FFB6C1', '#E6E6FA'], // Baby blue and light pink from actual cover
        accent: '#FF69B4',
        vinyl: ['#4682B4', '#2F4F4F'],
        text: '#FFFFFF'
      },
      folklore: {
        background: ['#2F4F4F', '#696969', '#A9A9A9'], // Forest greens and grays
        accent: '#F5DEB3',
        vinyl: ['#1C1C1C', '#0A0A0A'],
        text: '#F5F5DC'
      },
      evermore: {
        background: ['#8B4513', '#A0522D', '#CD853F'], // Autumn browns and oranges
        accent: '#FFD700',
        vinyl: ['#2F1B14', '#1A0E08'],
        text: '#F5DEB3'
      },
      midnights: {
        background: ['#191970', '#4B0082', '#663399'], // Deep midnight blues and purples
        accent: '#FFD700',
        vinyl: ['#0F0F23', '#1E1B4B'],
        text: '#E6E6FA'
      },
      red: {
        background: ['#8B0000', '#DC143C', '#FF6347'], // Deep reds matching the album
        accent: '#FFD700',
        vinyl: ['#2F0000', '#1A0000'],
        text: '#FFFFFF'
      },
      nineteenEightyNine: {
        background: ['#87CEEB', '#B0E0E6', '#F0F8FF'], // Light blues and whites
        accent: '#FF69B4',
        vinyl: ['#4682B4', '#2F4F4F'],
        text: '#000080'
      },
      // Genre-based palettes
      jazz: {
        background: ['#2C1810', '#8B4513', '#654321'],
        accent: '#D4AF37',
        vinyl: ['#1A1A1A', '#0D0D0D'],
        text: '#F5DEB3'
      },
      blueNote: {
        background: ['#1B2951', '#2E4A7A', '#4A6FA5'],
        accent: '#87CEEB',
        vinyl: ['#0F1419', '#1A1A2E'],
        text: '#E6F3FF'
      },
      rock: {
        background: ['#8B0000', '#FF4500', '#FF6347'],
        accent: '#FFD700',
        vinyl: ['#2F0147', '#1A0033'],
        text: '#FFFFFF'
      },
      blues: {
        background: ['#191970', '#4169E1', '#6495ED'],
        accent: '#87CEEB',
        vinyl: ['#000080', '#00008B'],
        text: '#F0F8FF'
      },
      classical: {
        background: ['#4B0082', '#8A2BE2', '#9370DB'],
        accent: '#FFD700',
        vinyl: ['#2E0854', '#1A0033'],
        text: '#F8F8FF'
      },
      electronic: {
        background: ['#FF1493', '#00FFFF', '#9400D3'],
        accent: '#00FF00',
        vinyl: ['#1A1A2E', '#0F0F1E'],
        text: '#00FFFF'
      },
      folk: {
        background: ['#8FBC8F', '#228B22', '#006400'],
        accent: '#FFD700',
        vinyl: ['#2F4F2F', '#1C3A1C'],
        text: '#F5FFFA'
      },
      pop: {
        background: ['#FF69B4', '#FF1493', '#DC143C'],
        accent: '#FFFF00',
        vinyl: ['#8B008B', '#4B0082'],
        text: '#FFFFFF'
      },
      // BRAT by Charli XCX - bright lime green cover
      brat: {
        background: ['#8ACE00', '#32CD32', '#00FF00'], // Bright lime green matching the cover
        accent: '#FFFF00',
        vinyl: ['#228B22', '#006400'],
        text: '#000000'
      }
    };
    
    // Determine palette based on specific album matches first
    let selectedPalette = colorPalettes.pop; // default
    
    // Specific iconic albums with exact matches
    if (album.includes('kind of blue') || (album.includes('kind') && album.includes('blue'))) {
      selectedPalette = colorPalettes.kindOfBlue;
    } else if (album.includes('brat') && (artist.includes('charli') || artist.includes('xcx'))) {
      selectedPalette = colorPalettes.brat;
    } else if (artist.includes('françoise') || artist.includes('francoise') || artist.includes('hardy')) {
      if (album.includes('comment') || album.includes('dire') || album.includes('adieu')) {
        selectedPalette = colorPalettes.commentTeDireAdieu;
      } else {
        selectedPalette = colorPalettes.francoiseHardy;
      }
    } else if (album.includes('thriller') && artist.includes('jackson')) {
      selectedPalette = colorPalettes.thriller;
    } else if (album.includes('dark side') || (album.includes('moon') && artist.includes('floyd'))) {
      selectedPalette = colorPalettes.darkSideOfMoon;
    } else if (album.includes('abbey') && album.includes('road')) {
      selectedPalette = colorPalettes.abbeyRoad;
    } else if (album.includes('nevermind') && artist.includes('nirvana')) {
      selectedPalette = colorPalettes.nevermind;
    } else if ((album.includes('purple') && album.includes('rain')) || (album.includes('purple') && artist.includes('prince'))) {
      selectedPalette = colorPalettes.purpleRain;
    } else if (album.includes('life') && album.includes('showgirl')) {
      selectedPalette = colorPalettes.lifeOfShowgirl;
    }
    // Taylor Swift albums - specific matching
    else if (album.includes('lover') && (artist.includes('swift') || artist.includes('taylor'))) {
      selectedPalette = colorPalettes.lover;
    } else if (album.includes('folklore') && (artist.includes('swift') || artist.includes('taylor'))) {
      selectedPalette = colorPalettes.folklore;
    } else if (album.includes('evermore') && (artist.includes('swift') || artist.includes('taylor'))) {
      selectedPalette = colorPalettes.evermore;
    } else if (album.includes('midnights') && (artist.includes('swift') || artist.includes('taylor'))) {
      selectedPalette = colorPalettes.midnights;
    } else if ((album.includes('red') || album === 'red') && (artist.includes('swift') || artist.includes('taylor'))) {
      selectedPalette = colorPalettes.red;
    } else if ((album.includes('1989') || album.includes('nineteen eighty nine')) && (artist.includes('swift') || artist.includes('taylor'))) {
      selectedPalette = colorPalettes.nineteenEightyNine;
    }
    // Jazz and Blue Note artists
    else if (album.includes('blue note') || 
        artist.includes('davis') || artist.includes('coltrane') || artist.includes('monk') ||
        album.includes('jazz') || artist.includes('brubeck') || artist.includes('evans')) {
      selectedPalette = album.includes('blue') ? colorPalettes.blueNote : colorPalettes.jazz;
    }
    // Rock variations
    else if (album.includes('rock') || album.includes('metal') || album.includes('stone') ||
             artist.includes('beatles') || artist.includes('stones') || artist.includes('zeppelin')) {
      selectedPalette = colorPalettes.rock;
    }
    // Blues
    else if (album.includes('blue') || artist.includes('king') || artist.includes('waters') ||
             artist.includes('muddy') || album.includes('blues')) {
      selectedPalette = colorPalettes.blues;
    }
    // Classical
    else if (album.includes('symphony') || album.includes('concerto') || album.includes('classical') ||
             artist.includes('mozart') || artist.includes('beethoven') || artist.includes('bach')) {
      selectedPalette = colorPalettes.classical;
    }
    // Electronic
    else if (album.includes('electronic') || album.includes('techno') || album.includes('house')) {
      selectedPalette = colorPalettes.electronic;
    }
    // Folk
    else if (album.includes('folk') || artist.includes('dylan') || artist.includes('cash')) {
      selectedPalette = colorPalettes.folk;
    }
    
    return {
      name: 'AI Generated',
      background: selectedPalette.background as [string, string, string],
      accent: selectedPalette.accent,
      vinyl: selectedPalette.vinyl as [string, string],
      text: selectedPalette.text
    };
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
          <View style={[styles.backButton, { borderColor: theme.accent, opacity: 0 }]} />
          
          <Text style={[styles.brandText, { color: theme.accent }]}>VINYL VIBES &apos;85</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              onPress={toggleStylusMovement} 
              style={[styles.stylusToggleButton, { borderColor: theme.accent, backgroundColor: stylusMovementEnabled ? theme.accent + '20' : '#1A1A1A' }]}
            >
              <Text style={[styles.stylusToggleText, { color: theme.accent }]}>
                {stylusMovementEnabled ? 'MOVE' : 'FIXED'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleRPM} style={[styles.rpmButton, { borderColor: theme.accent }]}>
              <Text style={[styles.rpmText, { color: theme.accent }]}>{rpm} RPM</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowSongListModal(true)} 
              style={[styles.songListButton, { borderColor: theme.accent }]}
            >
              <List size={18} color={theme.accent} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/settings')} 
              style={[styles.settingsButton, { borderColor: theme.accent }]}
            >
              <Settings size={20} color={theme.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation Menu */}
        <View style={styles.navigationMenu}>
          <TouchableOpacity
            style={[styles.menuButton, { borderColor: theme.accent, backgroundColor: theme.accent + '15' }]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/collection');
            }}
          >
            <Music size={20} color={theme.accent} />
            <Text style={[styles.menuButtonText, { color: theme.accent }]}>My Collection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuButton, { borderColor: theme.accent, backgroundColor: theme.accent + '15' }]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/now-playing');
            }}
          >
            <Radio size={20} color={theme.accent} />
            <Text style={[styles.menuButtonText, { color: theme.accent }]}>Now Playing</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.navigationMenu}>
          <TouchableOpacity
            style={[styles.menuButton, { borderColor: theme.accent, backgroundColor: theme.accent + '15' }]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/screensaver');
            }}
          >
            <Sparkles size={20} color={theme.accent} />
            <Text style={[styles.menuButtonText, { color: theme.accent }]}>Displays</Text>
          </TouchableOpacity>
        </View>

        {/* Theme Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.themeSelector}
          contentContainerStyle={styles.themeSelectorContent}
        >
          {Object.entries(decadeThemes).map(([key, themeData]) => {
            const displayTheme = key === 'ai' ? aiTheme : key === 'youPick' ? youPickTheme : themeData;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeButton,
                  currentTheme === key && [styles.themeButtonActive, { borderColor: theme.accent }],
                  (key === 'ai' || key === 'youPick') && styles.aiThemeButton
                ]}
                onPress={() => {
                  setCurrentTheme(key as keyof typeof decadeThemes);
                  if (key === 'ai') {
                    const albumName = selectedRecord?.albumName || currentTrack?.album || 'The Retro Renaissance';
                    const artistName = selectedRecord?.artistName || currentTrack?.artist || 'Old Skool Apps';
                    const coverImageUri = selectedRecord?.coverImage;
                    generateAITheme(albumName, artistName, coverImageUri);
                  } else if (key === 'youPick') {
                    setShowYouPickModal(true);
                  }
                }}
                disabled={(key === 'ai' || key === 'youPick') && isGeneratingTheme}
              >
                <LinearGradient
                  colors={displayTheme.background as [string, string, ...string[]]}
                  style={[styles.themeGradient, (key === 'ai' || key === 'youPick') && styles.aiThemeGradient]}
                >
                  {(key === 'ai' || key === 'youPick') && isGeneratingTheme ? (
                    <Text style={[styles.themeText, { color: displayTheme.text }]}>Generating...</Text>
                  ) : (
                    <Text style={[styles.themeText, { color: displayTheme.text }]}>
                      {displayTheme.name}
                    </Text>
                  )}
                  {key === 'ai' && (
                    <Text style={[styles.aiThemeSubtext, { color: displayTheme.text }]}>✨</Text>
                  )}
                  {key === 'youPick' && (
                    <Text style={[styles.aiThemeSubtext, { color: displayTheme.text }]}>🎨</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Stylus View Container */}
        <View style={styles.stylusContainer}>
          {/* Record */}
          <View style={styles.recordContainer}>
            <Animated.View
              style={[
                styles.record,
                { transform: [{ rotate: spin }] },
              ]}
            >
              {/* Record Grooves - Enhanced visibility */}
              {[...Array(12)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.groove,
                    {
                      width: STYLUS_SIZE - (i * 20),
                      height: STYLUS_SIZE - (i * 20),
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
                  {currentTrack?.album || 'The Retro Renaissance'}
                </Text>
                <Text 
                  style={styles.labelArtist}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {currentTrack?.artist || 'Old Skool Apps'}
                </Text>
                <View style={styles.centerHole} />
              </View>
            </Animated.View>
          </View>

          {/* Stylus Arm */}
          <View style={styles.stylusArmContainer}>
            <Animated.View
              style={[
                styles.stylusArm,
                {
                  transform: [
                    { rotate: stylusRotate },
                  ],
                  transformOrigin: 'top right',
                },
              ]}
            >
              <View style={styles.stylusBase} />
              <View style={styles.stylusShaft} />
              <View style={styles.stylusHead} />
              <View style={styles.stylusNeedle} />
            </Animated.View>
          </View>


        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <TouchableOpacity 
            style={styles.songEditContainer}
            onPress={() => {
              setTempCurrentSong(currentSong);
              setShowEditModal(true);
            }}
          >
            <Text style={[styles.trackTitle, { color: theme.text }]}>
              {currentSong || currentTrack?.title || 'Saturday Morning Forever'}
            </Text>
            <Edit2 size={16} color={theme.accent} style={styles.editIcon} />
          </TouchableOpacity>
          <Text style={[styles.trackArtist, { color: theme.text, opacity: 0.8 }]}>{currentTrack?.artist || 'Old Skool Apps'}</Text>
          <Text style={[styles.trackAlbum, { color: theme.text, opacity: 0.6 }]}>{currentTrack?.album || 'The Retro Renaissance'}</Text>
          <View style={styles.decadeBadge}>
            <Text style={[styles.decadeText, { color: theme.accent }]}>{theme.name}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={prevTrack}
            style={[styles.controlButton, { borderColor: theme.accent }]}
            testID="prev-button"
          >
            <RotateCcw color={theme.accent} size={24} />
          </TouchableOpacity>

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
            onPress={nextTrack}
            style={[styles.controlButton, { borderColor: theme.accent }]}
            testID="next-button"
          >
            <ArrowRight color={theme.accent} size={24} />
          </TouchableOpacity>
        </View>

      </ScrollView>
      
      {/* Edit Song Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.background[0] }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Song Name</Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <X size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Song Title</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.accent }]}
                  value={tempCurrentSong}
                  onChangeText={setTempCurrentSong}
                  placeholder="Enter song title"
                  placeholderTextColor={`${theme.text}50`}
                  returnKeyType="done"
                  autoFocus={true}
                  onSubmitEditing={() => {
                    updateCurrentSong(tempCurrentSong);
                    setShowEditModal(false);
                  }}
                />
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setTempCurrentSong(currentSong);
                    setShowEditModal(false);
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: theme.accent }]}
                  onPress={() => {
                    updateCurrentSong(tempCurrentSong);
                    setShowEditModal(false);
                  }}
                >
                  <Check size={20} color="#FFFFFF" />
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF', marginLeft: 8 }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Song List Modal */}
      <Modal
        visible={showSongListModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSongListModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.songListModalContainer}>
            <View style={[styles.songListModalContent, { backgroundColor: theme.background[0] }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Album Songs</Text>
                <TouchableOpacity onPress={() => setShowSongListModal(false)}>
                  <X size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              
              {selectedRecord ? (
                <>
                  <Text style={[styles.albumInfo, { color: theme.text }]}>
                    {selectedRecord.albumName} by {selectedRecord.artistName}
                  </Text>
                  
                  {/* Add New Song */}
                  <View style={styles.addSongContainer}>
                    <TextInput
                      style={[styles.addSongInput, { color: theme.text, borderColor: theme.accent }]}
                      value={newSongTitle}
                      onChangeText={setNewSongTitle}
                      placeholder="Add new song..."
                      placeholderTextColor={`${theme.text}50`}
                      returnKeyType="done"
                      onSubmitEditing={() => {
                        if (newSongTitle.trim() && selectedRecord.songs && selectedRecord.songs.length < 15) {
                          addSongToRecord(newSongTitle.trim());
                          setNewSongTitle('');
                        }
                      }}
                    />
                    <TouchableOpacity 
                      style={[styles.addSongButton, { backgroundColor: theme.accent }]}
                      onPress={() => {
                        if (newSongTitle.trim() && selectedRecord.songs && selectedRecord.songs.length < 15) {
                          addSongToRecord(newSongTitle.trim());
                          setNewSongTitle('');
                        }
                      }}
                      disabled={!newSongTitle.trim() || (selectedRecord.songs && selectedRecord.songs.length >= 15)}
                    >
                      <Plus size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={[styles.songCountText, { color: theme.text }]}>
                    {selectedRecord.songs?.length || 0}/15 songs
                  </Text>
                  
                  {/* Song List */}
                  <ScrollView style={styles.songList} showsVerticalScrollIndicator={false}>
                    {selectedRecord.songs && selectedRecord.songs.length > 0 ? (
                      selectedRecord.songs.map((song, index) => (
                        <View key={`song-${index}`} style={[styles.songItem, currentSong === song && { backgroundColor: theme.accent + '20' }]}>
                          <TouchableOpacity 
                            style={styles.songItemContent}
                            onPress={() => {
                              selectSongFromRecord(song);
                              if (Platform.OS !== 'web') {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              }
                            }}
                          >
                            <View style={styles.songInfo}>
                              <Text style={[styles.songTitle, { color: theme.text }]} numberOfLines={1}>
                                {song}
                              </Text>
                              {currentSong === song && (
                                <Text style={[styles.nowPlayingText, { color: theme.accent }]}>♪ Now Playing</Text>
                              )}
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.deleteSongButton}
                            onPress={() => {
                              removeSongFromRecord(index);
                              if (Platform.OS !== 'web') {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                              }
                            }}
                          >
                            <Trash2 size={16} color="#FF6B6B" />
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <View style={styles.noSongsContainer}>
                        <Text style={[styles.noSongsText, { color: theme.text }]}>No songs added yet</Text>
                        <Text style={[styles.noSongsSubtext, { color: theme.text }]}>Add songs to create your playlist</Text>
                      </View>
                    )}
                  </ScrollView>
                </>
              ) : (
                <View style={styles.noRecordContainer}>
                  <Text style={[styles.noRecordText, { color: theme.text }]}>No Album Selected</Text>
                  <Text style={[styles.noRecordSubtext, { color: theme.text }]}>Select an album first to manage songs</Text>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* You Pick Modal */}
      <Modal
        visible={showYouPickModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYouPickModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.background[0] }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>You Pick</Text>
                <TouchableOpacity onPress={() => setShowYouPickModal(false)}>
                  <X size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Describe the colors you want</Text>
                <TextInput
                  style={[styles.youPickTextArea, { color: theme.text, borderColor: theme.accent, backgroundColor: 'rgba(255,255,255,0.1)' }]}
                  value={youPickDescription}
                  onChangeText={setYouPickDescription}
                  placeholder="e.g., warm sunset colors, ocean blues, neon cyberpunk, vintage sepia, pastel pink and purple..."
                  placeholderTextColor={`${theme.text}50`}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoFocus={true}
                />
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setYouPickDescription('');
                    setShowYouPickModal(false);
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: theme.accent, opacity: youPickDescription.trim() ? 1 : 0.5 }]}
                  onPress={() => {
                    if (!youPickDescription.trim()) return;
                    
                    setShowYouPickModal(false);
                    setIsGeneratingTheme(true);
                    
                    const description = youPickDescription;
                    setYouPickDescription('');
                    
                    try {
                      console.log('Generating You Pick theme with description:', description);
                      
                      const fallbackTheme = generateFallbackFromDescription(description);
                      
                      console.log('You Pick theme generated successfully:', fallbackTheme);
                      
                      const newYouPickTheme = {
                        name: 'You Pick',
                        background: fallbackTheme.background as [string, string, string],
                        accent: fallbackTheme.accent,
                        vinyl: fallbackTheme.vinyl as [string, string],
                        text: fallbackTheme.text
                      };
                      
                      setYouPickTheme(newYouPickTheme);
                      
                      if (Platform.OS !== 'web') {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      }
                      
                      Alert.alert(
                        'Custom Theme Created!', 
                        `Created a beautiful color scheme based on "${description}".`,
                        [{ text: 'Perfect!' }]
                      );
                    } catch (error: unknown) {
                      console.error('Error generating You Pick theme:', error);
                      
                      const fallbackTheme = generateFallbackFromDescription(description);
                      setYouPickTheme(fallbackTheme);
                      
                      if (Platform.OS !== 'web') {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      }
                      
                      Alert.alert(
                        'Custom Theme Created!', 
                        `Created a beautiful color scheme based on "${description}".`,
                        [{ text: 'Perfect!' }]
                      );
                    } finally {
                      setIsGeneratingTheme(false);
                    }
                  }}
                  disabled={!youPickDescription.trim()}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF', marginLeft: 8 }]}>Generate ✨</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  stylusToggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  stylusToggleText: {
    fontSize: 10,
    fontWeight: '600' as const,
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
  songListButton: {
    backgroundColor: '#1A1A1A',
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  settingsButton: {
    backgroundColor: '#1A1A1A',
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  navigationMenu: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  menuButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  menuButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  themeSelector: {
    maxHeight: 60,
    marginVertical: 10,
  },
  themeSelectorContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  themeButton: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  themeButtonActive: {
    borderWidth: 2,
  },
  themeGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  themeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  aiThemeButton: {
    position: 'relative',
  },
  aiThemeGradient: {
    position: 'relative',
  },
  aiThemeSubtext: {
    fontSize: 10,
    position: 'absolute',
    top: 2,
    right: 4,
    opacity: 0.8,
  },
  stylusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
    position: 'relative',
  },
  recordContainer: {
    width: STYLUS_SIZE,
    height: STYLUS_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  record: {
    width: STYLUS_SIZE,
    height: STYLUS_SIZE,
    borderRadius: STYLUS_SIZE / 2,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  groove: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
  },

  label: {
    width: STYLUS_SIZE * 0.35,
    height: STYLUS_SIZE * 0.35,
    borderRadius: (STYLUS_SIZE * 0.35) / 2,
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
    maxWidth: STYLUS_SIZE * 0.3,
  },
  labelArtist: {
    fontSize: 9,
    color: '#2C1810',
    marginTop: 2,
    textAlign: 'center' as const,
    maxWidth: STYLUS_SIZE * 0.3,
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
    top: 10,
    right: 10,
    width: 180,
    height: 120,
  },
  stylusArm: {
    position: 'absolute',
    width: 160,
    height: 80,
    right: 0,
    top: 0,
  },
  stylusBase: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    backgroundColor: '#A8A8A8',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  stylusShaft: {
    position: 'absolute',
    top: 10,
    right: 24,
    width: 170,
    height: 6,
    backgroundColor: '#B5B5B5',
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  stylusHead: {
    position: 'absolute',
    top: 5,
    right: 194,
    width: 22,
    height: 14,
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
    top: 19,
    right: 200,
    width: 2,
    height: 14,
    backgroundColor: '#606060',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },

  trackInfo: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
    marginTop: 10,
  },
  songEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  editIcon: {
    opacity: 0.7,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginBottom: 4,
    textAlign: 'center' as const,
  },
  trackArtist: {
    fontSize: 18,
    marginBottom: 4,
    textAlign: 'center' as const,
  },
  trackAlbum: {
    fontSize: 16,
    marginBottom: 8,
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
    gap: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#555',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  songListModalContainer: {
    width: '95%',
    maxWidth: 500,
    maxHeight: '85%',
    flex: 1,
    marginVertical: 20,
  },
  songListModalContent: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    minHeight: 400,
  },
  albumInfo: {
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginBottom: 20,
    opacity: 0.8,
  },
  addSongContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  addSongInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  addSongButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songCountText: {
    fontSize: 12,
    textAlign: 'center' as const,
    marginBottom: 15,
    opacity: 0.7,
  },
  songList: {
    flex: 1,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  songItemContent: {
    flex: 1,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  nowPlayingText: {
    fontSize: 12,
    fontWeight: '600' as const,
    fontStyle: 'italic' as const,
  },
  deleteSongButton: {
    padding: 8,
    marginLeft: 10,
  },
  noSongsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noSongsText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  noSongsSubtext: {
    fontSize: 14,
    textAlign: 'center' as const,
    opacity: 0.7,
  },
  noRecordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noRecordText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  noRecordSubtext: {
    fontSize: 14,
    textAlign: 'center' as const,
    opacity: 0.7,
  },
  youPickTextArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
});