import React from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import { XStack, Text } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { CATEGORIES } from '@/components/ui/CategoryBadge';
import { useAppStore } from '@/store/useAppStore';

export interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  style?: ViewStyle;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  style,
}) => {
  const isDark = useAppStore((state) => state.isDark);

  return (
    <XStack gap="$2" flexWrap="wrap" style={style}>
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const CatIcon = cat.icon;

        return (
          <Pressable
            key={cat.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`Select ${cat.label} category`}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onSelectCategory(cat.id);
            }}
            style={[
              styles.categoryPill,
              isSelected
                ? { backgroundColor: cat.bg, borderColor: cat.color }
                : isDark
                ? styles.categoryPillInactiveDark
                : styles.categoryPillInactiveLight,
            ]}
          >
            <CatIcon size={14} color={isSelected ? cat.color : '#94a3b8'} />
            <Text
              fontSize={12}
              fontWeight={isSelected ? '800' : '600'}
              color={isSelected ? cat.color : '$gray10'}
            >
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
    </XStack>
  );
};

const styles = StyleSheet.create({
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 36,
  },
  categoryPillInactiveLight: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderColor: 'rgba(0,0,0,0.06)',
  },
  categoryPillInactiveDark: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
