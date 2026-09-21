import React from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import { XStack, Text } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';
import { GlassCard } from '@/components/ui/GlassCard';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  count?: number;
}

export interface SegmentedTabControlProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  style?: ViewStyle;
}

export const SegmentedTabControl: React.FC<SegmentedTabControlProps> = ({
  tabs,
  activeTab,
  onTabChange,
  style,
}) => {
  const isDark = useAppStore((state) => state.isDark);

  return (
    <GlassCard variant="subtle" borderRadius={18} p={4} style={[styles.container, style]}>
      <XStack gap="$1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label} tab`}
              onPress={() => {
                if (!isActive) {
                  Haptics.selectionAsync().catch(() => {});
                  onTabChange(tab.id);
                }
              }}
              style={[
                styles.tabButton,
                isActive && (isDark ? styles.tabActiveDark : styles.tabActiveLight),
              ]}
            >
              {Icon && (
                <Icon
                  size={16}
                  color={
                    isActive
                      ? isDark
                        ? '#38bdf8'
                        : '#0284c7'
                      : isDark
                      ? '#94a3b8'
                      : '#64748b'
                  }
                  strokeWidth={isActive ? 2.5 : 2}
                />
              )}
              <Text
                fontWeight={isActive ? '800' : '600'}
                color={isActive ? '$color' : '$gray10'}
                fontSize="$3"
              >
                {tab.label}
                {tab.count !== undefined ? ` (${tab.count})` : ''}
              </Text>
            </Pressable>
          );
        })}
      </XStack>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    minHeight: 44,
  },
  tabActiveLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.90)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabActiveDark: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
});
