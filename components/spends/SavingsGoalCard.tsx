import React from 'react';
import { Card, XStack, YStack, Text, Progress, Button } from 'tamagui';
import { Target, TrendingUp, Calendar, CheckCircle2 } from '@tamagui/lucide-icons';
import { SavingsGoal } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onDepositPress: (goal: SavingsGoal) => void;
  onEditPress?: (goal: SavingsGoal) => void;
}

export function SavingsGoalCard({ goal, onDepositPress, onEditPress }: SavingsGoalCardProps) {
  const percentage = Math.min(100, Math.max(0, (goal.currentSaved / goal.targetAmount) * 100));
  const isCompleted = percentage >= 100;
  
  // Format remaining time if targetDate exists
  let remainingDaysText = '';
  if (goal.targetDate && !isCompleted) {
    const today = new Date();
    const target = new Date(goal.targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      remainingDaysText = `${diffDays} days left`;
    } else if (diffDays === 0) {
      remainingDaysText = 'Due today';
    } else {
      remainingDaysText = 'Past due';
    }
  }

  return (
    <Card 
      elevation="$4" 
      size="$4" 
      borderWidth={1}
      borderColor="$borderColor"
      onPress={() => onEditPress?.(goal)}
      backgroundColor="$background"
    >
      <Card.Header padding="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack gap="$1">
            <Text fontSize="$5" fontWeight="bold" color="$text">
              {goal.title}
            </Text>
            {remainingDaysText ? (
              <XStack alignItems="center" gap="$2">
                <Calendar size={14} color="$gray10" />
                <Text fontSize="$3" color="$gray10">
                  {remainingDaysText}
                </Text>
              </XStack>
            ) : null}
          </YStack>
          
          <YStack alignItems="flex-end" gap="$1">
            <Text fontSize="$5" fontWeight="bold" color={goal.color || '$blue10'}>
              {formatCurrency(goal.currentSaved, goal.currency)}
            </Text>
            <Text fontSize="$3" color="$gray10">
              of {formatCurrency(goal.targetAmount, goal.currency)}
            </Text>
          </YStack>
        </XStack>
      </Card.Header>

      <YStack paddingHorizontal="$4" paddingBottom="$4" gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$2" fontWeight="600" color={isCompleted ? '$green10' : '$gray10'}>
            {isCompleted ? 'Goal Reached! 🎉' : `${percentage.toFixed(1)}% Completed`}
          </Text>
          {isCompleted && <CheckCircle2 size={16} color="$green10" />}
        </XStack>
        
        <Progress size="$2" value={percentage} backgroundColor="$gray5">
          <Progress.Indicator 
            backgroundColor={isCompleted ? '$green10' : goal.color || '$blue10'} 
          />
        </Progress>
      </YStack>

      <Card.Footer padding="$4">
        <XStack flex={1} gap="$3">
          <Button
            flex={1}
            size="$3"
            variant="outlined"
            icon={Target}
            onPress={(e) => {
              e.stopPropagation();
              onEditPress?.(goal);
            }}
          >
            Details
          </Button>
          <Button
            flex={1}
            size="$3"
            theme="active"
            backgroundColor={goal.color || '$blue10'}
            color="white"
            icon={TrendingUp}
            onPress={(e) => {
              e.stopPropagation();
              onDepositPress(goal);
            }}
            disabled={isCompleted}
            opacity={isCompleted ? 0.5 : 1}
          >
            Deposit
          </Button>
        </XStack>
      </Card.Footer>
    </Card>
  );
}
