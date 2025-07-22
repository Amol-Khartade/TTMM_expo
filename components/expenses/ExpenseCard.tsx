import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Avatar } from 'react-native-paper';
import { Expense } from '@/types';
import { spacing } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface ExpenseCardProps {
  expense: Expense;
  currentUserId: string;
  onPress?: () => void;
  onLongPress?: () => void;
  showGroup?: boolean;
}

const ExpenseCard: React.FC<ExpenseCardProps> = memo(({
  expense,
  currentUserId,
  onPress,
  onLongPress,
  showGroup = false,
}) => {
  const userSplit = expense.splitDetails.find(split => split.userId === currentUserId);
  const userPaid = expense.paidBy === currentUserId;
  const userAmount = userSplit?.amount || 0;
  
  // Determine the user's relationship to this expense
  const getRelationshipInfo = () => {
    if (userPaid && userSplit) {
      // User paid and owes something
      const netAmount = expense.amount - userAmount;
      return {
        type: 'net-positive' as const,
        amount: netAmount,
        text: `You are owed ${formatCurrency(netAmount)}`,
        color: '#4CAF50',
      };
    } else if (userPaid) {
      // User paid but doesn't owe anything
      return {
        type: 'paid' as const,
        amount: expense.amount,
        text: `You paid ${formatCurrency(expense.amount)}`,
        color: '#2196F3',
      };
    } else if (userSplit) {
      // User owes money
      return {
        type: 'owes' as const,
        amount: userAmount,
        text: `You owe ${formatCurrency(userAmount)}`,
        color: '#FF9800',
      };
    } else {
      // User not involved
      return {
        type: 'not-involved' as const,
        amount: 0,
        text: 'Not involved',
        color: '#9E9E9E',
      };
    }
  };

  const relationshipInfo = getRelationshipInfo();

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      food: '🍕',
      transport: '🚗',
      entertainment: '🎬',
      shopping: '🛍️',
      utilities: '⚡',
      healthcare: '🏥',
      education: '📚',
      travel: '✈️',
      other: '💰',
    };
    return icons[category.toLowerCase()] || icons.other;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      accessible
      accessibilityLabel={`Expense: ${expense.title}, ${formatCurrency(expense.amount)}`}
      accessibilityHint="Tap to view details, long press for options"
    >
      <Card style={styles.card} elevation={2}>
        <Card.Content style={styles.cardContent}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.titleSection}>
              <View style={styles.titleRow}>
                <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
                  {expense.title}
                </Text>
                <Text variant="headlineSmall" style={styles.amount}>
                  {formatCurrency(expense.amount)}
                </Text>
              </View>
              {expense.description && (
                <Text 
                  variant="bodySmall" 
                  style={styles.description}
                  numberOfLines={2}
                >
                  {expense.description}
                </Text>
              )}
            </View>
          </View>

          {/* Info Row */}
          <View style={styles.infoRow}>
            <View style={styles.leftInfo}>
              <Chip
                icon={() => <Text style={styles.categoryIcon}>{getCategoryIcon(expense.category)}</Text>}
                style={styles.categoryChip}
                textStyle={styles.categoryText}
                compact
              >
                {expense.category}
              </Chip>
              <Text variant="bodySmall" style={styles.date}>
                {formatDate(expense.date)}
              </Text>
            </View>

            {/* User relationship info */}
            <View style={styles.rightInfo}>
              <Chip
                style={[styles.relationshipChip, { backgroundColor: relationshipInfo.color + '20' }]}
                textStyle={[styles.relationshipText, { color: relationshipInfo.color }]}
                compact
              >
                {relationshipInfo.text}
              </Chip>
            </View>
          </View>

          {/* Split info */}
          {expense.splitDetails.length > 1 && (
            <View style={styles.splitInfo}>
              <Text variant="bodySmall" style={styles.splitText}>
                Split {expense.splitType} among {expense.splitDetails.length} people
              </Text>
              <View style={styles.avatarsContainer}>
                {expense.splitDetails.slice(0, 3).map((split, index) => (
                  <Avatar.Text
                    key={split.userId}
                    size={24}
                    label={split.userId.substring(0, 2).toUpperCase()}
                    style={[
                      styles.avatar,
                      { marginLeft: index > 0 ? -8 : 0 }
                    ]}
                  />
                ))}
                {expense.splitDetails.length > 3 && (
                  <Text variant="bodySmall" style={styles.moreParticipants}>
                    +{expense.splitDetails.length - 3}
                  </Text>
                )}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
});

ExpenseCard.displayName = 'ExpenseCard';

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
    borderRadius: 12,
  },
  cardContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  headerRow: {
    marginBottom: spacing.xs,
  },
  titleSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs / 2,
  },
  title: {
    flex: 1,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  amount: {
    fontWeight: '700',
    color: '#2196F3',
  },
  description: {
    opacity: 0.7,
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  categoryChip: {
    backgroundColor: '#E3F2FD',
    marginRight: spacing.sm,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  date: {
    opacity: 0.6,
  },
  relationshipChip: {
    borderRadius: 16,
  },
  relationshipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  splitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  splitText: {
    opacity: 0.7,
    flex: 1,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreParticipants: {
    marginLeft: spacing.xs,
    opacity: 0.7,
    fontSize: 11,
  },
});

export default ExpenseCard;