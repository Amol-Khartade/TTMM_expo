import React from 'react';
import { ViewStyle } from 'react-native';
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
  lightBg: string;
  darkBg: string;
  lightColor: string;
  darkColor: string;
  bg: string;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'food',
    label: 'Food',
    icon: Utensils,
    lightBg: 'rgba(249, 115, 22, 0.12)',
    darkBg: 'rgba(249, 115, 22, 0.20)',
    lightColor: '#ea580c',
    darkColor: '#fb923c',
    bg: 'rgba(249, 115, 22, 0.12)',
    color: '#ea580c',
  },
  {
    id: 'drinks',
    label: 'Drinks & Cafe',
    icon: Coffee,
    lightBg: 'rgba(245, 158, 11, 0.12)',
    darkBg: 'rgba(245, 158, 11, 0.20)',
    lightColor: '#d97706',
    darkColor: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.12)',
    color: '#d97706',
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: Car,
    lightBg: 'rgba(2, 132, 199, 0.12)',
    darkBg: 'rgba(56, 189, 248, 0.20)',
    lightColor: '#0284c7',
    darkColor: '#38bdf8',
    bg: 'rgba(2, 132, 199, 0.12)',
    color: '#0284c7',
  },
  {
    id: 'groceries',
    label: 'Groceries',
    icon: ShoppingBag,
    lightBg: 'rgba(147, 51, 234, 0.12)',
    darkBg: 'rgba(168, 85, 247, 0.20)',
    lightColor: '#9333ea',
    darkColor: '#c084fc',
    bg: 'rgba(147, 51, 234, 0.12)',
    color: '#9333ea',
  },
  {
    id: 'entertainment',
    label: 'Movies & Fun',
    icon: Film,
    lightBg: 'rgba(225, 29, 72, 0.12)',
    darkBg: 'rgba(244, 63, 94, 0.20)',
    lightColor: '#e11d48',
    darkColor: '#fb7185',
    bg: 'rgba(225, 29, 72, 0.12)',
    color: '#e11d48',
  },
  {
    id: 'utilities',
    label: 'Bills & Utilities',
    icon: Zap,
    lightBg: 'rgba(16, 185, 129, 0.12)',
    darkBg: 'rgba(52, 211, 153, 0.20)',
    lightColor: '#059669',
    darkColor: '#34d399',
    bg: 'rgba(16, 185, 129, 0.12)',
    color: '#059669',
  },
  {
    id: 'other',
    label: 'General',
    icon: Receipt,
    lightBg: 'rgba(100, 116, 139, 0.12)',
    darkBg: 'rgba(148, 163, 184, 0.18)',
    lightColor: '#475569',
    darkColor: '#94a3b8',
    bg: 'rgba(100, 116, 139, 0.12)',
    color: '#475569',
  },
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

  const bg = isDark ? meta.darkBg : meta.lightBg;
  const iconColor = isDark ? meta.darkColor : meta.lightColor;
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';

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
        backgroundColor={bg}
        borderWidth={1}
        borderColor={borderColor}
        alignItems="center"
        justifyContent="center"
      >
        <Icon size={dimensions.icon} color={iconColor} />
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
