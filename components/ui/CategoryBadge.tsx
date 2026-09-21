import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import {
  Utensils,
  Coffee,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  Zap,
} from '@tamagui/lucide-icons';
import { useAppStore } from '@/store/useAppStore';

export interface CategoryMeta {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  bg: string;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'food', label: 'Food', icon: Utensils, bg: '#ffedd5', color: '#ea580c' },
  { id: 'drinks', label: 'Drinks & Cafe', icon: Coffee, bg: '#fef3c7', color: '#d97706' },
  { id: 'transport', label: 'Transport', icon: Car, bg: '#e0f2fe', color: '#0284c7' },
  { id: 'groceries', label: 'Groceries', icon: ShoppingBag, bg: '#f3e8ff', color: '#9333ea' },
  { id: 'entertainment', label: 'Movies & Fun', icon: Film, bg: '#fce7f3', color: '#db2777' },
  { id: 'utilities', label: 'Bills & Utilities', icon: Zap, bg: '#ecfdf5', color: '#059669' },
  { id: 'other', label: 'General', icon: Receipt, bg: '#f1f5f9', color: '#475569' },
];

export const getCategoryMeta = (category?: string): CategoryMeta => {
  const cat = (category || '').toLowerCase();
  if (
    cat.includes('food') ||
    cat.includes('meal') ||
    cat.includes('dining') ||
    cat.includes('dinner') ||
    cat.includes('lunch')
  ) {
    return CATEGORIES[0]; // food
  }
  if (
    cat.includes('drink') ||
    cat.includes('coffee') ||
    cat.includes('bar') ||
    cat.includes('tea') ||
    cat.includes('cafe')
  ) {
    return CATEGORIES[1]; // drinks
  }
  if (
    cat.includes('transport') ||
    cat.includes('cab') ||
    cat.includes('uber') ||
    cat.includes('travel') ||
    cat.includes('trip') ||
    cat.includes('fuel') ||
    cat.includes('flight')
  ) {
    return CATEGORIES[2]; // transport
  }
  if (
    cat.includes('shopping') ||
    cat.includes('grocery') ||
    cat.includes('mart') ||
    cat.includes('store')
  ) {
    return CATEGORIES[3]; // groceries
  }
  if (
    cat.includes('movie') ||
    cat.includes('film') ||
    cat.includes('show') ||
    cat.includes('entertainment')
  ) {
    return CATEGORIES[4]; // entertainment
  }
  if (
    cat.includes('bill') ||
    cat.includes('utility') ||
    cat.includes('rent') ||
    cat.includes('electricity') ||
    cat.includes('wifi')
  ) {
    return CATEGORIES[5]; // utilities
  }
  return CATEGORIES[6]; // general / other
};

interface CategoryBadgeProps {
  category?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  style?: ViewStyle;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  showLabel = false,
  style,
}) => {
  const isDark = useAppStore((state) => state.isDark);
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;

  const dimensions = {
    sm: { box: 32, icon: 16, radius: 10, fontSize: 10 },
    md: { box: 44, icon: 20, radius: 14, fontSize: 12 },
    lg: { box: 52, icon: 24, radius: 18, fontSize: 13 },
  }[size];

  return (
    <XStack alignItems="center" gap="$2" style={style}>
      <YStack
        width={dimensions.box}
        height={dimensions.box}
        borderRadius={dimensions.radius}
        backgroundColor={meta.bg}
        alignItems="center"
        justifyContent="center"
      >
        <Icon size={dimensions.icon} color={meta.color} />
      </YStack>
      {showLabel && (
        <XStack
          backgroundColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
          px="$2"
          py="$0.5"
          borderRadius="$3"
        >
          <Text
            fontSize={dimensions.fontSize}
            fontWeight="700"
            color="$gray10"
            textTransform="capitalize"
          >
            {category || meta.label}
          </Text>
        </XStack>
      )}
    </XStack>
  );
};
