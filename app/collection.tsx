import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, X, Check, Music, Trash2, Edit2, Music2, Play } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRecord } from './context/RecordContext';
import type { SavedRecord } from './context/RecordContext';

export default function CollectionScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isLargeDevice = screenWidth >= 768;
  const { savedRecords, saveSavedRecords, selectRecord, selectedRecord, selectSongFromRecord, currentSong } = useRecord();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SavedRecord | null>(null);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newArtistName, setNewArtistName] = useState('');
  const [coverImageUri, setCoverImageUri] = useState<string | undefined>(undefined);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newAlbumSongs, setNewAlbumSongs] = useState<string[]>([]);
  const [editingSongs, setEditingSongs] = useState<string[]>([]);
  const [showSongSelector, setShowSongSelector] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<SavedRecord | null>(null);

  const displayRecord = savedRecords.find(r => r.id === 'display-retro-renaissance');
  const userRecords = savedRecords.filter(r => r.id !== 'display-retro-renaissance');
  const canAddMore = userRecords.length < 85;

  const handleAddAlbum = async () => {
    if (!newAlbumName.trim() || !newArtistName.trim()) {
      Alert.alert('Missing Information', 'Please enter both album name and artist name.');
      return;
    }

    if (!canAddMore) {
      Alert.alert('Collection Full', 'You can only add up to 85 albums.');
      return;
    }

    const newRecord: SavedRecord = {
      id: `album-${Date.now()}`,
      albumName: newAlbumName.trim(),
      artistName: newArtistName.trim(),
      dateAdded: new Date().toISOString(),
      coverImage: coverImageUri,
      songs: newAlbumSongs,
    };

    const updatedRecords = [...savedRecords, newRecord];
    await saveSavedRecords(updatedRecords);
    
    selectRecord(newRecord);

    setNewAlbumName('');
    setNewArtistName('');
    setCoverImageUri(undefined);
    setNewAlbumSongs([]);
    setNewSongTitle('');
    setShowAddModal(false);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Alert.alert('Album Added!', `"${newRecord.albumName}" has been added to your collection.`);
  };

  const handleEditAlbum = async () => {
    if (!editingRecord) return;
    
    if (!newAlbumName.trim() || !newArtistName.trim()) {
      Alert.alert('Missing Information', 'Please enter both album name and artist name.');
      return;
    }

    const updatedRecord: SavedRecord = {
      ...editingRecord,
      albumName: newAlbumName.trim(),
      artistName: newArtistName.trim(),
      coverImage: coverImageUri,
      songs: editingSongs,
    };

    const updatedRecords = savedRecords.map(r => 
      r.id === editingRecord.id ? updatedRecord : r
    );
    
    await saveSavedRecords(updatedRecords);
    
    if (selectedRecord?.id === editingRecord.id) {
      selectRecord(updatedRecord);
    }

    setEditingRecord(null);
    setNewAlbumName('');
    setNewArtistName('');
    setCoverImageUri(undefined);
    setEditingSongs([]);
    setNewSongTitle('');
    setShowEditModal(false);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Alert.alert('Album Updated!', `"${updatedRecord.albumName}" has been updated.`);
  };

  const handleDeleteAlbum = async (record: SavedRecord) => {
    Alert.alert(
      'Delete Album',
      `Are you sure you want to delete "${record.albumName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedRecords = savedRecords.filter(r => r.id !== record.id);
            await saveSavedRecords(updatedRecords);

            if (selectedRecord?.id === record.id) {
              const defaultRecord = savedRecords.find(r => r.id === 'display-retro-renaissance');
              if (defaultRecord) {
                selectRecord(defaultRecord);
              }
            }

            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  const handleSelectCover = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to select a cover image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCoverImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const openEditModal = (record: SavedRecord) => {
    setEditingRecord(record);
    setNewAlbumName(record.albumName);
    setNewArtistName(record.artistName);
    setCoverImageUri(record.coverImage);
    setEditingSongs(record.songs || []);
    setNewSongTitle('');
    setShowEditModal(true);
  };

  const closeAddModal = () => {
    setNewAlbumName('');
    setNewArtistName('');
    setCoverImageUri(undefined);
    setNewAlbumSongs([]);
    setNewSongTitle('');
    setShowAddModal(false);
  };

  const closeEditModal = () => {
    setEditingRecord(null);
    setNewAlbumName('');
    setNewArtistName('');
    setCoverImageUri(undefined);
    setEditingSongs([]);
    setNewSongTitle('');
    setShowEditModal(false);
  };

  const handleAddSongToEditing = () => {
    if (!newSongTitle.trim()) {
      Alert.alert('Missing Information', 'Please enter a song title.');
      return;
    }

    if (editingSongs.length >= 15) {
      Alert.alert('Song Limit Reached', 'You can only add up to 15 songs per album.');
      return;
    }

    setEditingSongs([...editingSongs, newSongTitle.trim()]);
    setNewSongTitle('');

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveSongFromEditing = (index: number) => {
    setEditingSongs(editingSongs.filter((_, i) => i !== index));

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAddSongToNew = () => {
    if (!newSongTitle.trim()) {
      Alert.alert('Missing Information', 'Please enter a song title.');
      return;
    }

    if (newAlbumSongs.length >= 15) {
      Alert.alert('Song Limit Reached', 'You can only add up to 15 songs per album.');
      return;
    }

    setNewAlbumSongs([...newAlbumSongs, newSongTitle.trim()]);
    setNewSongTitle('');

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveSongFromNew = (index: number) => {
    setNewAlbumSongs(newAlbumSongs.filter((_, i) => i !== index));

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <LinearGradient
      colors={['#9C27B0', '#E91E63', '#3F51B5']}
      style={styles.container}
    >
      <ScrollView
        style={[styles.scrollView, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Collection</Text>
          <Text style={styles.subtitle}>
            {userRecords.length}/85 albums
          </Text>
        </View>

        {canAddMore && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowAddModal(true);
            }}
          >
            <Plus size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Album</Text>
          </TouchableOpacity>
        )}

        {/* Display Album Section */}
        {displayRecord && (
          <View style={styles.displaySection}>
            <Text style={styles.displaySectionTitle}>Display Album</Text>
            <View style={styles.albumCard}>
              <TouchableOpacity
                style={styles.albumTouchable}
                onPress={() => {
                  selectRecord(displayRecord);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  Alert.alert(
                    'Album Selected',
                    `Now playing "${displayRecord.albumName}" by ${displayRecord.artistName}`
                  );
                }}
              >
                <View style={styles.albumCover}>
                  {displayRecord.coverImage ? (
                    <Image source={{ uri: displayRecord.coverImage }} style={styles.coverImage} />
                  ) : (
                    <View style={styles.placeholderCover}>
                      <Music size={48} color="#FFFFFF" strokeWidth={1} />
                    </View>
                  )}
                </View>
                <View style={styles.albumInfo}>
                  <Text style={styles.albumName} numberOfLines={2}>
                    {displayRecord.albumName}
                  </Text>
                  <Text style={styles.artistName} numberOfLines={1}>
                    {displayRecord.artistName}
                  </Text>
                  <Text style={styles.songCount}>
                    {displayRecord.songs?.length || 0} songs
                  </Text>
                  {displayRecord.songs && displayRecord.songs.length > 0 && (
                    <TouchableOpacity
                      style={styles.songSelectorButton}
                      onPress={() => {
                        selectRecord(displayRecord);
                        setShowSongSelector(true);
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                    >
                      <Play size={14} color="#FFFFFF" />
                      <Text style={styles.songSelectorButtonText}>Select Song</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* User Albums Section */}
        <Text style={styles.sectionTitle}>Your Albums</Text>
        
        {userRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Music size={64} color="#FFFFFF" strokeWidth={1} />
            <Text style={styles.emptyText}>No albums yet</Text>
            <Text style={styles.emptySubtext}>Add albums to build your collection</Text>
          </View>
        ) : (
          <View style={[styles.albumGrid]}>
            {userRecords.map((record) => (
              <View key={record.id} style={[styles.albumCard, isLargeDevice && { width: '48%' }]}>
                <TouchableOpacity
                  style={styles.albumTouchable}
                  onPress={() => {
                    setViewingRecord(record);
                    selectRecord(record);
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    if (record.songs && record.songs.length > 0) {
                      setShowSongSelector(true);
                    } else {
                      Alert.alert(
                        'Album Selected',
                        `Now playing "${record.albumName}" by ${record.artistName}.\n\nThis album has no songs yet. Tap Edit to add songs.`
                      );
                    }
                  }}
                >
                  <View style={styles.albumCover}>
                    {record.coverImage ? (
                      <Image source={{ uri: record.coverImage }} style={styles.coverImage} />
                    ) : (
                      <View style={styles.placeholderCover}>
                        <Music size={48} color="#FFFFFF" strokeWidth={1} />
                      </View>
                    )}
                  </View>
                  <View style={styles.albumInfo}>
                    <Text style={styles.albumName} numberOfLines={2}>
                      {record.albumName}
                    </Text>
                    <Text style={styles.artistName} numberOfLines={1}>
                      {record.artistName}
                    </Text>
                    <Text style={styles.songCount}>
                      {record.songs?.length || 0} songs
                    </Text>
                    {record.songs && record.songs.length > 0 && (
                      <TouchableOpacity
                        style={styles.songSelectorButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          setViewingRecord(record);
                          selectRecord(record);
                          setShowSongSelector(true);
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        }}
                      >
                        <Play size={14} color="#FFFFFF" />
                        <Text style={styles.songSelectorButtonText}>Select Song</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
                <View style={styles.albumActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      openEditModal(record);
                    }}
                  >
                    <Edit2 size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                      handleDeleteAlbum(record);
                    }}
                  >
                    <Trash2 size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Song Selector Modal */}
      <Modal
        visible={showSongSelector}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowSongSelector(false);
          setViewingRecord(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Song</Text>
                <TouchableOpacity onPress={() => {
                  setShowSongSelector(false);
                  setViewingRecord(null);
                }}>
                  <X size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                {viewingRecord?.albumName} - {viewingRecord?.artistName}
              </Text>

              <ScrollView style={styles.songSelectorList}>
                {viewingRecord?.songs?.map((song, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.songSelectorItem,
                      currentSong === song && styles.songSelectorItemActive,
                    ]}
                    onPress={() => {
                      selectSongFromRecord(song);
                      setShowSongSelector(false);
                      setViewingRecord(null);
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                      Alert.alert('Song Selected', `Now playing "${song}"`);
                    }}
                  >
                    <Music2 size={18} color={currentSong === song ? "#9C27B0" : "#666"} />
                    <Text
                      style={[
                        styles.songSelectorItemText,
                        currentSong === song && styles.songSelectorItemTextActive,
                      ]}
                    >
                      {song}
                    </Text>
                    {currentSong === song && (
                      <Check size={18} color="#9C27B0" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Album Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={closeAddModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Album</Text>
                <TouchableOpacity onPress={closeAddModal}>
                  <X size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.coverSelector} onPress={handleSelectCover}>
                {coverImageUri ? (
                  <Image source={{ uri: coverImageUri }} style={styles.selectedCover} />
                ) : (
                  <View style={styles.coverPlaceholder}>
                    <Plus size={32} color="#666" />
                    <Text style={styles.coverPlaceholderText}>Add Cover</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Album Name</Text>
                <TextInput
                  style={styles.input}
                  value={newAlbumName}
                  onChangeText={setNewAlbumName}
                  placeholder="Enter album name"
                  placeholderTextColor="#999"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Artist Name</Text>
                <TextInput
                  style={styles.input}
                  value={newArtistName}
                  onChangeText={setNewArtistName}
                  placeholder="Enter artist name"
                  placeholderTextColor="#999"
                  returnKeyType="next"
                />
              </View>

              {/* Songs Section */}
              <View style={styles.songsContainer}>
                <Text style={styles.inputLabel}>Songs ({newAlbumSongs.length}/15)</Text>
                
                {newAlbumSongs.length > 0 && (
                  <View style={styles.songsList}>
                    {newAlbumSongs.map((song, index) => (
                      <View key={index} style={styles.songItem}>
                        <Music2 size={16} color="#666" />
                        <Text style={styles.songItemText} numberOfLines={1}>{song}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveSongFromNew(index)}
                          style={styles.removeSongButton}
                        >
                          <X size={16} color="#FF6B6B" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.addSongContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={newSongTitle}
                    onChangeText={setNewSongTitle}
                    placeholder="Add song title"
                    placeholderTextColor="#999"
                    returnKeyType="done"
                    onSubmitEditing={handleAddSongToNew}
                  />
                  <TouchableOpacity
                    style={styles.addSongButton}
                    onPress={handleAddSongToNew}
                    disabled={!newSongTitle.trim() || newAlbumSongs.length >= 15}
                  >
                    <Plus size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeAddModal}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleAddAlbum}
                >
                  <Check size={20} color="#FFFFFF" />
                  <Text style={[styles.modalButtonText, { marginLeft: 8 }]}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Album Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={closeEditModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Album</Text>
                <TouchableOpacity onPress={closeEditModal}>
                  <X size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.coverSelector} onPress={handleSelectCover}>
                {coverImageUri ? (
                  <Image source={{ uri: coverImageUri }} style={styles.selectedCover} />
                ) : (
                  <View style={styles.coverPlaceholder}>
                    <Plus size={32} color="#666" />
                    <Text style={styles.coverPlaceholderText}>Add Cover</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Album Name</Text>
                <TextInput
                  style={styles.input}
                  value={newAlbumName}
                  onChangeText={setNewAlbumName}
                  placeholder="Enter album name"
                  placeholderTextColor="#999"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Artist Name</Text>
                <TextInput
                  style={styles.input}
                  value={newArtistName}
                  onChangeText={setNewArtistName}
                  placeholder="Enter artist name"
                  placeholderTextColor="#999"
                  returnKeyType="next"
                />
              </View>

              {/* Songs Section */}
              <View style={styles.songsContainer}>
                <Text style={styles.inputLabel}>Songs ({editingSongs.length}/15)</Text>
                
                {editingSongs.length > 0 && (
                  <View style={styles.songsList}>
                    {editingSongs.map((song, index) => (
                      <View key={index} style={styles.songItem}>
                        <Music2 size={16} color="#666" />
                        <Text style={styles.songItemText} numberOfLines={1}>{song}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveSongFromEditing(index)}
                          style={styles.removeSongButton}
                        >
                          <X size={16} color="#FF6B6B" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.addSongContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={newSongTitle}
                    onChangeText={setNewSongTitle}
                    placeholder="Add song title"
                    placeholderTextColor="#999"
                    returnKeyType="done"
                    onSubmitEditing={handleAddSongToEditing}
                  />
                  <TouchableOpacity
                    style={styles.addSongButton}
                    onPress={handleAddSongToEditing}
                    disabled={!newSongTitle.trim() || editingSongs.length >= 15}
                  >
                    <Plus size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeEditModal}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleEditAlbum}
                >
                  <Check size={20} color="#FFFFFF" />
                  <Text style={[styles.modalButtonText, { marginLeft: 8 }]}>Save</Text>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  displaySection: {
    marginBottom: 32,
  },
  displaySectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    gap: 8,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 8,
  },
  albumGrid: {
    gap: 16,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'flex-start' as const,
  },
  albumCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
  },
  albumTouchable: {
    flexDirection: 'row',
    padding: 12,
  },
  albumCover: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  albumName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  songCount: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  albumActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 550,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
    fontWeight: '700' as const,
    color: '#333',
  },
  coverSelector: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  selectedCover: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  coverPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
    backgroundColor: '#999',
  },
  saveButton: {
    backgroundColor: '#9C27B0',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  songsContainer: {
    marginBottom: 16,
  },
  songsList: {
    maxHeight: 150,
    marginTop: 8,
    marginBottom: 12,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    gap: 8,
  },
  songItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  removeSongButton: {
    padding: 4,
  },
  addSongContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addSongButton: {
    backgroundColor: '#9C27B0',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  songSelectorButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center' as const,
  },
  songSelectorList: {
    maxHeight: 400,
  },
  songSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
    gap: 12,
  },
  songSelectorItemActive: {
    backgroundColor: '#E8D4F1',
    borderWidth: 2,
    borderColor: '#9C27B0',
  },
  songSelectorItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  songSelectorItemTextActive: {
    fontWeight: '700' as const,
    color: '#9C27B0',
  },
});
