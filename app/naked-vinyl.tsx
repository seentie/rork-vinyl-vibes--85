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

const VINYL_QUOTES = [
  "Vinyl is the real deal. I've always felt like, until you buy the vinyl record, you don't really own the album. - Jack White",
  "Records have a feel to them. You can feel the notes. - Quincy Jones",
  "Vinyl is more than just sound quality. It's about the connection we have with music. - Ben Gibbard",
  "There's something about the ritual of it. Dropping the needle and being forced to listen to an entire side of an album. - Jack White",
  "Vinyl is the real soul of music. The soul is being able to hear it breathing. - Neil Young",
  "I love the sound of vinyl. There's a warmth that you just can't reproduce digitally. - Taylor Swift",
  "The charm of vinyl lies in its imperfections and the authentic sound it produces. - Eddie Vedder",
  "Every scratch and pop tells a story. That's the beauty of vinyl. - Dave Grohl",
  "Vinyl demands your attention in ways that streaming never will. - Adele",
  "There's magic in the grooves. You can almost see the music when you look at a record spinning. - Pharrell Williams",
  "Listening to vinyl is like reading a book instead of scrolling through headlines. - Billie Eilish",
  "Vinyl isn't just a format, it's an experience. It's tactile, it's visual, it's complete. - Thom Yorke",
  "The act of putting on a record is a commitment to the music. - St. Vincent",
  "Records are like time machines. They transport you back to a specific moment. - John Mayer",
  "Vinyl is the closest thing to being in the room with the artist. - Stevie Nicks",
  "There's a romance to vinyl that digital will never capture. - Lana Del Rey",
  "When you drop the needle, you're not just hearing music—you're experiencing it. - Chris Martin",
  "Vinyl is proof that old school is the best school. - Kendrick Lamar",
  "The crackle before the music starts is like an overture to the album. - Beck",
  "Collecting records is like collecting memories. Each one tells a different story. - Harry Styles",
  "Vinyl forces you to slow down and really listen. That's a gift in this fast-paced world. - Alicia Keys",
  "The album cover is part of the art. With vinyl, you get to appreciate it the way it was meant to be seen. - Paul McCartney",
  "Nothing beats the warmth and depth of vinyl. It's like comfort food for your ears. - Norah Jones",
  "Records are meant to be played loud and proud. - Foo Fighters",
  "Vinyl isn't nostalgic—it's timeless. - The Black Keys",
  "When I listen to vinyl, I feel connected to music history. - Bruno Mars",
  "The ritual of flipping the record is part of the joy. - Daft Punk",
  "Vinyl makes you appreciate music as a complete work of art, not just individual tracks. - Arcade Fire",
  "There's a physicality to vinyl that makes the music feel more real. - Florence Welch",
  "Records breathe life into music in a way that digital formats can't match. - Jack Johnson",
  "The sound of vinyl is like a warm hug from your favorite song. - Ed Sheeran",
  "Vinyl demands patience, and in return, it gives you something special. - Bon Iver",
  "Every record is a journey, and the pops and clicks are part of the adventure. - Tyler, The Creator",
  "Vinyl has a soul. You can hear it in every groove. - Erykah Badu",
  "There's something sacred about placing a needle on a record. - Leonard Cohen",
  "Vinyl is music you can hold in your hands. - David Bowie",
  "The imperfections of vinyl remind us that music is human. - Sufjan Stevens",
  "A record collection is a autobiography. - Nick Hornby",
  "Vinyl is the sound of analog warmth in a digital world. - Damon Albarn",
  "Records make you slow down and savor every moment of the music. - Joni Mitchell",
  "The weight of a record in your hands makes the music feel more substantial. - Tame Impala",
  "Vinyl is a meditation. It asks you to be present with the music. - Bon Iver",
  "There's no shuffle button on vinyl. You listen the way the artist intended. - Radiohead",
  "Records are living, breathing artifacts of sound. - My Morning Jacket",
  "Vinyl captures the emotion of a performance in ways digital can't. - Patti Smith",
  "The sound of a needle hitting the groove is pure anticipation. - Arctic Monkeys",
  "Vinyl is proof that some things are better analog. - LCD Soundsystem",
  "Records remind us that music is meant to be experienced, not just consumed. - Vampire Weekend",
  "There's a ceremony to vinyl. It makes every listening session special. - The National",
  "Vinyl is where music lives and breathes. - Tom Petty",
  "The beauty of vinyl is that it ages with you, and every scratch tells your story. - Fleet Foxes",
  "Records are time capsules of sound, capturing moments that digital files can never hold. - Wilco"
];
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
  'ai': {
    background: ['#FF6B6B', '#FF8E53', '#FF6B9D'],
    accent: '#FFD700',
    vinyl: ['#2F0147', '#1A0033'],
  },
  'youPick': {
    background: ['#9C27B0', '#E91E63', '#3F51B5'],
    accent: '#FFD700',
    vinyl: ['#2F0147', '#1A0033'],
  },
};

export default function NakedVinylQuotesScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const VINYL_SIZE = screenWidth * 0.85;
  const insets = useSafeAreaInsets();
  const [showHeader, setShowHeader] = useState(false);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isQuoteAtTop, setIsQuoteAtTop] = useState(true);
  const quoteOpacity = useRef(new Animated.Value(1)).current;
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const spinAnimation = useRef<Animated.CompositeAnimation | null>(null);
  
  const { selectedRecord, currentTheme, aiTheme: contextAiTheme, youPickTheme: contextYouPickTheme } = useRecord();
  
  // Get theme based on currentTheme from context
  const aiTheme = contextAiTheme || decadeThemes['ai'];
  const youPickTheme = contextYouPickTheme || decadeThemes['youPick'];
  const theme = currentTheme === 'ai' ? aiTheme : currentTheme === 'youPick' ? youPickTheme : decadeThemes[currentTheme as keyof typeof decadeThemes] || decadeThemes['1950s'];
  
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

  // Quote rotation every 3-5 minutes (randomized)
  useEffect(() => {
    const rotateQuote = () => {
      const randomDuration = 180000 + Math.random() * 120000;
      
      return setTimeout(() => {
        Animated.sequence([
          Animated.timing(quoteOpacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(quoteOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start();
        
        setTimeout(() => {
          setCurrentQuoteIndex((prev) => (prev + 1) % VINYL_QUOTES.length);
          setIsQuoteAtTop((prev) => !prev);
        }, 1000);
      }, randomDuration);
    };

    const timeoutId = rotateQuote();

    return () => clearTimeout(timeoutId);
  }, [currentQuoteIndex, quoteOpacity]);

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
          {isQuoteAtTop && (
            <Animated.View style={[styles.quoteContainer, styles.quoteTop, { opacity: quoteOpacity }]}>
              {(() => {
                const quoteText = VINYL_QUOTES[currentQuoteIndex];
                const dashIndex = quoteText.lastIndexOf(' - ');
                if (dashIndex > 0) {
                  const quote = quoteText.substring(0, dashIndex);
                  const author = quoteText.substring(dashIndex + 3);
                  return (
                    <>
                      <Text style={styles.quoteText}>{quote}</Text>
                      <Text style={styles.quoteAuthor}>— {author}</Text>
                    </>
                  );
                }
                return <Text style={styles.quoteText}>{quoteText}</Text>;
              })()}
            </Animated.View>
          )}
          
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
          
          {!isQuoteAtTop && (
            <Animated.View style={[styles.quoteContainer, styles.quoteBottom, { opacity: quoteOpacity }]}>
              {(() => {
                const quoteText = VINYL_QUOTES[currentQuoteIndex];
                const dashIndex = quoteText.lastIndexOf(' - ');
                if (dashIndex > 0) {
                  const quote = quoteText.substring(0, dashIndex);
                  const author = quoteText.substring(dashIndex + 3);
                  return (
                    <>
                      <Text style={styles.quoteText}>{quote}</Text>
                      <Text style={styles.quoteAuthor}>— {author}</Text>
                    </>
                  );
                }
                return <Text style={styles.quoteText}>{quoteText}</Text>;
              })()}
            </Animated.View>
          )}
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
    backgroundColor: 'transparent',
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
    paddingHorizontal: 20,
  },
  quoteContainer: {
    position: 'absolute' as const,
    left: 20,
    right: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  quoteTop: {
    top: '15%',
    maxHeight: '25%',
  },
  quoteBottom: {
    bottom: '15%',
    maxHeight: '25%',
  },
  quoteText: {
    fontSize: 22,
    lineHeight: 34,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    fontStyle: 'italic',
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  quoteAuthor: {
    fontSize: 18,
    lineHeight: 28,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
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
