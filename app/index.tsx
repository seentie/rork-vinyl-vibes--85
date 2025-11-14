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
  Image,
} from 'react-native';
import {
  Play,
  Pause,
  RotateCcw,
  Edit2,
  X,
  Check,
  Library,
  Plus,
  Trash2,
  Settings,
  Eye,
  ImageIcon,
  Music,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useRecord, SavedRecord, Track } from './context/RecordContext';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';

const { width: screenWidth } = Dimensions.get('window');
const RECORD_SIZE = screenWidth * 0.75;



const defaultTracks: Track[] = [
  { id: 1, title: 'Saturday Morning Forever', artist: 'Old Skool Apps', album: 'The Retro Renaissance', duration: '5:37', decade: '1950s' },
  { id: 2, title: 'Saturday Morning Forever', artist: 'Old Skool Apps', album: 'The Retro Renaissance', duration: '9:22', decade: '1950s' },
  { id: 3, title: 'Saturday Morning Forever', artist: 'Old Skool Apps', album: 'The Retro Renaissance', duration: '5:24', decade: '1960s' },
  { id: 4, title: 'Saturday Morning Forever', artist: 'Old Skool Apps', album: 'The Retro Renaissance', duration: '11:01', decade: '1960s' },
  { id: 5, title: 'Saturday Morning Forever', artist: 'Old Skool Apps', album: 'The Retro Renaissance', duration: '6:47', decade: '1940s' },
  { id: 6, title: 'Saturday Morning Forever', artist: 'Old Skool Apps', album: 'The Retro Renaissance', duration: '4:26', decade: '1970s' },
  { id: 7, title: 'Saturday Morning Forever', artist: 'Old Skool Apps', album: 'The Retro Renaissance', duration: '4:54', decade: '1980s' },
  { id: 8, title: 'Saturday Morning Forever', artist: 'Old Skool Apps', album: 'The Retro Renaissance', duration: '5:01', decade: '1990s' },
];

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
    background: ['#FF6B6B', '#FF8E53', '#FF6B9D'], // Default fallback
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

export default function VinylPlayerScreen() {
  const { isInitialized } = useRecord();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStopped, setIsStopped] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [rpm, setRpm] = useState<33 | 45>(33);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof decadeThemes>('1990s');
  const [aiTheme, setAiTheme] = useState(decadeThemes.ai);
  const [youPickTheme, setYouPickTheme] = useState(decadeThemes.youPick);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [showYouPickModal, setShowYouPickModal] = useState(false);
  const [youPickDescription, setYouPickDescription] = useState('');
  const [recordName, setRecordName] = useState('The Retro Renaissance');
  const [artistName, setArtistName] = useState('Old Skool Apps');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showAddAlbumModal, setShowAddAlbumModal] = useState(false);
  const [showEditAlbumModal, setShowEditAlbumModal] = useState(false);
  const [showEditCoverModal, setShowEditCoverModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SavedRecord | null>(null);
  const [editingCoverRecord, setEditingCoverRecord] = useState<SavedRecord | null>(null);
  const [tempRecordName, setTempRecordName] = useState(recordName);
  const [tempArtistName, setTempArtistName] = useState(artistName);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newArtistName, setNewArtistName] = useState('');
  const [newCoverImage, setNewCoverImage] = useState<string | null>(null);
  const [editAlbumName, setEditAlbumName] = useState('');
  const [editArtistName, setEditArtistName] = useState('');
  const [editCoverImage, setEditCoverImage] = useState<string | null>(null);
  const [newEditCoverImage, setNewEditCoverImage] = useState<string | null>(null);
  const [editSongs, setEditSongs] = useState<string[]>([]);
  const { 
    selectedRecord, 
    currentSong, 
    savedRecords, 
    tracks, 
    selectRecord, 
    updateCurrentSong, 
    saveSavedRecords, 
    setSavedRecords, 
    setTracks 
  } = useRecord();
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const spinAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const insets = useSafeAreaInsets();

  // Ensure spinValue is initialized to exactly 0 on mount
  useEffect(() => {
    spinValue.setValue(0);
  }, []);



  const currentTrack = tracks[currentTrackIndex];
  const [tempCurrentSong, setTempCurrentSong] = useState(currentTrack?.title || '');
  const [isEditingSong, setIsEditingSong] = useState(false);
  const [editingSongText, setEditingSongText] = useState('');
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
      
      // Get current rotation value
      const currentValue = (spinValue as any)._value || 0;
      
      // Create loop animation from current position WITHOUT modifying spinValue
      // This prevents visual jumps
      spinAnimation.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: currentValue + 1000, // Continue from current position
          duration: duration * 1000,
          useNativeDriver: true,
          easing: (t) => t, // Linear easing for smooth rotation
        })
      );
      
      spinAnimation.current.start();
    }
    // If paused or stopped, keep current position - don't reset or modify

    return () => {
      if (spinAnimation.current) {
        spinAnimation.current.stop();
        spinAnimation.current = null;
      }
    };
  }, [rpm, isPlaying, isStopped, spinValue]);





  // Show loading screen while AsyncStorage initializes
  if (!isInitialized) {
    return (
      <LinearGradient
        colors={theme.background as [string, string, ...string[]]}
        style={styles.container}
      >
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <View style={styles.loadingContent}>
            <Text style={[styles.loadingTitle, { color: theme.accent }]}>VINYL VIBES</Text>
            <Text style={[styles.loadingText, { color: theme.text }]}>Loading your collection...</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }





  const addToCollection = async () => {
    // Count user albums (excluding display)
    const userAlbums = savedRecords.filter(r => r.id !== 'display-retro-renaissance');
    if (userAlbums.length >= 20) {
      Alert.alert('Collection Full', 'You can save up to 20 additional albums (plus the default Retro Renaissance album).');
      return;
    }

    const newRecord: SavedRecord = {
      id: Date.now().toString(),
      albumName: recordName,
      artistName: artistName,
      dateAdded: new Date().toISOString(),
    };

    // Check if record already exists
    const exists = savedRecords.some(
      record => record.albumName.toLowerCase() === recordName.toLowerCase() && 
                record.artistName.toLowerCase() === artistName.toLowerCase()
    );

    if (exists) {
      Alert.alert('Already in Collection', 'This record is already in your collection.');
      return;
    }

    const updatedRecords = [...savedRecords, newRecord];
    setSavedRecords(updatedRecords);
    await saveSavedRecords(updatedRecords);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('Success', 'Album added to your collection!');
  };

  const addNewAlbum = async () => {
    // Count user albums (excluding display)
    const userAlbums = savedRecords.filter(r => r.id !== 'display-retro-renaissance');
    if (userAlbums.length >= 20) {
      Alert.alert('Collection Full', 'You can save up to 20 additional albums (plus the default Retro Renaissance album).');
      return;
    }

    const albumName = newAlbumName.trim();
    const artistName = newArtistName.trim();

    if (!albumName || !artistName) {
      Alert.alert('Missing Information', 'Please enter both album name and artist name.');
      return;
    }

    // Check if record already exists
    const exists = savedRecords.some(
      record => record.albumName.toLowerCase() === albumName.toLowerCase() && 
                record.artistName.toLowerCase() === artistName.toLowerCase()
    );

    if (exists) {
      Alert.alert('Already in Collection', 'This album is already in your collection.');
      setNewAlbumName('');
      setNewArtistName('');
      setNewCoverImage(null);
      setShowAddAlbumModal(false);
      return;
    }

    const newRecord: SavedRecord = {
      id: Date.now().toString(),
      albumName: albumName,
      artistName: artistName,
      dateAdded: new Date().toISOString(),
      coverImage: newCoverImage || undefined,
      songs: [],
    };

    const updatedRecords = [...savedRecords, newRecord];
    setSavedRecords(updatedRecords);
    await saveSavedRecords(updatedRecords);
    
    // Update the current playing record to the new album with blank song
    setRecordName(albumName);
    setArtistName(artistName);
    setTempRecordName(albumName);
    setTempArtistName(artistName);
    
    // Create new tracks with blank song titles for the new album
    const blankTracks = tracks.map(track => ({
      ...track,
      title: '', // Clear the song title
      album: albumName,
    }));
    setTracks(blankTracks);
    setTempCurrentSong(''); // Clear current song
    
    // Clear form and close modal
    setNewAlbumName('');
    setNewArtistName('');
    setNewCoverImage(null);
    setShowAddAlbumModal(false);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert('Success', `"${albumName}" has been added to your collection!`);
  };

  const cancelAddAlbum = () => {
    setNewAlbumName('');
    setNewArtistName('');
    setNewCoverImage(null);
    setShowAddAlbumModal(false);
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need photo album permissions to upload photos.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewCoverImage(result.assets[0].uri);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const removeCoverImage = () => {
    setNewCoverImage(null);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const removeEditCoverImage = () => {
    setEditCoverImage(null);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const removeNewEditCoverImage = () => {
    setNewEditCoverImage(null);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const pickEditImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need photo album permissions to upload photos.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEditCoverImage(result.assets[0].uri);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const pickNewEditImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need photo album permissions to upload photos.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewEditCoverImage(result.assets[0].uri);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const openEditAlbumModal = (record: SavedRecord) => {
    setEditingRecord(record);
    setEditAlbumName(record.albumName);
    setEditArtistName(record.artistName);
    setEditCoverImage(record.coverImage || null);
    setEditSongs(record.songs || []);
    setShowCollectionModal(false);
    setTimeout(() => {
      setShowEditAlbumModal(true);
    }, 300);
  };

  const saveEditedAlbum = async () => {
    if (!editingRecord) return;

    const albumName = editAlbumName.trim();
    const artistName = editArtistName.trim();

    if (!albumName || !artistName) {
      Alert.alert('Missing Information', 'Please enter both album name and artist name.');
      return;
    }

    // Check if another record with same name exists (excluding current record)
    const exists = savedRecords.some(
      record => record.id !== editingRecord.id &&
                record.albumName.toLowerCase() === albumName.toLowerCase() && 
                record.artistName.toLowerCase() === artistName.toLowerCase()
    );

    if (exists) {
      Alert.alert('Already in Collection', 'Another album with this name and artist already exists in your collection.');
      return;
    }

    const updatedRecord: SavedRecord = {
      ...editingRecord,
      albumName: albumName,
      artistName: artistName,
      coverImage: editCoverImage || undefined,
      songs: editSongs.filter(song => song.trim() !== ''),
    };

    const updatedRecords = savedRecords.map(record => 
      record.id === editingRecord.id ? updatedRecord : record
    );
    
    setSavedRecords(updatedRecords);
    await saveSavedRecords(updatedRecords);
    
    // Clear form and close modal
    setEditingRecord(null);
    setEditAlbumName('');
    setEditArtistName('');
    setEditCoverImage(null);
    setEditSongs([]);
    setShowEditAlbumModal(false);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert('Success', `"${albumName}" has been updated!`);
  };

  const cancelEditAlbum = () => {
    setEditingRecord(null);
    setEditAlbumName('');
    setEditArtistName('');
    setEditCoverImage(null);
    setEditSongs([]);
    setShowEditAlbumModal(false);
  };

  const openEditCoverModal = (record: SavedRecord) => {
    setEditingCoverRecord(record);
    setNewEditCoverImage(record.coverImage || null);
    setShowCollectionModal(false);
    setTimeout(() => {
      setShowEditCoverModal(true);
    }, 300);
  };

  const saveEditedCover = async () => {
    if (!editingCoverRecord) return;

    const updatedRecord: SavedRecord = {
      ...editingCoverRecord,
      coverImage: newEditCoverImage || undefined,
    };

    const updatedRecords = savedRecords.map(record => 
      record.id === editingCoverRecord.id ? updatedRecord : record
    );
    
    setSavedRecords(updatedRecords);
    await saveSavedRecords(updatedRecords);
    
    // Update selected record if it's the one being edited
    if (selectedRecord?.id === editingCoverRecord.id) {
      selectRecord(updatedRecord);
    }
    
    // Clear form and close modal
    setEditingCoverRecord(null);
    setNewEditCoverImage(null);
    setShowEditCoverModal(false);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert('Success', `Album cover for "${updatedRecord.albumName}" has been updated!`);
  };

  const cancelEditCover = () => {
    setEditingCoverRecord(null);
    setNewEditCoverImage(null);
    setShowEditCoverModal(false);
  };

  const addSongToEdit = () => {
    setEditSongs([...editSongs, '']);
  };

  const updateSongInEdit = (index: number, value: string) => {
    const updatedSongs = [...editSongs];
    updatedSongs[index] = value;
    setEditSongs(updatedSongs);
  };

  const removeSongFromEdit = (index: number) => {
    const updatedSongs = editSongs.filter((_, i) => i !== index);
    setEditSongs(updatedSongs);
  };

  const removeFromCollection = async (recordId: string) => {
    const updatedRecords = savedRecords.filter(record => record.id !== recordId);
    setSavedRecords(updatedRecords);
    await saveSavedRecords(updatedRecords);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const selectFromCollection = (record: SavedRecord) => {
    // Use context to select record
    selectRecord(record);
    
    // Update local state for display
    setRecordName(record.albumName);
    setArtistName(record.artistName);
    setTempRecordName(record.albumName);
    setTempArtistName(record.artistName);
    
    setShowCollectionModal(false);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  const handleStop = () => {
    // Stop animation immediately
    if (spinAnimation.current) {
      spinAnimation.current.stop();
      spinAnimation.current = null;
    }
    
    // Keep current rotation exactly where it is - no resets
    setIsPlaying(false);
    setIsStopped(true);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const resetNeedle = () => {
    // Stop the record
    setIsPlaying(false);
    setIsStopped(true);
    
    // Stop animation first
    if (spinAnimation.current) {
      spinAnimation.current.stop();
      spinAnimation.current = null;
    }
    
    // Reset rotation to starting position with animation
    Animated.timing(spinValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // After animation completes, set to exactly 0
      spinValue.setValue(0);
    });
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const saveRecordName = () => {
    const newRecordName = tempRecordName.trim() || 'The Retro Renaissance';
    const newArtistName = tempArtistName.trim() || 'Old Skool Apps';
    const newCurrentSong = tempCurrentSong.trim() || currentTrack?.title || '';
    
    setRecordName(newRecordName);
    setArtistName(newArtistName);
    
    // Update current tracks with new album name and update the current track's title
    const updatedTracks = tracks.map((track, index) => ({
      ...track,
      album: newRecordName,
      title: index === currentTrackIndex ? newCurrentSong : (track?.title || ''),
    }));
    setTracks(updatedTracks);
    setShowEditModal(false);
  };

  const cancelEdit = () => {
    setTempRecordName(recordName);
    setTempArtistName(artistName);
    setTempCurrentSong(currentTrack?.title || '');
    setShowEditModal(false);
  };

  const generateAITheme = async (albumName: string, artistName: string, coverImageUri?: string) => {
    if (isGeneratingTheme) return;
    
    setIsGeneratingTheme(true);
    
    try {
      console.log('Generating AI theme for:', albumName, 'by', artistName, 'with cover:', !!coverImageUri);
      
      // Validate inputs
      if (!albumName?.trim() || !artistName?.trim()) {
        throw new Error('Album name and artist name are required');
      }
      
      // Define the schema for AI color generation
      const colorSchemeSchema = z.object({
        background: z.array(z.string()).length(3).describe('Three hex colors for gradient background that match the album aesthetic'),
        accent: z.string().describe('Primary accent color in hex format that complements the album'),
        vinyl: z.array(z.string()).length(2).describe('Two dark hex colors for vinyl record gradient'),
        text: z.string().describe('Text color in hex format that contrasts well with background'),
        description: z.string().describe('Brief description of the color scheme inspiration')
      });
      
      // Prepare the message content
      let messageContent: any;
      
      if (coverImageUri) {
        // Convert image URI to base64 if it's a local file
        let imageData = coverImageUri;
        if (coverImageUri.startsWith('file://') || !coverImageUri.startsWith('http')) {
          // For local images, we need to convert to base64
          try {
            const response = await fetch(coverImageUri);
            const blob = await response.blob();
            const reader = new FileReader();
            imageData = await new Promise((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch (conversionError) {
            console.warn('Failed to convert image to base64, using fallback:', conversionError);
            throw new Error('Image conversion failed');
          }
        }
        
        // If we have a cover image, include it in the analysis
        messageContent = [
          {
            type: 'text',
            text: `Analyze this album cover image and create a beautiful color scheme that perfectly matches the visual aesthetics of "${albumName}" by ${artistName}.
            
            CRITICAL: You must extract colors that actually appear in this album cover image.
            
            Requirements:
            - Look at the dominant colors, lighting, and mood in this specific album cover
            - Create a gradient background using 3 colors that harmonize with the cover's palette
            - Choose an accent color that either appears prominently in the cover or complements it perfectly
            - Ensure vinyl colors are dark but work with the overall aesthetic
            - Text color must be readable against the background
            - The final result should look like it was designed specifically for this album
            
            Focus on making colors that truly represent this specific album cover, not generic colors.`
          },
          {
            type: 'image',
            image: imageData
          }
        ];
      } else {
        // Enhanced text-based analysis when no cover image is available
        messageContent = `Create a beautiful, authentic color scheme for the album "${albumName}" by ${artistName}.
        
        CRITICAL INSTRUCTIONS:
        - Research this specific album and extract colors from its ACTUAL cover art
        - Look up the real album cover online and identify the dominant colors that actually appear in the image
        - DO NOT use generic genre colors or make assumptions - use the specific album's visual palette
        - The background should be a 3-color gradient using the album's main colors
        - Accent color should be prominent from the cover or complement it perfectly
        
        Specific album examples with ACTUAL cover colors:
        - "Lover" by Taylor Swift = baby blue (#87CEEB), light pink (#FFB6C1), and lavender (#E6E6FA)
        - "Kind of Blue" by Miles Davis = deep blues (#0F1B3C, #1E3A8A, #3B82F6)
        - "Thriller" by Michael Jackson = red, orange, yellow from the jacket (#7C2D12, #DC2626, #F59E0B)
        - Françoise Hardy albums typically feature muted earth tones, browns, and vintage colors - NO PINK unless actually present
        - "Comment te dire adieu" by Françoise Hardy = warm browns, sepia tones, vintage cream colors
        
        For "${albumName}" by ${artistName}:
        - Look up this specific album cover
        - Extract the actual dominant colors from the cover image
        - If it's a black and white or sepia photo, use those tones
        - If it has specific color elements, use those exact colors
        - Return hex colors that truly represent the visual appearance of this album cover`;
      }
      
      // Generate AI color scheme with comprehensive error handling
      let aiResponse;
      try {
        console.log('Sending request to AI service...');
        aiResponse = await generateObject({
          messages: [
            {
              role: 'user',
              content: messageContent
            }
          ],
          schema: colorSchemeSchema
        });
        
        console.log('Raw AI Response:', JSON.stringify(aiResponse, null, 2));
        
        // Comprehensive validation of the response
        if (!aiResponse) {
          throw new Error('AI returned null response');
        }
        
        if (typeof aiResponse !== 'object') {
          throw new Error('AI response is not an object');
        }
        
        if (!Array.isArray(aiResponse.background) || aiResponse.background.length !== 3) {
          throw new Error('Invalid background colors array');
        }
        
        if (typeof aiResponse.accent !== 'string') {
          throw new Error('Invalid accent color');
        }
        
        if (!Array.isArray(aiResponse.vinyl) || aiResponse.vinyl.length !== 2) {
          throw new Error('Invalid vinyl colors array');
        }
        
        if (typeof aiResponse.text !== 'string') {
          throw new Error('Invalid text color');
        }
        
        // Validate hex color format with more robust regex
        const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
        const allColors = [...aiResponse.background, aiResponse.accent, ...aiResponse.vinyl, aiResponse.text];
        
        for (let i = 0; i < allColors.length; i++) {
          const color = allColors[i];
          if (typeof color !== 'string' || !hexColorRegex.test(color)) {
            throw new Error(`Invalid hex color format at position ${i}: ${color}`);
          }
        }
        
        console.log('AI response validation passed');
        
      } catch (aiError) {
        console.error('AI generation failed with error:', aiError);
        console.error('Error details:', {
          message: aiError instanceof Error ? aiError.message : 'Unknown error',
          stack: aiError instanceof Error ? aiError.stack : undefined
        });
        throw new Error(`AI service error: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`);
      }
      
      const newAiTheme = {
        name: 'AI Generated',
        background: aiResponse.background as [string, string, string],
        accent: aiResponse.accent,
        vinyl: aiResponse.vinyl as [string, string],
        text: aiResponse.text
      };
      
      console.log('Setting new AI theme:', newAiTheme);
      setAiTheme(newAiTheme);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        'AI Theme Generated!', 
        `${aiResponse.description || 'Beautiful colors created to match the album'} for "${albumName}" by ${artistName}.`,
        [{ text: 'Perfect!' }]
      );
      
    } catch (error) {
      console.error('Error in generateAITheme:', error);
      
      // Enhanced fallback that tries to match album covers when possible
      const fallbackTheme = generateFallbackTheme(albumName, artistName, coverImageUri);
      console.log('Using fallback theme:', fallbackTheme);
      setAiTheme(fallbackTheme);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        'Custom Theme Created!', 
        `Created a beautiful color scheme inspired by "${albumName}" by ${artistName}${coverImageUri ? ' and your album cover' : ' based on the album\'s characteristics'}.`,
        [{ text: 'Great!' }]
      );
    } finally {
      setIsGeneratingTheme(false);
    }
  };
  
  // Generate theme based on text description
  const generateDescriptionBasedTheme = (description: string) => {
    const desc = description.toLowerCase();
    
    // Color keyword mapping with hex values for blending
    const colorMappings: Record<string, { background: [string, string, string], accent: string, vinyl: [string, string], text: string }> = {
      // Warm colors
      sunset: {
        background: ['#FF6B35', '#F7931E', '#FDC830'],
        accent: '#FFD700',
        vinyl: ['#8B4513', '#654321'],
        text: '#FFFFFF'
      },
      warm: {
        background: ['#FF6B35', '#F7931E', '#FDC830'],
        accent: '#FFD700',
        vinyl: ['#8B4513', '#654321'],
        text: '#FFFFFF'
      },
      orange: {
        background: ['#FF6B35', '#FF8C42', '#FFA07A'],
        accent: '#FFD700',
        vinyl: ['#8B4513', '#654321'],
        text: '#FFFFFF'
      },
      red: {
        background: ['#8B0000', '#DC143C', '#FF6347'],
        accent: '#FFD700',
        vinyl: ['#2F0000', '#1A0000'],
        text: '#FFFFFF'
      },
      // Cool colors
      ocean: {
        background: ['#006994', '#0EA5E9', '#38BDF8'],
        accent: '#FDE047',
        vinyl: ['#0C4A6E', '#082F49'],
        text: '#F0F9FF'
      },
      blue: {
        background: ['#1E3A8A', '#3B82F6', '#60A5FA'],
        accent: '#FDE047',
        vinyl: ['#1E1B4B', '#0F0F23'],
        text: '#DBEAFE'
      },
      sea: {
        background: ['#0D9488', '#14B8A6', '#5EEAD4'],
        accent: '#F97316',
        vinyl: ['#134E4A', '#0F2027'],
        text: '#F0FDFA'
      },
      teal: {
        background: ['#0D9488', '#14B8A6', '#2DD4BF'],
        accent: '#F59E0B',
        vinyl: ['#134E4A', '#0F2027'],
        text: '#F0FDFA'
      },
      // Purple/Pink
      purple: {
        background: ['#581C87', '#7C3AED', '#A855F7'],
        accent: '#FDE047',
        vinyl: ['#312E81', '#1E1B4B'],
        text: '#FAF5FF'
      },
      pink: {
        background: ['#DB2777', '#EC4899', '#F472B6'],
        accent: '#FDE047',
        vinyl: ['#831843', '#500724'],
        text: '#FDF2F8'
      },
      magenta: {
        background: ['#C026D3', '#D946EF', '#E879F9'],
        accent: '#FDE047',
        vinyl: ['#701A75', '#4A044E'],
        text: '#FAE8FF'
      },
      // Neon/Cyberpunk
      neon: {
        background: ['#FF1493', '#00FFFF', '#9400D3'],
        accent: '#00FF00',
        vinyl: ['#1A1A2E', '#0F0F1E'],
        text: '#00FFFF'
      },
      cyberpunk: {
        background: ['#FF006E', '#00F5FF', '#8338EC'],
        accent: '#FFBE0B',
        vinyl: ['#1A1A2E', '#0F0F1E'],
        text: '#00F5FF'
      },
      shimmer: {
        background: ['#FFD700', '#FFA500', '#FF8C00'],
        accent: '#FFFFFF',
        vinyl: ['#8B4513', '#654321'],
        text: '#FFFFFF'
      },
      // Nature
      forest: {
        background: ['#065F46', '#059669', '#10B981'],
        accent: '#FCD34D',
        vinyl: ['#1C3A1C', '#0F2027'],
        text: '#F0FDF4'
      },
      green: {
        background: ['#166534', '#22C55E', '#4ADE80'],
        accent: '#FDE047',
        vinyl: ['#14532D', '#052E16'],
        text: '#F0FDF4'
      },
      nature: {
        background: ['#8FBC8F', '#228B22', '#006400'],
        accent: '#FFD700',
        vinyl: ['#2F4F2F', '#1C3A1C'],
        text: '#F5FFFA'
      },
      // Vintage/Retro
      vintage: {
        background: ['#8B7355', '#A0522D', '#D2B48C'],
        accent: '#DEB887',
        vinyl: ['#2F1B14', '#1A0E08'],
        text: '#F5F5DC'
      },
      sepia: {
        background: ['#704214', '#8B4513', '#CD853F'],
        accent: '#F4A460',
        vinyl: ['#2F1B14', '#1A0E08'],
        text: '#FFF8DC'
      },
      retro: {
        background: ['#FF6B6B', '#FF8E53', '#FF6B9D'],
        accent: '#FFD700',
        vinyl: ['#2F0147', '#1A0033'],
        text: '#FFFFFF'
      },
      // Pastel
      pastel: {
        background: ['#FFB3BA', '#FFDFBA', '#FFFFBA'],
        accent: '#FF69B4',
        vinyl: ['#8B7D7B', '#5C5C5C'],
        text: '#333333'
      },
      // Dark/Moody
      dark: {
        background: ['#1F2937', '#374151', '#4B5563'],
        accent: '#FBBF24',
        vinyl: ['#111827', '#000000'],
        text: '#F9FAFB'
      },
      midnight: {
        background: ['#191970', '#4B0082', '#663399'],
        accent: '#FFD700',
        vinyl: ['#0F0F23', '#1E1B4B'],
        text: '#E6E6FA'
      },
      black: {
        background: ['#000000', '#1F1F1F', '#3F3F3F'],
        accent: '#FFD700',
        vinyl: ['#0A0A0A', '#000000'],
        text: '#FFFFFF'
      },
      // Bright/Vibrant
      vibrant: {
        background: ['#FF006E', '#FB5607', '#FFBE0B'],
        accent: '#8338EC',
        vinyl: ['#3A0CA3', '#240046'],
        text: '#FFFFFF'
      },
      rainbow: {
        background: ['#FF0000', '#00FF00', '#0000FF'],
        accent: '#FFFF00',
        vinyl: ['#4B0082', '#8B00FF'],
        text: '#FFFFFF'
      },
      // Monochrome
      gray: {
        background: ['#6B7280', '#9CA3AF', '#D1D5DB'],
        accent: '#3B82F6',
        vinyl: ['#374151', '#1F2937'],
        text: '#F9FAFB'
      },
      silver: {
        background: ['#94A3B8', '#CBD5E1', '#E2E8F0'],
        accent: '#3B82F6',
        vinyl: ['#475569', '#334155'],
        text: '#0F172A'
      },
      gold: {
        background: ['#B45309', '#D97706', '#F59E0B'],
        accent: '#FEF3C7',
        vinyl: ['#78350F', '#451A03'],
        text: '#FFFBEB'
      }
    };
    
    // Find ALL matching color keywords
    const matchedColors: Array<{ keyword: string; palette: typeof colorMappings[string] }> = [];
    for (const [keyword, palette] of Object.entries(colorMappings)) {
      if (desc.includes(keyword)) {
        matchedColors.push({ keyword, palette });
      }
    }
    
    // If we found multiple colors, blend them intelligently
    if (matchedColors.length > 1) {
      console.log('Found multiple colors:', matchedColors.map(c => c.keyword).join(', '));
      
      // Combine background colors from all matched palettes
      const allBackgroundColors: string[] = [];
      matchedColors.forEach(match => {
        allBackgroundColors.push(...match.palette.background);
      });
      
      // Take colors evenly distributed from the combined pool
      const combinedBackground: [string, string, string] = [
        allBackgroundColors[0] || '#9C27B0',
        allBackgroundColors[Math.floor(allBackgroundColors.length / 2)] || '#E91E63',
        allBackgroundColors[allBackgroundColors.length - 1] || '#3F51B5'
      ];
      
      // Use the accent from the first matched color
      const combinedAccent = matchedColors[0].palette.accent;
      
      // Use vinyl from first match
      const combinedVinyl = matchedColors[0].palette.vinyl;
      
      // Use text color from first match
      const combinedText = matchedColors[0].palette.text;
      
      return {
        name: 'You Pick',
        background: combinedBackground,
        accent: combinedAccent,
        vinyl: combinedVinyl,
        text: combinedText
      };
    }
    
    // If we found exactly one color, use it
    if (matchedColors.length === 1) {
      return {
        name: 'You Pick',
        ...matchedColors[0].palette
      };
    }
    
    // Default to a vibrant gradient if no keywords match
    return {
      name: 'You Pick',
      background: ['#9C27B0', '#E91E63', '#3F51B5'],
      accent: '#FFD700',
      vinyl: ['#2F0147', '#1A0033'],
      text: '#FFFFFF'
    };
  };
  
  // Enhanced fallback theme generator that matches specific album covers
  const generateFallbackTheme = (albumName: string, artistName: string, coverImageUri?: string) => {
    const album = albumName.toLowerCase();
    const artist = artistName.toLowerCase();
    
    console.log('Generating fallback theme for:', album, 'by', artist);
    
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
    
    console.log('Selected palette for fallback:', selectedPalette);
    
    return {
      name: 'AI Generated',
      background: selectedPalette.background as [string, string, string],
      accent: selectedPalette.accent,
      vinyl: selectedPalette.vinyl as [string, string],
      text: selectedPalette.text
    };
  };

  const resetToDefault = () => {
    setRecordName('The Retro Renaissance');
    setArtistName('Old Skool Apps');
    setTracks(defaultTracks);
    setTempRecordName('The Retro Renaissance');
    setTempArtistName('Old Skool Apps');
    setTempCurrentSong(defaultTracks[currentTrackIndex]?.title || '');
  };

  const handlePlayPause = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (isStopped) {
      // Starting from stopped state
      setIsStopped(false);
      setIsPlaying(true);
    } else {
      // Toggle play/pause
      setIsPlaying(!isPlaying);
    }
  };



  const toggleRPM = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Cycle through 33 -> 45 -> 33
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
          <Text style={[styles.brandText, { color: theme.accent }]}>VINYL VIBES &apos;85</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={toggleRPM} style={[styles.rpmButton, { borderColor: theme.accent }]}>
              <Text style={[styles.rpmText, { color: theme.accent }]}>{rpm} RPM</Text>
            </TouchableOpacity>
          </View>
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
                    // Generate AI theme when selected
                    // Try to find a cover image from selected record or current album
                    const coverImageUri = selectedRecord?.coverImage;
                    generateAITheme(recordName, artistName, coverImageUri);
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

        {/* Record Container */}
        <View style={styles.turntableContainer}>
          {/* Turntable Base */}
          <View style={styles.turntableBase}>
            <View style={styles.recordContainer}>
              <Animated.View
                style={[
                  styles.record,
                  { transform: [{ rotate: spin }] },
                ]}
              >
                {/* Record Grooves */}
                {[...Array(12)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.groove,
                      {
                        width: RECORD_SIZE - (i * 20),
                        height: RECORD_SIZE - (i * 20),
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
                    {recordName}
                  </Text>
                  <Text 
                    style={styles.labelArtist}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {artistName}
                  </Text>
                  {isStopped && (
                    <TouchableOpacity 
                      style={styles.editLabelButton}
                      onPress={() => {
                        setTempRecordName(recordName);
                        setTempArtistName(artistName);
                        setTempCurrentSong(currentTrack?.title || '');
                        setShowEditModal(true);
                      }}
                    >
                      <Edit2 size={10} color="#1A0E08" />
                    </TouchableOpacity>
                  )}
                  <View style={styles.centerHole} />
                </View>
              </Animated.View>
            </View>
          </View>
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={[styles.albumName, { color: theme.text }]}>{recordName}</Text>
          <Text style={[styles.trackArtist, { color: theme.text, opacity: 0.8 }]}>{artistName}</Text>
          
          {/* Editable Song Title */}
          <View style={styles.songTitleContainer}>
            {isEditingSong ? (
              <View style={styles.songEditContainer}>
                <TextInput
                  style={[styles.songEditInput, { color: theme.accent, borderColor: theme.accent }]}
                  value={editingSongText}
                  onChangeText={setEditingSongText}
                  placeholder="Enter song title"
                  placeholderTextColor={`${theme.accent}50`}
                  autoFocus={true}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    const newSongTitle = editingSongText.trim();
                    if (newSongTitle) {
                      updateCurrentSong(newSongTitle);
                      
                      // Update the current track in tracks array
                      const updatedTracks = tracks.map((track, index) => ({
                        ...track,
                        title: index === currentTrackIndex ? newSongTitle : track.title,
                      }));
                      setTracks(updatedTracks);
                    }
                    setIsEditingSong(false);
                    setEditingSongText('');
                  }}
                  onBlur={() => {
                    const newSongTitle = editingSongText.trim();
                    if (newSongTitle) {
                      updateCurrentSong(newSongTitle);
                      
                      // Update the current track in tracks array
                      const updatedTracks = tracks.map((track, index) => ({
                        ...track,
                        title: index === currentTrackIndex ? newSongTitle : track.title,
                      }));
                      setTracks(updatedTracks);
                    }
                    setIsEditingSong(false);
                    setEditingSongText('');
                  }}
                />
                <TouchableOpacity
                  style={[styles.songEditButton, { backgroundColor: theme.accent }]}
                  onPress={() => {
                    const newSongTitle = editingSongText.trim();
                    if (newSongTitle) {
                      updateCurrentSong(newSongTitle);
                      
                      // Update the current track in tracks array
                      const updatedTracks = tracks.map((track, index) => ({
                        ...track,
                        title: index === currentTrackIndex ? newSongTitle : track.title,
                      }));
                      setTracks(updatedTracks);
                    }
                    setIsEditingSong(false);
                    setEditingSongText('');
                    
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                >
                  <Check size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.songEditButton, { backgroundColor: '#666' }]}
                  onPress={() => {
                    setIsEditingSong(false);
                    setEditingSongText('');
                    
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                >
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.songTitleTouchable}
                onPress={() => {
                  setEditingSongText(currentSong || currentTrack?.title || '');
                  setIsEditingSong(true);
                  
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                testID="edit-song-title-button"
              >
                <Text style={[styles.currentSong, { color: theme.accent }]}>♪ {currentSong || currentTrack?.title || 'Tap to add song title'}</Text>
                <Edit2 size={16} color={theme.accent} style={styles.songEditIcon} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={[styles.decadeBadge, { backgroundColor: `${theme.accent}20` }]}>
            <Text style={[styles.decadeText, { color: theme.accent }]}>{currentTheme}</Text>
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
            onPress={resetNeedle}
            style={styles.controlButton}
            testID="reset-button"
          >
            <RotateCcw color={theme.accent} size={24} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: theme.accent }]}
            onPress={() => {
              // Make sure current record info is synced before navigating
              if (selectedRecord) {
                selectRecord(selectedRecord);
              }
              router.push('/stylus');
            }}
            testID="stylus-view-button"
          >
            <Eye size={20} color={theme.accent} />
            <Text style={[styles.actionButtonText, { color: theme.accent }]}>Stylus View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: theme.accent }]}
            onPress={() => {
              // Ensure the selected record is properly set before navigating
              const currentRecord = savedRecords.find(r => 
                r.albumName === recordName && r.artistName === artistName
              ) || selectedRecord;
              
              if (currentRecord) {
                console.log('[NowPlaying Navigation] Selecting record:', currentRecord.albumName, 'Cover:', currentRecord.coverImage);
                selectRecord(currentRecord);
              }
              router.push('/now-playing');
            }}
            testID="now-playing-button"
          >
            <Music size={20} color={theme.accent} />
            <Text style={[styles.actionButtonText, { color: theme.accent }]}>Now Playing</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: theme.accent }]}
            onPress={() => setShowCollectionModal(true)}
            testID="collection-button"
          >
            <Library size={20} color={theme.accent} />
            <Text style={[styles.actionButtonText, { color: theme.accent }]}>Collection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: theme.accent }]}
            onPress={() => {
              setTempRecordName(recordName);
              setTempArtistName(artistName);
              setTempCurrentSong(currentTrack?.title || '');
              setShowEditModal(true);
            }}
            testID="edit-record-button"
          >
            <Edit2 size={20} color={theme.accent} />
            <Text style={[styles.actionButtonText, { color: theme.accent }]}>Edit Record</Text>
          </TouchableOpacity>
        </View>


      </ScrollView>

      {/* Floating Settings Button */}
      <TouchableOpacity 
        onPress={() => router.push('/settings')} 
        style={[styles.floatingSettingsButton, { borderColor: theme.accent }]}
      >
        <Settings size={24} color={theme.accent} />
      </TouchableOpacity>

        {/* Collection Modal */}
        <Modal
          visible={showCollectionModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCollectionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.collectionModal, { backgroundColor: theme.background[0] }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Record Collection ({savedRecords.filter(r => r.id !== 'display-retro-renaissance').length}/20 user albums)</Text>
                <TouchableOpacity onPress={() => setShowCollectionModal(false)}>
                  <X size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.collectionList} showsVerticalScrollIndicator={false}>
                {savedRecords.length === 0 ? (
                  <View style={styles.emptyCollection}>
                    <Library size={48} color={theme.text} opacity={0.3} />
                    <Text style={[styles.emptyText, { color: theme.text }]}>No records in your collection</Text>
                    <Text style={[styles.emptySubtext, { color: theme.text }]}>Add your first vinyl record</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        setShowCollectionModal(false);
                        setTimeout(() => {
                          setNewAlbumName('');
                          setNewArtistName('');
                          setNewCoverImage(null);
                          setShowAddAlbumModal(true);
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        }, 300);
                      }}
                      style={[styles.addNewAlbumButton, { backgroundColor: theme.accent }]}
                      disabled={savedRecords.filter(r => r.id !== 'display-retro-renaissance').length >= 20}
                    >
                      <Plus size={24} color="#FFFFFF" />
                      <Text style={styles.addNewAlbumButtonText}>Add New Album</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity 
                      onPress={() => {
                        setShowCollectionModal(false);
                        setTimeout(() => {
                          setNewAlbumName('');
                          setNewArtistName('');
                          setNewCoverImage(null);
                          setShowAddAlbumModal(true);
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        }, 300);
                      }}
                      style={[styles.addNewAlbumButton, { backgroundColor: theme.accent, marginBottom: 24 }]}
                      disabled={savedRecords.filter(r => r.id !== 'display-retro-renaissance').length >= 20}
                    >
                      <Plus size={24} color="#FFFFFF" />
                      <Text style={styles.addNewAlbumButtonText}>
                        {savedRecords.filter(r => r.id !== 'display-retro-renaissance').length >= 20 ? 'Collection Full (20/20)' : 'Add New Album'}
                      </Text>
                    </TouchableOpacity>
                    {savedRecords.map((record) => {
                      const isDefaultAlbum = record.id === 'display-retro-renaissance';
                      return (
                      <TouchableOpacity
                        key={record.id}
                        style={[styles.collectionItem, { borderColor: theme.accent + '30', backgroundColor: isDefaultAlbum ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0,0,0,0.1)' }]}
                        onPress={() => selectFromCollection(record)}
                      >
                        {record.coverImage && (
                          <Image source={{ uri: record.coverImage }} style={styles.collectionCoverImage} />
                        )}
                        <View style={styles.recordInfo}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.recordAlbum, { color: theme.text }]} numberOfLines={1}>
                              {record.albumName}
                            </Text>
                            {isDefaultAlbum && (
                              <View style={{ backgroundColor: theme.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ fontSize: 10, fontWeight: '700' as const, color: '#000' }}>DISPLAY</Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.recordArtist, { color: theme.text }]} numberOfLines={1}>
                            {record.artistName}
                          </Text>
                          {record.songs && record.songs.length > 0 && (
                            <Text style={[styles.recordSongs, { color: theme.text }]} numberOfLines={1}>
                              {record.songs.length} song{record.songs.length !== 1 ? 's' : ''}
                            </Text>
                          )}
                          <Text style={[styles.recordDate, { color: theme.text }]}>
                            Added {new Date(record.dateAdded).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.recordActions}>
                          <TouchableOpacity
                            onPress={() => openEditCoverModal(record)}
                            style={styles.coverEditButton}
                          >
                            <ImageIcon size={16} color={theme.accent} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => openEditAlbumModal(record)}
                            style={styles.editButton}
                          >
                            <Edit2 size={16} color={theme.accent} />
                          </TouchableOpacity>
                          {!isDefaultAlbum && (
                            <TouchableOpacity
                              onPress={() => {
                                Alert.alert(
                                  'Remove Record',
                                  `Remove "${record.albumName}" from your collection?`,
                                  [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Remove', style: 'destructive', onPress: () => removeFromCollection(record.id) }
                                  ]
                                );
                              }}
                              style={styles.removeButton}
                            >
                              <Trash2 size={16} color="#FF6B6B" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </TouchableOpacity>
                    );})}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Add New Album Modal */}
        <Modal
          visible={showAddAlbumModal}
          transparent={true}
          animationType="fade"
          onRequestClose={cancelAddAlbum}
        >
          <KeyboardAvoidingView 
            style={styles.addAlbumModalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.addAlbumModalContainer}>
              <View style={[styles.addAlbumModalContent, { backgroundColor: theme.background[0] }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Album</Text>
                  <TouchableOpacity onPress={cancelAddAlbum}>
                    <X size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Album Name</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.accent, backgroundColor: 'rgba(255,255,255,0.1)' }]}
                    value={newAlbumName}
                    onChangeText={setNewAlbumName}
                    placeholder="Enter album name"
                    placeholderTextColor={`${theme.text}50`}
                    returnKeyType="next"
                    autoFocus={true}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Artist Name</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.accent, backgroundColor: 'rgba(255,255,255,0.1)' }]}
                    value={newArtistName}
                    onChangeText={setNewArtistName}
                    placeholder="Enter artist name"
                    placeholderTextColor={`${theme.text}50`}
                    returnKeyType="done"
                    onSubmitEditing={addNewAlbum}
                  />
                </View>
                
                {/* Cover Photo Section */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Cover Photo (Optional)</Text>
                  
                  {newCoverImage ? (
                    <View style={styles.coverImageContainer}>
                      <Image source={{ uri: newCoverImage }} style={styles.coverImagePreview} />
                      <TouchableOpacity 
                        style={styles.removeCoverButton}
                        onPress={removeCoverImage}
                      >
                        <X size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.photoButtonsContainer}>
                      <TouchableOpacity 
                        style={[styles.photoButton, { borderColor: theme.accent }]}
                        onPress={pickImage}
                      >
                        <ImageIcon size={20} color={theme.accent} />
                        <Text style={[styles.photoButtonText, { color: theme.accent }]}>Choose from Album</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={cancelAddAlbum}
                  >
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.addAlbumButton, { backgroundColor: theme.accent }]}
                    onPress={addNewAlbum}
                  >
                    <Plus size={18} color="#FFFFFF" />
                    <Text style={[styles.modalButtonText, styles.addAlbumButtonText, { color: '#FFFFFF' }]}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Edit Cover Modal */}
        <Modal
          visible={showEditCoverModal}
          transparent={true}
          animationType="fade"
          onRequestClose={cancelEditCover}
        >
          <KeyboardAvoidingView 
            style={styles.addAlbumModalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.addAlbumModalContainer}>
              <View style={[styles.addAlbumModalContent, { backgroundColor: theme.background[0] }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Album Cover</Text>
                  <TouchableOpacity onPress={cancelEditCover}>
                    <X size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Album: {editingCoverRecord?.albumName}</Text>
                  <Text style={[styles.inputLabel, { color: theme.text, opacity: 0.7 }]}>by {editingCoverRecord?.artistName}</Text>
                </View>
                
                {/* Cover Photo Section */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Album Cover</Text>
                  
                  {newEditCoverImage ? (
                    <View style={styles.coverImageContainer}>
                      <Image source={{ uri: newEditCoverImage }} style={styles.coverImagePreview} />
                      <TouchableOpacity 
                        style={styles.removeCoverButton}
                        onPress={removeNewEditCoverImage}
                      >
                        <X size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.noCoverPlaceholder}>
                      <ImageIcon size={48} color={theme.text} opacity={0.3} />
                      <Text style={[styles.noCoverPlaceholderText, { color: theme.text }]}>No cover image</Text>
                    </View>
                  )}
                  
                  <View style={styles.photoButtonsContainer}>
                    <TouchableOpacity 
                      style={[styles.photoButton, { borderColor: theme.accent }]}
                      onPress={pickNewEditImage}
                    >
                      <ImageIcon size={20} color={theme.accent} />
                      <Text style={[styles.photoButtonText, { color: theme.accent }]}>Choose from Album</Text>
                    </TouchableOpacity>
                    
                    {newEditCoverImage && (
                      <TouchableOpacity 
                        style={[styles.photoButton, { borderColor: '#FF6B6B', backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}
                        onPress={removeNewEditCoverImage}
                      >
                        <Trash2 size={20} color="#FF6B6B" />
                        <Text style={[styles.photoButtonText, { color: '#FF6B6B' }]}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={cancelEditCover}
                  >
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.addAlbumButton, { backgroundColor: theme.accent }]}
                    onPress={saveEditedCover}
                  >
                    <Check size={18} color="#FFFFFF" />
                    <Text style={[styles.modalButtonText, styles.addAlbumButtonText, { color: '#FFFFFF' }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Edit Album Modal */}
        <Modal
          visible={showEditAlbumModal}
          transparent={true}
          animationType="fade"
          onRequestClose={cancelEditAlbum}
        >
          <KeyboardAvoidingView 
            style={styles.addAlbumModalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              contentContainerStyle={styles.editAlbumScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.editAlbumModalContent, { backgroundColor: theme.background[0] }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Album</Text>
                  <TouchableOpacity onPress={cancelEditAlbum}>
                    <X size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Album Name</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.accent, backgroundColor: 'rgba(255,255,255,0.1)' }]}
                    value={editAlbumName}
                    onChangeText={setEditAlbumName}
                    placeholder="Enter album name"
                    placeholderTextColor={`${theme.text}50`}
                    returnKeyType="next"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Artist Name</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.accent, backgroundColor: 'rgba(255,255,255,0.1)' }]}
                    value={editArtistName}
                    onChangeText={setEditArtistName}
                    placeholder="Enter artist name"
                    placeholderTextColor={`${theme.text}50`}
                    returnKeyType="next"
                  />
                </View>
                
                {/* Cover Photo Section */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Cover Photo (Optional)</Text>
                  
                  {editCoverImage ? (
                    <View style={styles.coverImageContainer}>
                      <Image source={{ uri: editCoverImage }} style={styles.coverImagePreview} />
                      <TouchableOpacity 
                        style={styles.removeCoverButton}
                        onPress={removeEditCoverImage}
                      >
                        <X size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.photoButtonsContainer}>
                      <TouchableOpacity 
                        style={[styles.photoButton, { borderColor: theme.accent }]}
                        onPress={pickEditImage}
                      >
                        <ImageIcon size={20} color={theme.accent} />
                        <Text style={[styles.photoButtonText, { color: theme.accent }]}>Choose from Album</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                
                {/* Songs Section */}
                <View style={styles.inputContainer}>
                  <View style={styles.songsHeader}>
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Songs (Optional)</Text>
                    <TouchableOpacity 
                      style={[styles.addSongButton, { borderColor: theme.accent }]}
                      onPress={addSongToEdit}
                    >
                      <Plus size={16} color={theme.accent} />
                      <Text style={[styles.addSongButtonText, { color: theme.accent }]}>Add Song</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {editSongs.map((song, index) => (
                    <View key={index} style={styles.songInputContainer}>
                      <TextInput
                        style={[styles.songInput, { color: theme.text, borderColor: theme.accent, backgroundColor: 'rgba(255,255,255,0.1)' }]}
                        value={song}
                        onChangeText={(value) => updateSongInEdit(index, value)}
                        placeholder={`Song ${index + 1}`}
                        placeholderTextColor={`${theme.text}50`}
                        returnKeyType="next"
                      />
                      <TouchableOpacity 
                        style={styles.removeSongButton}
                        onPress={() => removeSongFromEdit(index)}
                      >
                        <X size={16} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  {editSongs.length === 0 && (
                    <Text style={[styles.noSongsText, { color: theme.text }]}>No songs added yet</Text>
                  )}
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={cancelEditAlbum}
                  >
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.addAlbumButton, { backgroundColor: theme.accent }]}
                    onPress={saveEditedAlbum}
                  >
                    <Check size={18} color="#FFFFFF" />
                    <Text style={[styles.modalButtonText, styles.addAlbumButtonText, { color: '#FFFFFF' }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>

        {/* You Pick Color Modal */}
        <Modal
          visible={showYouPickModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowYouPickModal(false)}
        >
          <KeyboardAvoidingView 
            style={styles.addAlbumModalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.addAlbumModalContainer}>
              <View style={[styles.addAlbumModalContent, { backgroundColor: theme.background[0] }]}>
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
                      setShowYouPickModal(false);
                      setYouPickDescription('');
                    }}
                  >
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.addAlbumButton, { backgroundColor: theme.accent, opacity: youPickDescription.trim() ? 1 : 0.5 }]}
                    onPress={async () => {
                      if (!youPickDescription.trim()) return;
                      
                      setShowYouPickModal(false);
                      setIsGeneratingTheme(true);
                      
                      try {
                        console.log('Generating You Pick theme for description:', youPickDescription);
                        
                        const fallbackTheme = generateDescriptionBasedTheme(youPickDescription);
                        setYouPickTheme(fallbackTheme);
                        setYouPickDescription('');
                        
                        if (Platform.OS !== 'web') {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }
                        
                        Alert.alert(
                          'Custom Theme Created!', 
                          `Created a beautiful color scheme based on "${youPickDescription}".`,
                          [{ text: 'Perfect!' }]
                        );
                      } catch (error: unknown) {
                        console.error('Error generating You Pick theme:', error);
                        
                        const fallbackTheme = generateDescriptionBasedTheme(youPickDescription);
                        setYouPickTheme(fallbackTheme);
                        setYouPickDescription('');
                        
                        if (Platform.OS !== 'web') {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }
                        
                        Alert.alert(
                          'Custom Theme Created!', 
                          'Created a beautiful color scheme for you!',
                          [{ text: 'Great!' }]
                        );
                      } finally {
                        setIsGeneratingTheme(false);
                      }
                    }}
                    disabled={isGeneratingTheme || !youPickDescription.trim()}
                  >
                    {isGeneratingTheme ? (
                      <Text style={[styles.modalButtonText, styles.addAlbumButtonText, { color: '#FFFFFF' }]}>Generating...</Text>
                    ) : (
                      <>
                        <Check size={18} color="#FFFFFF" />
                        <Text style={[styles.modalButtonText, styles.addAlbumButtonText, { color: '#FFFFFF' }]}>Generate ✨</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Edit Modal */}
        <Modal
          visible={showEditModal}
          transparent
          animationType="fade"
          onRequestClose={cancelEdit}
        >
          <KeyboardAvoidingView 
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={[styles.modalContent, { backgroundColor: theme.background[0] }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Record Info</Text>
                  <TouchableOpacity onPress={cancelEdit}>
                    <X size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Album Name</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.accent }]}
                    value={tempRecordName}
                    onChangeText={setTempRecordName}
                    placeholder="Enter album name"
                    placeholderTextColor={`${theme.text}50`}
                    returnKeyType="next"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Artist Name</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.accent }]}
                    value={tempArtistName}
                    onChangeText={setTempArtistName}
                    placeholder="Enter artist name"
                    placeholderTextColor={`${theme.text}50`}
                    returnKeyType="next"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Current Song</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.accent }]}
                    value={tempCurrentSong}
                    onChangeText={(text) => {
                      setTempCurrentSong(text);
                      updateCurrentSong(text);
                    }}
                    placeholder="Enter current song title"
                    placeholderTextColor={`${theme.text}50`}
                    returnKeyType="done"
                  />
                </View>
                
                <TouchableOpacity 
                  style={[styles.resetButton, { borderColor: theme.accent }]}
                  onPress={resetToDefault}
                >
                  <RotateCcw size={16} color={theme.accent} />
                  <Text style={[styles.resetButtonText, { color: theme.accent }]}>Reset to Old Skool Apps</Text>
                </TouchableOpacity>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={cancelEdit}
                  >
                    <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: theme.accent }]}
                    onPress={saveRecordName}
                  >
                    <Check size={20} color="#FFFFFF" />
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF', marginLeft: 8 }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
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
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  floatingSettingsButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 30,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 3,
  },
  rpmButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  rpmText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  settingsButton: {
    backgroundColor: '#1A1A1A',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
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
  turntableContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  turntableBase: {
    width: RECORD_SIZE + 40,
    height: RECORD_SIZE + 40,
    backgroundColor: '#3A3A3A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 4,
    borderColor: '#2A2A2A',
    borderRadius: 16,
  },
  recordContainer: {
    width: RECORD_SIZE,
    height: RECORD_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  record: {
    width: RECORD_SIZE,
    height: RECORD_SIZE,
    borderRadius: RECORD_SIZE / 2,
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
    width: RECORD_SIZE * 0.35,
    height: RECORD_SIZE * 0.35,
    borderRadius: (RECORD_SIZE * 0.35) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    padding: 10,
    overflow: 'hidden',
  },

  labelTitle: {
    fontSize: 11,
    fontWeight: '900' as const,
    color: '#1A0E08',
    letterSpacing: 0.3,
    textAlign: 'center' as const,
    maxWidth: RECORD_SIZE * 0.3,
  },
  labelArtist: {
    fontSize: 9,
    color: '#2C1810',
    marginTop: 2,
    textAlign: 'center' as const,
    maxWidth: RECORD_SIZE * 0.3,
  },
  editLabelButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
  },
  centerHole: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0A0A0A',
  },
  trackInfo: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 15,
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 20,
    flexWrap: 'wrap' as const,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    gap: 4,
    minWidth: 100,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  collectionModal: {
    flex: 1,
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },

  collectionList: {
    flex: 1,
    marginTop: 20,
  },
  emptyCollection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 16,
    opacity: 0.7,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.5,
    textAlign: 'center' as const,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  recordInfo: {
    flex: 1,
  },
  recordAlbum: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  recordArtist: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  recordSongs: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic' as const,
    marginBottom: 2,
  },
  recordActions: {
    flexDirection: 'row',
    gap: 8,
  },
  coverEditButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  albumName: {
    fontSize: 32,
    fontWeight: '800' as const,
    marginBottom: 4,
    textAlign: 'center' as const,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginBottom: 6,
  },
  trackArtist: {
    fontSize: 16,
    marginBottom: 4,
  },
  currentSong: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  trackDuration: {
    fontSize: 14,
  },
  decadeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
    marginBottom: 12,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalScrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    flex: 1,
    flexShrink: 1,
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
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  addAlbumButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 100,
    gap: 6,
  },
  addAlbumButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  cancelButton: {
    backgroundColor: '#555',
    minWidth: 100,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  stopIcon: {
    width: 24,
    height: 24,
    borderRadius: 3,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  addNewAlbumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 20,
  },
  addNewAlbumButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  addAlbumModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAlbumModalContainer: {
    width: '90%',
    maxWidth: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAlbumModalContent: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  coverImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 8,
  },
  coverImagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  removeCoverButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  collectionCoverImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  editAlbumScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  editAlbumModalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    maxHeight: '90%',
  },
  songsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addSongButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 4,
  },
  addSongButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  songInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  songInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  removeSongButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  noSongsText: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    paddingVertical: 12,
  },
  songTitleContainer: {
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  songTitleTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  songEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  songEditInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 200,
  },
  songEditButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songEditIcon: {
    opacity: 0.7,
  },
  noCoverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed' as const,
  },
  noCoverPlaceholderText: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.6,
  },
  youPickTextArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: 4,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.8,
  },
});