import React, { useState } from 'react';
import { XStack, Button, Dialog, Input, Text } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';

export interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, description: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}) => {
  const isDark = useAppStore((state) => state.isDark);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await onSubmit(name.trim(), description.trim());
      setName('');
      setDescription('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          opacity={0.65}
          backgroundColor="rgba(0,0,0,0.6)"
        />
        <Dialog.Content
          key="content"
          p="$4"
          width="90%"
          borderRadius={24}
          backgroundColor={isDark ? '#1e293b' : '#ffffff'}
          borderWidth={1}
          borderColor={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}
          elevation={8}
        >
          <Dialog.Title fontWeight="800" fontSize="$5" color="$color">
            Create New Group
          </Dialog.Title>
          <Dialog.Description size="$2" color="$gray10" mb="$3.5">
            Organize your trip, flat, or outing with friends.
          </Dialog.Description>

          <Input
            placeholder="Group Name (e.g. Goa Trip 2026)"
            value={name}
            onChangeText={setName}
            mb="$3"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$gray6"
            backgroundColor={isDark ? '#0f172a' : '$gray2'}
          />
          <Input
            placeholder="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            mb="$4"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$gray6"
            backgroundColor={isDark ? '#0f172a' : '$gray2'}
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
              onPress={handleCreate}
              disabled={!name.trim() || isSubmitting}
            >
              <Text color="white" fontWeight="700">
                {isSubmitting ? 'Creating...' : 'Create'}
              </Text>
            </Button>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
