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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';

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
      thumbnail: 'https://via.placeholder.com/300x200',
      likes: 1240,
      type: 'adventure',
    },
    {
      id: 2,
      location: 'Kathmandu',
      country: 'Nepal',
      days: 5,
      cost: 25000,
      thumbnail: 'https://via.placeholder.com/300x200',
      likes: 890,
      type: 'culture',
    },
    {
      id: 3,
      location: 'Chitwan',
      country: 'Nepal',
      days: 2,
      cost: 8500,
      thumbnail: 'https://via.placeholder.com/300x200',
      likes: 567,
      type: 'nature',
    },
    {
      id: 4,
      location: 'Lumbini',
      country: 'Nepal',
      days: 1,
      cost: 5000,
      thumbnail: 'https://via.placeholder.com/300x200',
      likes: 432,
      type: 'culture',
    },
    {
      id: 5,
      location: 'Mustang',
      country: 'Nepal',
      days: 7,
      cost: 45000,
      thumbnail: 'https://via.placeholder.com/300x200',
      likes: 2100,
      type: 'adventure',
    },
    {
      id: 6,
      location: 'Nagarkot',
      country: 'Nepal',
      days: 2,
      cost: 7500,
      thumbnail: 'https://via.placeholder.com/300x200',
      likes: 345,
      type: 'nature',
    },
  ];

  const renderTripCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.tripCard, { backgroundColor: colors.card }, shadows.md]}
      onPress={() => navigation.navigate('PostDetails', { tripId: item.id })}
    >
      <View style={styles.tripThumbnail}>
        <View style={[styles.placeholderThumb, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name="image" size={32} color={colors.textLight} />
        </View>
        <View style={[styles.likesBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <Ionicons name="heart" size={12} color="#FF4757" />
          <Text style={styles.likesText}>{item.likes}</Text>
        </View>
      </View>

      <View style={styles.tripInfo}>
        <Text style={[styles.tripLocation, { color: colors.text }]} numberOfLines={1}>
          {item.location}
        </Text>
        <Text style={[styles.tripCountry, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.country}
        </Text>

        <View style={styles.tripMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.text }]}>{item.days}d</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={14} color={colors.accent} />
            <Text style={[styles.metaText, { color: colors.text }]}>
              NPR {item.cost.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Explore</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }, shadows.sm]}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search destinations..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: showFilters ? colors.primary : colors.card },
            shadows.sm,
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name="options"
            size={20}
            color={showFilters ? '#FFFFFF' : colors.text}
          />
        </TouchableOpacity>
      </View>

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
                borderColor:
                  selectedFilter === filter.id ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Ionicons
              name={filter.icon}
              size={16}
              color={selectedFilter === filter.id ? '#FFFFFF' : colors.textLight}
            />
            <Text
              style={[
                styles.filterText,
                {
                  color: selectedFilter === filter.id ? '#FFFFFF' : colors.text,
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
        <View style={[styles.filtersPanel, { backgroundColor: colors.card }, shadows.md]}>
          <Text style={[styles.filterTitle, { color: colors.text }]}>Budget Range</Text>
          <View style={styles.rangeDisplay}>
            <Text style={[styles.rangeText, { color: colors.textSecondary }]}>
              NPR {budgetRange.min.toLocaleString()}
            </Text>
            <Text style={[styles.rangeText, { color: colors.textSecondary }]}>-</Text>
            <Text style={[styles.rangeText, { color: colors.textSecondary }]}>
              NPR {budgetRange.max.toLocaleString()}
            </Text>
          </View>

          <Text style={[styles.filterTitle, { color: colors.text, marginTop: SPACING.lg }]}>
            Trip Duration
          </Text>
          <View style={styles.rangeDisplay}>
            <Text style={[styles.rangeText, { color: colors.textSecondary }]}>
              {durationRange.min} day{durationRange.min > 1 ? 's' : ''}
            </Text>
            <Text style={[styles.rangeText, { color: colors.textSecondary }]}>-</Text>
            <Text style={[styles.rangeText, { color: colors.textSecondary }]}>
              {durationRange.max} days
            </Text>
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

            <TouchableOpacity style={styles.applyButton}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.applyGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.applyText}>Apply Filters</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
          {trips.length} trips found
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Ionicons name="swap-vertical" size={16} color={colors.primary} />
          <Text style={[styles.sortText, { color: colors.primary }]}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Trips Grid */}
      <FlatList
        data={trips}
        renderItem={renderTripCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    paddingVertical: SPACING.xs,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersScroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  filtersPanel: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  filterTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.sm,
  },
  rangeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeText: {
    fontSize: FONT_SIZES.md,
  },
  filterActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  resetButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  resetText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  applyButton: {
    flex: 1,
  },
  applyGradient: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  resultCount: {
    fontSize: FONT_SIZES.sm,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sortText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  gridContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  tripCard: {
    width: '48%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  tripThumbnail: {
    position: 'relative',
  },
  placeholderThumb: {
    width: '100%',
    aspectRatio: 3 / 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likesBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  likesText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  tripInfo: {
    padding: SPACING.md,
  },
  tripLocation: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: 2,
  },
  tripCountry: {
    fontSize: FONT_SIZES.xs,
    marginBottom: SPACING.sm,
  },
  tripMeta: {
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FONT_SIZES.xs,
  },
});

export default ExploreScreen;
