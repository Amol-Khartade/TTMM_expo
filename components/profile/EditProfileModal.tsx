import React, { useState, useEffect } from 'react';
import { Modal, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Pressable } from 'react-native';
import { YStack, XStack, Text, Button, Input, Label } from 'tamagui';
import { X, Save } from '@tamagui/lucide-icons';
import { useAppStore } from '@/store/useAppStore';
import { GlassCard } from '@/components/ui/GlassCard';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');

  useEffect(() => {
    if (open && currentUser) {
      setDisplayName(currentUser.displayName || '');
    }
  }, [open, currentUser]);

  const handleSave = () => {
    if (!currentUser || !displayName.trim()) return;
    
    // In a real app, this would also make an API call to update the profile on the backend
    setCurrentUser({
      ...currentUser,
      displayName: displayName.trim(),
    });
    
    onClose();
  };

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <YStack flex={1} backgroundColor="rgba(0,0,0,0.65)" justifyContent="flex-end">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <GlassCard variant="elevated" borderRadius={28} p={22} style={styles.sheetContainer}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack gap="$4" paddingBottom="$8">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$6" fontWeight="bold">Edit Profile</Text>
                  <Button size="$3" circular icon={X} variant="outlined" onPress={onClose} />
                </XStack>

                <YStack gap="$2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Enter your name"
                    value={displayName}
                    onChangeText={setDisplayName}
                    size="$4"
                  />
                </YStack>

                <YStack gap="$2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={currentUser?.email || ''}
                    disabled
                    opacity={0.6}
                    size="$4"
                  />
                  <Text fontSize="$2" color="$gray10">Email address cannot be changed.</Text>
                </YStack>

                <Button
                  marginTop="$4"
                  size="$4"
                  theme="active"
                  icon={Save}
                  onPress={handleSave}
                  disabled={!displayName.trim()}
                  opacity={!displayName.trim() ? 0.5 : 1}
                >
                  Save Changes
                </Button>
              </YStack>
            </ScrollView>
          </KeyboardAvoidingView>
        </GlassCard>
      </YStack>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '85%',
  },
});
