import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';

const { width } = Dimensions.get('window');

const ExploreScreen = () => {
  const navigation = useNavigation();
  const { colors, shadows } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [budgetRange, setBudgetRange] = useState({ min: 0, max: 50000 });
  const [durationRange, setDurationRange] = useState({ min: 1, max: 10 });
  const [showFilters, setShowFilters] = useState(false);

  const filters = [
    { id: 'all', label: 'All', icon: 'grid' },
    { id: 'adventure', label: 'Adventure', icon: 'flame' },
    { id: 'nature', label: 'Nature', icon: 'leaf' },
    { id: 'culture', label: 'Culture', icon: 'library' },
    { id: 'food', label: 'Food', icon: 'restaurant' },
  ];

  const sortOptions = [
    { id: 'popular', label: 'Most Popular' },
    { id: 'recent', label: 'Most Recent' },
    { id: 'budget-low', label: 'Budget: Low to High' },
    { id: 'budget-high', label: 'Budget: High to Low' },
  ];

  const trips = [
    {
      id: 1,
      location: 'Pokhara',
      country: 'Nepal',
      days: 3,
      cost: 12500,
      thumbnail: 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg',
      likes: 1240,
      type: 'adventure',
    },
    {
      id: 2,
      location: 'Kathmandu',
      country: 'Nepal',
      days: 5,
      cost: 25000,
      thumbnail: 'https://images.pexels.com/photos/1562/italian-landscape-mountains-nature.jpg',
      likes: 890,
      type: 'culture',
    },
    {
      id: 3,
      location: 'Chitwan',
      country: 'Nepal',
      days: 2,
      cost: 8500,
      thumbnail: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg',
      likes: 567,
      type: 'nature',
    },
    {
      id: 4,
      location: 'Lumbini',
      country: 'Nepal',
      days: 1,
      cost: 5000,
      thumbnail: 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg',
      likes: 432,
      type: 'culture',
    },
    {
      id: 5,
      location: 'Mustang',
      country: 'Nepal',
      days: 7,
      cost: 45000,
      thumbnail: 'https://images.pexels.com/photos/1562/italian-landscape-mountains-nature.jpg',
      likes: 2100,
      type: 'adventure',
    },
    {
      id: 6,
      location: 'Nagarkot',
      country: 'Nepal',
      days: 2,
      cost: 7500,
      thumbnail: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg',
      likes: 345,
      type: 'nature',
    },
  ];

  const renderTripCard = ({ item }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => navigation.navigate('PostDetails', { tripId: item.id })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.tripImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.tripGradient}
      >
        <View style={styles.tripContent}>
          <Text style={styles.tripLocation} numberOfLines={1}>
            {item.location}
          </Text>
          <Text style={styles.tripCountry} numberOfLines={1}>
            {item.country}
          </Text>
          <View style={styles.tripFooter}>
            <View style={styles.tripMeta}>
              <Ionicons name="calendar-outline" size={12} color="#FFFFFF" />
              <Text style={styles.metaText}>{item.days}d</Text>
            </View>
            <View style={styles.tripLikes}>
              <Ionicons name="heart" size={12} color="#FF3B30" />
              <Text style={styles.likesText}>{item.likes}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Search */}
      <View style={[styles.header, { backgroundColor: colors.card }, shadows.sm]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Explore</Text>
          <TouchableOpacity
            style={[
              styles.filterIconButton,
              { backgroundColor: showFilters ? colors.primary : colors.backgroundAlt },
            ]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={showFilters ? '#FFFFFF' : colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Where do you want to go?"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedFilter === filter.id ? colors.primary : colors.card,
                },
                shadows.sm,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Ionicons
                name={filter.icon}
                size={18}
                color={selectedFilter === filter.id ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterText,
                  {
                    color: selectedFilter === filter.id ? '#FFFFFF' : colors.text,
                    fontWeight: selectedFilter === filter.id ? FONT_WEIGHTS.semibold : FONT_WEIGHTS.regular,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <View style={[styles.filtersPanel, { backgroundColor: colors.card }, shadows.sm]}>
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Budget Range</Text>
              <View style={styles.rangeDisplay}>
                <View style={[styles.rangeBox, { backgroundColor: colors.backgroundAlt }]}>
                  <Text style={[styles.rangeLabel, { color: colors.textSecondary }]}>Min</Text>
                  <Text style={[styles.rangeValue, { color: colors.text }]}>
                    NPR {budgetRange.min.toLocaleString()}
                  </Text>
                </View>
                <Text style={[styles.rangeSeparator, { color: colors.textSecondary }]}>-</Text>
                <View style={[styles.rangeBox, { backgroundColor: colors.backgroundAlt }]}>
                  <Text style={[styles.rangeLabel, { color: colors.textSecondary }]}>Max</Text>
                  <Text style={[styles.rangeValue, { color: colors.text }]}>
                    NPR {budgetRange.max.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Duration</Text>
              <View style={styles.rangeDisplay}>
                <View style={[styles.rangeBox, { backgroundColor: colors.backgroundAlt }]}>
                  <Text style={[styles.rangeLabel, { color: colors.textSecondary }]}>Min</Text>
                  <Text style={[styles.rangeValue, { color: colors.text }]}>
                    {durationRange.min} day{durationRange.min > 1 ? 's' : ''}
                  </Text>
                </View>
                <Text style={[styles.rangeSeparator, { color: colors.textSecondary }]}>-</Text>
                <View style={[styles.rangeBox, { backgroundColor: colors.backgroundAlt }]}>
                  <Text style={[styles.rangeLabel, { color: colors.textSecondary }]}>Max</Text>
                  <Text style={[styles.rangeValue, { color: colors.text }]}>
                    {durationRange.max} days
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={[styles.resetButton, { backgroundColor: colors.backgroundAlt }]}
                onPress={() => {
                  setBudgetRange({ min: 0, max: 50000 });
                  setDurationRange({ min: 1, max: 10 });
                }}
              >
                <Text style={[styles.resetText, { color: colors.text }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.applyButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultCount, { color: colors.text }]}>
            {trips.length} <Text style={{ color: colors.textSecondary }}>destinations</Text>
          </Text>
        </View>

        {/* Trips Grid */}
        <View style={styles.tripsGrid}>
          {trips.map((item) => (
            <View key={item.id}>
              {renderTripCard({ item })}
            </View>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl + 4,
    fontWeight: FONT_WEIGHTS.bold,
  },
  filterIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
  },
  filtersScroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.full,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
  },
  filtersPanel: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterSectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.md,
  },
  rangeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  rangeBox: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  rangeLabel: {
    fontSize: FONT_SIZES.xs,
    marginBottom: 4,
  },
  rangeValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  rangeSeparator: {
    fontSize: FONT_SIZES.lg,
  },
  filterActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  resetButton: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  resetText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  applyButton: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  resultsHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  resultCount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  tripsGrid: {
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tripCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    height: 240,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  tripImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  tripGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  tripContent: {
    padding: SPACING.md,
  },
  tripLocation: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: 2,
  },
  tripCountry: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FONT_SIZES.xs,
    marginBottom: SPACING.sm,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
  },
  tripLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  likesText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});

export default ExploreScreen;
