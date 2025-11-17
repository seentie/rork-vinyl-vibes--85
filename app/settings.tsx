import React from 'react';
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
import { Mail, Phone, MapPin, Shield, Info, HelpCircle } from 'lucide-react-native';

const APP_VERSION = '1.0';
const CONTACT_EMAIL = 'sarah@oldskoolapps.com';
const CONTACT_PHONE = '(646)-540-9602';
const CONTACT_ADDRESS = '2114 N Flamingo Road #867, Pembroke Pines, FL 33028';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

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
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* How to Use Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={24} color="#FFFFFF" />
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
              • <Text style={styles.instructionsBold}>Two vinyl views:</Text> Switch between the classic turntable view and the immersive "Now Playing" view with glowing album art
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Stylus view:</Text> Tap the stylus icon to see a close-up view of the tonearm and needle on the spinning vinyl - just like watching a real record player in action
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Two speeds:</Text> Toggle between 33 RPM and 45 RPM to match your listening mood
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Customizable albums, artists, and songs:</Text> Edit album names, artist names, add cover photos, and create custom song lists for each record in your collection
              {"\n\n"}
              • <Text style={styles.instructionsBold}>Visual experience:</Text> Watch the vinyl spin, the tonearm move, and enjoy the authentic turntable interface
              {"\n\n"}
              <Text style={styles.instructionsNote}>We know record players aren't exactly portable, but we love vinyl and wanted to make the visual as portable as a Walkman and as affordable as the 80s too. With alternate views and Now Playing too, we hope the nostalgia factor is well played.</Text>
              {"\n\n"}
              <Text style={styles.instructionsNote}>Note: This app provides the visual vinyl experience - your actual music continues playing from your preferred music streaming service.</Text>
            </Text>
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>App Information</Text>
          </View>
          <View style={styles.card}>
            <TouchableOpacity style={styles.infoItem} onPress={showAppInfo}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>{APP_VERSION}</Text>
            </TouchableOpacity>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Developer</Text>
              <Text style={styles.infoValue}>OLD SKOOL APPS</Text>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Mail size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Contact Us</Text>
          </View>
          <View style={styles.card}>
            <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
              <Mail size={20} color="#FF6B6B" />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{CONTACT_EMAIL}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
              <Phone size={20} color="#FF6B6B" />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{CONTACT_PHONE}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem} onPress={handleAddressPress}>
              <MapPin size={20} color="#FF6B6B" />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>{CONTACT_ADDRESS}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Policy Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Privacy Policy</Text>
          </View>
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
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500' as const,
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600' as const,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500' as const,
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600' as const,
    marginTop: 2,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  privacyHeader: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#333',
  },
  privacySubheader: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
  },
  privacyNote: {
    fontStyle: 'italic',
    color: '#666',
    fontSize: 13,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  instructionsHeader: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FF6B6B',
  },
  instructionsSubheader: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
  },
  instructionsBold: {
    fontWeight: '600' as const,
    color: '#FF6B6B',
  },
  instructionsNote: {
    fontStyle: 'italic',
    color: '#666',
    fontSize: 13,
  },
});