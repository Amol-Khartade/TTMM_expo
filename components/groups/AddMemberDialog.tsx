import React, { useState } from 'react';
import { XStack, Button, Dialog, Input, Text, Paragraph } from 'tamagui';
import { AlertCircle } from '@tamagui/lucide-icons';
import { useAppStore } from '@/store/useAppStore';

export interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName?: string;
  onSubmit: (email: string) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
}

export const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  open,
  onOpenChange,
  groupName = 'this group',
  onSubmit,
  isSubmitting = false,
  error,
}) => {
  const isDark = useAppStore((state) => state.isDark);
  const [email, setEmail] = useState('');

  const handleAdd = async () => {
    if (!email.trim()) return;
    try {
      await onSubmit(email.trim());
      setEmail('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = () => {
    setEmail('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          opacity={0.65}
          backgroundColor="rgba(0,0,0,0.65)"
        />
        <Dialog.Content
          key="content"
          p="$4"
          width="90%"
          borderRadius={24}
          backgroundColor={isDark ? '#131B2E' : '#FFFFFF'}
          borderWidth={1}
          borderColor={isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(226, 232, 240, 0.90)'}
          elevation={8}
        >
          <Dialog.Title fontWeight="800" fontSize="$5" color="$color">
            Add Group Member
          </Dialog.Title>
          <Dialog.Description size="$2" color="$gray10" mb="$3.5">
            Enter the registered email of the user to add them to {groupName}.
          </Dialog.Description>

          {error && (
            <XStack
              backgroundColor={isDark ? 'rgba(244, 63, 94, 0.16)' : 'rgba(225, 29, 72, 0.10)'}
              p="$2.5"
              borderRadius="$3"
              alignItems="center"
              gap="$2"
              mb="$3"
              borderWidth={1}
              borderColor={isDark ? 'rgba(244, 63, 94, 0.30)' : 'rgba(225, 29, 72, 0.22)'}
            >
              <AlertCircle size={16} color={isDark ? '#fb7185' : '#e11d48'} />
              <Paragraph color={isDark ? '#fb7185' : '#e11d48'} size="$2" flex={1}>
                {error}
              </Paragraph>
            </XStack>
          )}

          <Input
            placeholder="e.g. friend@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            mb="$4"
            borderRadius="$4"
            borderWidth={1}
            borderColor={isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(226, 232, 240, 0.90)'}
            backgroundColor={isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(248, 250, 252, 0.95)'}
            color="$color"
          />

          <XStack justifyContent="flex-end" gap="$2.5">
            <Button
              chromeless
              borderRadius="$4"
              onPress={handleClose}
            >
              Cancel
            </Button>
            <Button
              backgroundColor="$blue10"
              color="white"
              borderRadius="$4"
              onPress={handleAdd}
              disabled={!email.trim() || isSubmitting}
            >
              <Text color="white" fontWeight="700">
                {isSubmitting ? 'Adding...' : 'Add Member'}
              </Text>
            </Button>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
