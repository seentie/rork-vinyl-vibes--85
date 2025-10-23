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
              <Text style={styles.instructionsNote}>We know record players and sound systems aren't super portable or easy to afford, so we made a virtual version that's both - and just plain fun! Like our first Fisher-Price record player!</Text>
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
              <Text style={styles.privacySubheader}>(Last Updated: January 2025)</Text>
              {"\n\n"}
              <Text style={styles.privacySubheader}>Overview</Text>
              {"\n\n"}
              OLD SKOOL APPS ("we," "our," or "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our mobile application.
              {"\n\n"}
              <Text style={styles.privacySubheader}>Information We Collect</Text>
              {"\n\n"}
              <Text style={styles.privacySubheader}>Information You Provide</Text>
              {"\n\n"}
              • Account information (name, email address){"\n"}
              • Profile information you choose to share{"\n"}
              • Content you create or upload{"\n"}
              • Communications with us
              {"\n\n"}
              <Text style={styles.privacySubheader}>Information Automatically Collected</Text>
              {"\n\n"}
              • Device information (device type, operating system){"\n"}
              • Usage data (how you interact with the app){"\n"}
              • Log data (app crashes, performance metrics){"\n"}
              • Location data (if you grant permission)
              {"\n\n"}
              <Text style={styles.privacySubheader}>How We Use Your Information</Text>
              {"\n\n"}
              We use your information to:{"\n\n"}
              • Provide and improve our app services{"\n"}
              • Create and maintain your account{"\n"}
              • Send important updates and notifications{"\n"}
              • Respond to your questions and support requests{"\n"}
              • Analyze app usage to improve user experience{"\n"}
              • Ensure app security and prevent fraud
              {"\n\n"}
              <Text style={styles.privacySubheader}>Information Sharing</Text>
              {"\n\n"}
              We do not sell your personal information. We may share your information only in these situations:{"\n\n"}
              • With your consent - When you explicitly agree{"\n"}
              • Service providers - Third parties who help us operate the app{"\n"}
              • Legal requirements - When required by law or to protect rights and safety{"\n"}
              • Business transfers - If our company is sold or merged
              {"\n\n"}
              <Text style={styles.privacySubheader}>Data Security</Text>
              {"\n\n"}
              We implement appropriate security measures to protect your information, including:{"\n\n"}
              • Encryption of sensitive data{"\n"}
              • Secure data transmission{"\n"}
              • Regular security assessments{"\n"}
              • Limited access to personal information
              {"\n\n"}
              <Text style={styles.privacySubheader}>Your Rights</Text>
              {"\n\n"}
              You have the right to:{"\n\n"}
              • Access your personal information{"\n"}
              • Correct inaccurate information{"\n"}
              • Delete your account and data{"\n"}
              • Opt out of marketing communications{"\n"}
              • Request data portability (where applicable){"\n\n"}
              To exercise these rights, contact us at {CONTACT_EMAIL}.
              {"\n\n"}
              <Text style={styles.privacySubheader}>Children's Privacy</Text>
              {"\n\n"}
              Our app is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we discover we have collected such information, we will delete it promptly.
              {"\n\n"}
              <Text style={styles.privacySubheader}>Third-Party Services</Text>
              {"\n\n"}
              Our app may contain links to third-party services or integrate with other platforms. This privacy policy does not apply to those services. Please review their privacy policies separately.
              {"\n\n"}
              <Text style={styles.privacySubheader}>Changes to This Policy</Text>
              {"\n\n"}
              We may update this Privacy Policy from time to time. We will notify you of significant changes by:{"\n\n"}
              • Posting the updated policy in the app{"\n"}
              • Sending you an email notification{"\n"}
              • Displaying a notice when you next open the app
              {"\n\n"}
              <Text style={styles.privacySubheader}>Contact Us</Text>
              {"\n\n"}
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:{"\n\n"}
              Email: {CONTACT_EMAIL}{"\n"}
              Address: {CONTACT_ADDRESS}{"\n"}
              Phone: {CONTACT_PHONE}{"\n\n"}
              App version: {APP_VERSION}
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