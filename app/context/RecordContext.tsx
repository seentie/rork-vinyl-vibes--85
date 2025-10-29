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
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<SavedRecord | null>(null);
  const [currentSong, setCurrentSong] = useState<string>('Saturday Morning Forever');
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);
  const [tracks, setTracks] = useState<Track[]>(defaultTracks);
  const [stylusMovementEnabled, setStylusMovementEnabled] = useState<boolean>(true);

  const loadSavedRecords = useCallback(async () => {
    try {
      console.log('[RecordContext] Loading saved records...');
      setIsInitialized(false);
      const stored = await AsyncStorage.getItem('savedRecords');
      console.log('[RecordContext] Raw stored data:', stored ? `${stored.substring(0, 100)}...` : 'null');
      
      // If no data or clearly invalid, reset to empty array
      if (!stored || stored.trim() === '' || stored === 'undefined' || stored === 'null') {
        console.log('[RecordContext] No valid stored data, using empty array');
        setSavedRecords([]);
        setIsInitialized(true);
        return;
      }
      
      try {
        const trimmedStored = stored.trim();
        
        // Enhanced corruption detection BEFORE parsing
        const corruptionPatterns = [
          /object Object/i,
          /\[object/i,
          /^undefined/i,
          /\bundefined\b/,
          /^null$/,
          /^null\]/,
          /^\[null/,
          /NaN/,
          /Infinity/,
          /^[^\[{]/,  // Doesn't start with [ or {
          /[\]}]\s*[^\s]/,  // Characters after closing bracket
          /[^\s]\s*[\[{]/,  // Characters before opening bracket
        ];
        
        // Check for any corruption patterns
        const isCorrupted = corruptionPatterns.some(pattern => pattern.test(trimmedStored));
        
        if (isCorrupted || trimmedStored.length < 2) {
          console.warn('[RecordContext] Detected corrupted data pattern, clearing storage');
          console.warn('[RecordContext] Corrupted data sample:', trimmedStored.substring(0, 200));
          await AsyncStorage.removeItem('savedRecords');
          setSavedRecords([]);
          setIsInitialized(true);
          return;
        }
        
        // Validate JSON brackets are properly matched
        const openBrackets = (trimmedStored.match(/[\[{]/g) || []).length;
        const closeBrackets = (trimmedStored.match(/[\]}]/g) || []).length;
        
        if (openBrackets !== closeBrackets) {
          console.warn('Mismatched brackets detected, clearing corrupted data');
          await AsyncStorage.removeItem('savedRecords');
          setSavedRecords([]);
          setIsInitialized(true);
          return;
        }
        
        // Validate proper JSON structure
        if (!((trimmedStored.startsWith('{') && trimmedStored.endsWith('}')) || 
              (trimmedStored.startsWith('[') && trimmedStored.endsWith(']')))) {
          console.warn('Invalid JSON structure detected, clearing corrupted data');
          await AsyncStorage.removeItem('savedRecords');
          setSavedRecords([]);
          setIsInitialized(true);
          return;
        }
        
        // Attempt to parse JSON with extra safety
        let parsed;
        try {
          parsed = JSON.parse(trimmedStored);
        } catch (jsonError) {
          console.warn('JSON parse failed, clearing corrupted data:', jsonError);
          await AsyncStorage.removeItem('savedRecords');
          setSavedRecords([]);
          setIsInitialized(true);
          return;
        }
        
        // Validate parsed data structure
        if (parsed === null || parsed === undefined) {
          console.warn('Parsed data is null/undefined');
          await AsyncStorage.removeItem('savedRecords');
          setSavedRecords([]);
          setIsInitialized(true);
          return;
        }
        
        if (!Array.isArray(parsed)) {
          console.warn('Parsed data is not an array, resetting');
          await AsyncStorage.removeItem('savedRecords');
          setSavedRecords([]);
          setIsInitialized(true);
          return;
        }
        
        // Validate each record has required properties and proper types
        const validRecords = parsed.filter(record => {
          if (!record || typeof record !== 'object') return false;
          if (typeof record.id !== 'string' || record.id.trim() === '') return false;
          if (typeof record.albumName !== 'string' || record.albumName.trim() === '') return false;
          if (typeof record.artistName !== 'string' || record.artistName.trim() === '') return false;
          
          // Validate optional fields if present
          if (record.coverImage !== undefined && typeof record.coverImage !== 'string') return false;
          if (record.songs !== undefined && !Array.isArray(record.songs)) return false;
          if (record.songs && record.songs.some((s: any) => typeof s !== 'string')) return false;
          
          return true;
        });
        
        if (validRecords.length === 0 && parsed.length > 0) {
          console.warn('All records were invalid, clearing storage');
          await AsyncStorage.removeItem('savedRecords');
          setSavedRecords([]);
          setIsInitialized(true);
          return;
        }
        
        setSavedRecords(validRecords);
        setIsInitialized(true);
        
        // Save cleaned data if we filtered out invalid records
        if (validRecords.length !== parsed.length && validRecords.length > 0) {
          await AsyncStorage.setItem('savedRecords', JSON.stringify(validRecords));
        }
      } catch (parseError) {
        console.warn('Error processing saved records, clearing corrupted data:', parseError);
        await AsyncStorage.removeItem('savedRecords');
        setSavedRecords([]);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Critical error loading saved records:', error);
      setSavedRecords([]);
      setIsInitialized(true);
      try {
        await AsyncStorage.removeItem('savedRecords');
      } catch (clearError) {
        console.error('Error clearing corrupted storage:', clearError);
      }
    }
  }, []);

  const saveSavedRecords = useCallback(async (records: SavedRecord[]) => {
    console.log('[RecordContext] Saving records, count:', records?.length || 0);
    
    // Validate input
    if (!Array.isArray(records)) {
      console.warn('[RecordContext] Invalid records format (not array), not saving');
      return;
    }
    
    // Validate all records have required fields
    const validRecords = records.filter(record => 
      record && 
      typeof record === 'object' &&
      typeof record.id === 'string' && 
      typeof record.albumName === 'string' && 
      typeof record.artistName === 'string'
    );
    
    if (validRecords.length !== records.length) {
      console.warn(`Filtered out ${records.length - validRecords.length} invalid records`);
    }
    
    try {
      console.log('[RecordContext] Stringifying', validRecords.length, 'valid records');
      const jsonString = JSON.stringify(validRecords);
      console.log('[RecordContext] JSON string length:', jsonString.length);
      
      // Validate the JSON string is valid and can be parsed back
      const testParse = JSON.parse(jsonString);
      if (!Array.isArray(testParse)) {
        throw new Error('Stringified data is not an array');
      }
      
      // Additional validation: ensure no corruption patterns in stringified data
      if (jsonString.includes('object Object') || 
          jsonString.includes('[object') ||
          jsonString.includes('undefined') ||
          jsonString.includes('NaN') ||
          jsonString.includes('Infinity')) {
        throw new Error('Detected corruption in stringified data');
      }
      
      console.log('[RecordContext] Writing to AsyncStorage...');
      await AsyncStorage.setItem('savedRecords', jsonString);
      console.log('[RecordContext] AsyncStorage write successful');
      setSavedRecords(validRecords);
    } catch (error) {
      console.error('[RecordContext] CRITICAL: Error saving records:', error);
      console.error('[RecordContext] Error details:', error instanceof Error ? error.message : 'Unknown error');
      // If save fails, don't update state to keep consistency
      try {
        await AsyncStorage.removeItem('savedRecords');
        setSavedRecords([]);
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
    isInitialized,
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
    isInitialized,
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