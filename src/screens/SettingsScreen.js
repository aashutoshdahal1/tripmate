import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { colors, shadows, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT</Text>
          
          <View style={[styles.settingsCard, { backgroundColor: colors.card }, shadows.sm]}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name="person-outline" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.settingText, { color: colors.text }]}>Edit Profile</Text>
                  <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                    Name, bio, avatar
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accentAlpha }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent} />
                </View>
                <View>
                  <Text style={[styles.settingText, { color: colors.text }]}>Change Password</Text>
                  <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                    Update your password
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>
          
          <View style={[styles.settingsCard, { backgroundColor: colors.card }, shadows.sm]}>
            <TouchableOpacity style={styles.settingItem} onPress={toggleTheme}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: isDark ? '#FFD43B20' : '#2679FF20' }]}>
                  <Ionicons 
                    name={isDark ? 'moon' : 'sunny'} 
                    size={20} 
                    color={isDark ? '#FFD43B' : '#2679FF'} 
                  />
                </View>
                <View>
                  <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
                  <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                    {isDark ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.toggle,
                  { backgroundColor: isDark ? colors.primary : colors.border },
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: '#FFFFFF',
                      transform: [{ translateX: isDark ? 18 : 0 }],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#FF6B6B20' }]}>
                  <Ionicons name="notifications-outline" size={20} color="#FF6B6B" />
                </View>
                <View>
                  <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
                  <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                    Push, email, SMS
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#9775FA20' }]}>
                  <Ionicons name="language-outline" size={20} color="#9775FA" />
                </View>
                <View>
                  <Text style={[styles.settingText, { color: colors.text }]}>Language</Text>
                  <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                    English
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PRIVACY & SECURITY</Text>
          
          <View style={[styles.settingsCard, { backgroundColor: colors.card }, shadows.sm]}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#00C89620' }]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#00C896" />
                </View>
                <View>
                  <Text style={[styles.settingText, { color: colors.text }]}>Privacy</Text>
                  <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                    Account privacy settings
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#FF922B20' }]}>
                  <Ionicons name="eye-off-outline" size={20} color="#FF922B" />
                </View>
                <View>
                  <Text style={[styles.settingText, { color: colors.text }]}>Blocked Users</Text>
                  <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                    Manage blocked accounts
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ABOUT</Text>
          
          <View style={[styles.settingsCard, { backgroundColor: colors.card }, shadows.sm]}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.settingText, { color: colors.text }]}>Help & Support</Text>
                  <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                    FAQs, contact us
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.settingText, { color: colors.text }]}>Terms & Policies</Text>
                  <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                    Legal information
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primaryAlpha }]}>
                  <Ionicons name="code-slash-outline" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.settingText, { color: colors.text }]}>App Version</Text>
                  <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                    1.0.0
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: colors.card }, shadows.sm]}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                      await logout();
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'GetStarted' }],
                      });
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF4757" />
            <Text style={[styles.logoutText, { color: '#FF4757' }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  settingsCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  settingSubtext: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: SPACING.lg + 40 + SPACING.md,
  },
  toggle: {
    width: 42,
    height: 24,
    borderRadius: 12,
    padding: 3,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});

export default SettingsScreen;
