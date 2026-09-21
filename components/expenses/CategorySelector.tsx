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
        const activeBg = isDark ? cat.darkBg : cat.lightBg;
        const activeColor = isDark ? cat.darkColor : cat.lightColor;

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
                ? { backgroundColor: activeBg, borderColor: activeColor }
                : isDark
                ? styles.categoryPillInactiveDark
                : styles.categoryPillInactiveLight,
            ]}
          >
            <CatIcon
              size={14}
              color={isSelected ? activeColor : isDark ? '#94a3b8' : '#64748b'}
            />
            <Text
              fontSize={12}
              fontWeight={isSelected ? '800' : '600'}
              color={isSelected ? activeColor : '$gray10'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderColor: 'rgba(226, 232, 240, 0.85)',
  },
  categoryPillInactiveDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
});
