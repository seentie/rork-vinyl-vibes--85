import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

interface SavedRecord {
  id: string;
  albumName: string;
  artistName: string;
  dateAdded: string;
  coverImage?: string;
  songs?: string[];
}

interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  decade: string;
}



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

export const [RecordProvider, useRecord] = createContextHook(() => {
  const [selectedRecord, setSelectedRecord] = useState<SavedRecord | null>(null);
  const [currentSong, setCurrentSong] = useState<string>('Saturday Morning Forever');
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);
  const [tracks, setTracks] = useState<Track[]>(defaultTracks);
  const [stylusMovementEnabled, setStylusMovementEnabled] = useState<boolean>(true);

  const loadSavedRecords = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('savedRecords');
      if (stored && stored.trim() && stored !== 'undefined' && stored !== 'null') {
        try {
          const trimmedStored = stored.trim();
          
          // Check for common corruption patterns BEFORE attempting to parse
          // This catches cases where objects were stringified incorrectly
          if (trimmedStored.includes('object Object') || 
              trimmedStored.includes('[object') || 
              trimmedStored.includes('undefined') ||
              trimmedStored === 'null' ||
              trimmedStored === 'null]' ||
              trimmedStored === '[null' ||
              trimmedStored.includes('NaN') ||
              trimmedStored.includes('Infinity') ||
              trimmedStored.length < 2 ||
              (!trimmedStored.startsWith('[') && !trimmedStored.startsWith('{'))) {
            console.warn('Detected corrupted data pattern, clearing storage:', trimmedStored.substring(0, 50));
            await AsyncStorage.removeItem('savedRecords');
            setSavedRecords([]);
            return;
          }
          
          // Validate JSON structure before parsing
          if (!((trimmedStored.startsWith('{') && trimmedStored.endsWith('}')) || 
                (trimmedStored.startsWith('[') && trimmedStored.endsWith(']')))) {
            console.warn('Invalid JSON structure detected, clearing corrupted data');
            await AsyncStorage.removeItem('savedRecords');
            setSavedRecords([]);
            return;
          }
          
          // Attempt to parse JSON
          let parsed;
          try {
            parsed = JSON.parse(trimmedStored);
          } catch (jsonError) {
            console.warn('JSON parse failed, clearing corrupted data:', jsonError);
            await AsyncStorage.removeItem('savedRecords');
            setSavedRecords([]);
            return;
          }
          
          // Validate parsed data is an array
          if (!Array.isArray(parsed)) {
            console.warn('Parsed data is not an array, resetting to empty array');
            await AsyncStorage.removeItem('savedRecords');
            setSavedRecords([]);
            return;
          }
          
          // Validate each record has required properties
          const validRecords = parsed.filter(record => 
            record && 
            typeof record === 'object' && 
            typeof record.id === 'string' && 
            typeof record.albumName === 'string' && 
            typeof record.artistName === 'string'
          );
          
          setSavedRecords(validRecords);
          
          // If we filtered out invalid records, save the cleaned data
          if (validRecords.length !== parsed.length) {
            await AsyncStorage.setItem('savedRecords', JSON.stringify(validRecords));
          }
        } catch (parseError) {
          console.warn('Error processing saved records, clearing corrupted data:', parseError);
          setSavedRecords([]);
          await AsyncStorage.removeItem('savedRecords');
        }
      } else {
        setSavedRecords([]);
      }
    } catch (error) {
      console.error('Error loading saved records:', error);
      setSavedRecords([]);
      try {
        await AsyncStorage.removeItem('savedRecords');
      } catch (clearError) {
        console.error('Error clearing corrupted storage:', clearError);
      }
    }
  }, []);

  const saveSavedRecords = useCallback(async (records: SavedRecord[]) => {
    if (!Array.isArray(records)) {
      console.warn('Invalid records format, not saving');
      return;
    }
    
    try {
      const jsonString = JSON.stringify(records);
      // Validate the JSON string can be parsed back
      JSON.parse(jsonString);
      await AsyncStorage.setItem('savedRecords', jsonString);
      setSavedRecords(records);
    } catch (error) {
      console.error('Error saving records:', error);
      try {
        await AsyncStorage.removeItem('savedRecords');
      } catch (removeError) {
        console.error('Error removing corrupted data:', removeError);
      }
    }
  }, []);

  const selectRecord = useCallback((record: SavedRecord) => {
    if (!record || !record.albumName || !record.artistName) {
      console.warn('Invalid record data');
      return;
    }
    
    console.log('Selecting record:', record.albumName, 'by', record.artistName);
    setSelectedRecord(record);
    
    // Update tracks with selected album info
    const updatedTracks = tracks.map(track => ({
      ...track,
      album: record.albumName || track.album,
      artist: record.artistName || track.artist,
    }));
    setTracks(updatedTracks);
    
    // Set current song to first song from the record if available, otherwise clear it
    if (record.songs && Array.isArray(record.songs) && record.songs.length > 0) {
      setCurrentSong(record.songs[0] || '');
    } else {
      setCurrentSong('');
    }
  }, [tracks]);

  const addSongToRecord = useCallback(async (songTitle: string) => {
    if (!selectedRecord || !songTitle.trim()) {
      console.warn('No record selected or empty song title');
      return;
    }

    const updatedRecord = {
      ...selectedRecord,
      songs: [...(selectedRecord.songs || []), songTitle.trim()].slice(0, 15) // Limit to 15 songs
    };

    const updatedRecords = savedRecords.map(record => 
      record.id === selectedRecord.id ? updatedRecord : record
    );

    setSelectedRecord(updatedRecord);
    await saveSavedRecords(updatedRecords);
  }, [selectedRecord, savedRecords, saveSavedRecords]);

  const removeSongFromRecord = useCallback(async (songIndex: number) => {
    if (!selectedRecord || !selectedRecord.songs || songIndex < 0 || songIndex >= selectedRecord.songs.length) {
      console.warn('Invalid song removal request');
      return;
    }

    const updatedSongs = selectedRecord.songs.filter((_, index) => index !== songIndex);
    const updatedRecord = {
      ...selectedRecord,
      songs: updatedSongs
    };

    const updatedRecords = savedRecords.map(record => 
      record.id === selectedRecord.id ? updatedRecord : record
    );

    setSelectedRecord(updatedRecord);
    await saveSavedRecords(updatedRecords);

    // If we removed the current song, switch to the first available song
    if (selectedRecord.songs[songIndex] === currentSong) {
      const newCurrentSong = updatedSongs.length > 0 ? updatedSongs[0] : '';
      setCurrentSong(newCurrentSong);
    }
  }, [selectedRecord, savedRecords, saveSavedRecords, currentSong]);

  const selectSongFromRecord = useCallback((songTitle: string) => {
    if (!selectedRecord || !selectedRecord.songs || !selectedRecord.songs.includes(songTitle)) {
      console.warn('Song not found in current record');
      return;
    }
    
    console.log('Selecting song from record:', songTitle);
    setCurrentSong(songTitle);
  }, [selectedRecord]);

  const updateCurrentSong = useCallback((song: string) => {
    const sanitizedSong = typeof song === 'string' ? song.trim() : '';
    console.log('Updating current song to:', sanitizedSong);
    setCurrentSong(sanitizedSong);
  }, []);

  // Load saved records on initialization
  useEffect(() => {
    loadSavedRecords();
  }, [loadSavedRecords]);

  const clearAllData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('savedRecords');
      setSavedRecords([]);
      setSelectedRecord(null);
      setCurrentSong('Saturday Morning Forever');
      setTracks(defaultTracks);
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }, []);

  const clearCorruptedData = useCallback(async () => {
    try {
      console.log('Clearing potentially corrupted data...');
      await AsyncStorage.removeItem('savedRecords');
      setSavedRecords([]);
      setSelectedRecord(null);
      setCurrentSong('Saturday Morning Forever');
      setTracks(defaultTracks);
      console.log('Corrupted data cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing corrupted data:', error);
      return false;
    }
  }, []);

  const toggleStylusMovement = useCallback(() => {
    setStylusMovementEnabled(prev => !prev);
  }, []);

  const contextValue = useMemo(() => ({
    selectedRecord,
    currentSong,
    savedRecords,
    tracks,
    stylusMovementEnabled,
    selectRecord,
    updateCurrentSong,
    loadSavedRecords,
    saveSavedRecords,
    setSavedRecords,
    setTracks,
    clearAllData,
    clearCorruptedData,
    toggleStylusMovement,
    addSongToRecord,
    removeSongFromRecord,
    selectSongFromRecord,
  }), [
    selectedRecord,
    currentSong,
    savedRecords,
    tracks,
    stylusMovementEnabled,
    selectRecord,
    updateCurrentSong,
    loadSavedRecords,
    saveSavedRecords,
    clearAllData,
    clearCorruptedData,
    toggleStylusMovement,
    addSongToRecord,
    removeSongFromRecord,
    selectSongFromRecord,
  ]);

  return contextValue;
});

export type { SavedRecord, Track };