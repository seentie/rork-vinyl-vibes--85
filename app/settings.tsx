import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Phone, MapPin, Shield, Info, HelpCircle, ChevronRight, ChevronDown, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const APP_VERSION = '1.0';
const CONTACT_EMAIL = 'sarah@oldskoolapps.com';
const CONTACT_PHONE = '(646)-540-9602';
const CONTACT_ADDRESS = '2114 N Flamingo Road #867, Pembroke Pines, FL 33028';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isPrivacyExpanded, setIsPrivacyExpanded] = useState(false);

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${CONTACT_EMAIL}`);
  };

  const handlePhonePress = () => {
    Linking.openURL(`tel:${CONTACT_PHONE}`);
  };

  const handleAddressPress = () => {
    const encodedAddress = encodeURIComponent(CONTACT_ADDRESS);
    Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
  };

  const showAppInfo = () => {
    Alert.alert(
      'App Information',
      `OLD SKOOL APPS Vinyl Player\nVersion ${APP_VERSION}\n\nA vintage vinyl record player experience for your mobile device.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <LinearGradient
      colors={['#FF6B6B', '#FF8E53', '#FF6B9D']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonContent}>
            <ArrowLeft size={22} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </View>
        </TouchableOpacity>
        {/* How to Use Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <HelpCircle size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.sectionTitle}>How to Use</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.instructionsText}>
              <Text style={styles.instructionsHeader}>Welcome to Vinyl Player!</Text>
              {"\n\n"}
              This app is a <Text style={styles.instructionsBold}>turntable simulator experience</Text> designed to enhance your listening experience while you play your own music.
              {"\n\n"}
              <Text style={styles.instructionsSubheader}>How it works:</Text>
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Start your music:</Text> Play your favorite songs from Spotify, Apple Music, or any music app on your device
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Open Vinyl Player:</Text> Launch this app while your music is playing in the background
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Add your albums:</Text> Create a collection by adding album covers and song names
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Choose your palette vibes:</Text> Select from decade-themed color schemes, AI-generated themes based on your album, or create your own custom colors with "You Pick"
              {"\n\n"}
              <Text style={styles.instructionsSubheader}>Available Views:</Text>
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Classic Turntable:</Text> The main view featuring the full vinyl record player with spinning vinyl, tonearm, and all controls
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Now Playing:</Text> An immersive view showcasing your album art with a glowing effect and the vinyl record prominently displayed
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Stylus View:</Text> A close-up cinematic view of the tonearm and needle on the spinning vinyl - watch the stylus ride the grooves just like a real record player
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Naked Vinyl:</Text> A minimalist view that puts the spinning record center stage without any player controls - pure vinyl beauty
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Naked Vinyl + Vinyl Quotes:</Text> The same beautiful spinning vinyl with inspiring quotes about vinyl from legendary artists that rotate every 3-5 minutes - 52 different quotes to discover
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Screensaver:</Text> A mesmerizing animated view perfect for letting your music play while enjoying visual ambience
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Collection:</Text> Browse and manage your entire album collection with up to 85 albums, complete with custom covers and song lists
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Two speeds:</Text> Toggle between 33 RPM and 45 RPM to match your listening mood
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Customizable albums, artists, and songs:</Text> Edit album names, artist names, add cover photos, and create custom song lists for each record in your collection
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Visual experience:</Text> Watch the vinyl spin, the tonearm move, and enjoy the authentic turntable interface
              {"\n\n"}
              <Text style={styles.instructionsNote}>We know record players aren't exactly portable, but we love vinyl and wanted to make the visual as portable as a Walkman and as affordable as the 80s too. So spin up your favorite tracks and let the good vibes roll.</Text>
              {"\n\n"}
              <Text style={styles.instructionsNote}>Note: This app provides the visual vinyl experience - your actual music continues playing from your preferred music streaming service.</Text>
            </Text>
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Info size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.sectionTitle}>App Information</Text>
          </View>
          <View style={styles.card}>
            <TouchableOpacity style={styles.infoItem} onPress={showAppInfo}>
              <View>
                <Text style={styles.infoLabel}>Version</Text>
                <Text style={styles.infoValue}>{APP_VERSION}</Text>
              </View>
              <ChevronRight size={20} color="#CCCCCC" />
            </TouchableOpacity>
            <View style={styles.infoItem}>
              <View>
                <Text style={styles.infoLabel}>Developer</Text>
                <Text style={styles.infoValue}>OLD SKOOL APPS</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Mail size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.sectionTitle}>Contact Us</Text>
          </View>
          <View style={styles.card}>
            <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
              <View style={styles.iconContainer}>
                <Mail size={18} color="#FF6B6B" />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{CONTACT_EMAIL}</Text>
              </View>
              <ChevronRight size={18} color="#CCCCCC" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
              <View style={styles.iconContainer}>
                <Phone size={18} color="#FF6B6B" />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{CONTACT_PHONE}</Text>
              </View>
              <ChevronRight size={18} color="#CCCCCC" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem} onPress={handleAddressPress}>
              <View style={styles.iconContainer}>
                <MapPin size={18} color="#FF6B6B" />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>{CONTACT_ADDRESS}</Text>
              </View>
              <ChevronRight size={18} color="#CCCCCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Policy Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.collapsibleHeader}
            onPress={() => setIsPrivacyExpanded(!isPrivacyExpanded)}
            activeOpacity={0.8}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.iconCircle}>
                <Shield size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.sectionTitle}>Privacy Policy</Text>
            </View>
            {isPrivacyExpanded ? (
              <ChevronDown size={24} color="#FFFFFF" />
            ) : (
              <ChevronRight size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          {isPrivacyExpanded && (
            <View style={styles.card}>
              <Text style={styles.privacyText}>
                <Text style={styles.privacyHeader}>Privacy Policy</Text>
                {"\n\n"}
                <Text style={styles.privacySubheader}>Updated: November 2025</Text>
                {"\n\n"}
                <Text style={styles.privacySubheader}>The Short Version</Text>
                {"\n\n"}
                We don't track you. We don't collect your data. We don't sell anything to anyone. You do you.
                {"\n\n"}
                <Text style={styles.privacySubheader}>The Slightly Longer Version</Text>
                {"\n\n"}
                Old Skool Apps believes your business is your business. Here's what that means:
                {"\n\n"}
                <Text style={styles.privacySubheader}>What We Don't Collect</Text>
                {"\n\n"}
                • Personal information{"\n"}
                • Usage data{"\n"}
                • Location data{"\n"}
                • Device information{"\n"}
                • Cookies or tracking pixels{"\n"}
                • Analytics{"\n"}
                • Literally anything about you
                {"\n\n"}
                <Text style={styles.privacySubheader}>What We Don't Do</Text>
                {"\n\n"}
                • Track your activity{"\n"}
                • Sell your data{"\n"}
                • Share information with third parties{"\n"}
                • Send you marketing emails (unless you explicitly sign up){"\n"}
                • Connect to social media{"\n"}
                • Use creepy ad networks
                {"\n\n"}
                <Text style={styles.privacySubheader}>What Happens on Your Device Stays on Your Device</Text>
                {"\n\n"}
                All our apps store data locally on your device. Your journals, lists, birthdays, contacts, preferences—everything lives on your phone or tablet. Not our servers. Not the cloud (unless you choose to back up via your device's built-in backup features).
                {"\n\n"}
                If you delete the app, your data goes with it. We never see it in the first place.
                {"\n\n"}
                <Text style={styles.privacySubheader}>Third-Party Services</Text>
                {"\n\n"}
                Some apps may use your device's built-in features (like photo library access or camera) but only when you give permission, and only to make the app work. We don't send that data anywhere.
                {"\n\n"}
                <Text style={styles.privacySubheader}>Changes to This Policy</Text>
                {"\n\n"}
                If we ever change this policy (spoiler: we probably won't), we'll update this page and the date at the top. But our philosophy stays the same: your data is yours.
                {"\n\n"}
                <Text style={styles.privacySubheader}>Questions?</Text>
                {"\n\n"}
                If you have questions about this Privacy Policy or our privacy practices, please contact us at:{"\n\n"}
                Email: {CONTACT_EMAIL}{"\n"}
                Address: {CONTACT_ADDRESS}{"\n"}
                Phone: {CONTACT_PHONE}
                {"\n\n"}
                We're real humans who do respond.
                {"\n\n"}
                <Text style={styles.privacyNote}>We're old skool about apps, and privacy too. You do you.</Text>
                {"\n\n"}
                <Text style={styles.privacySubheader}>Old Skool Apps</Text>
                {"\n"}
                <Text style={styles.privacyNote}>Where nostalgia meets function, and your privacy is actually yours.</Text>
              </Text>
            </View>
          )}
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
  contentContainer: {
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
    flex: 1,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingVertical: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 17,
    color: '#333',
    fontWeight: '600' as const,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 12,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500' as const,
    marginBottom: 3,
  },
  contactValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600' as const,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
  },
  privacyHeader: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#333',
  },
  privacySubheader: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FF6B6B',
  },
  privacyNote: {
    fontStyle: 'italic',
    color: '#888',
    fontSize: 13,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#444',
  },
  instructionsHeader: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FF6B6B',
  },
  instructionsSubheader: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FF6B6B',
  },
  instructionsBold: {
    fontWeight: '700' as const,
    color: '#333',
  },
  instructionsNote: {
    fontStyle: 'italic',
    color: '#888',
    fontSize: 13,
  },
});