import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { YStack, XStack, Text, H3, Paragraph, Button, Separator } from 'tamagui';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  X,
  CheckCircle2,
  RotateCcw,
  Tag,
  Calendar,
  AlertCircle,
  Smartphone,
  CreditCard,
  Hash,
} from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  receiptScannerService,
  ParsedReceipt,
  ReceiptImageCapture,
} from '@/services/receiptScannerService';
import { useAppStore } from '@/store/useAppStore';

export interface ReceiptScannerModalProps {
  open: boolean;
  onClose: () => void;
  onReceiptParsed: (receipt: ParsedReceipt) => void;
}

type ScanStep = 'pick' | 'scanning' | 'review' | 'error';

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  open,
  onClose,
  onReceiptParsed,
}) => {
  const isDark = useAppStore((state) => state.isDark);

  const [step, setStep] = useState<ScanStep>('pick');
  const [capturedImage, setCapturedImage] = useState<ReceiptImageCapture | null>(null);
  const [parsedReceipt, setParsedReceipt] = useState<ParsedReceipt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReset = () => {
    setStep('pick');
    setCapturedImage(null);
    setParsedReceipt(null);
    setErrorMessage(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handlePickSource = async (source: 'camera' | 'gallery') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const image = await receiptScannerService.captureOrPickReceipt(source);

      if (!image) {
        return; // User canceled
      }

      setCapturedImage(image);
      setStep('scanning');

      // Analyze with Gemini AI
      const result = await receiptScannerService.analyzeReceiptWithAI(image);
      setParsedReceipt(result);
      setStep('review');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMessage(err?.message || 'Failed to analyze receipt. Please try again.');
      setStep('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  };

  const handleApply = () => {
    if (!parsedReceipt) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onReceiptParsed(parsedReceipt);
    handleClose();
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <YStack
        flex={1}
        backgroundColor="rgba(0, 0, 0, 0.70)"
        justifyContent="flex-end"
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <GlassCard
          variant="elevated"
          borderRadius={28}
          p={22}
          style={styles.sheetContainer}
        >
          {/* Header Bar */}
          <XStack justifyContent="space-between" alignItems="center" mb="$3">
            <XStack alignItems="center" gap="$2">
              <YStack
                width={36}
                height={36}
                borderRadius={12}
                backgroundColor={isDark ? 'rgba(56, 189, 248, 0.16)' : 'rgba(2, 132, 199, 0.10)'}
                alignItems="center"
                justifyContent="center"
              >
                <Sparkles size={20} color={isDark ? '#38bdf8' : '#0284c7'} />
              </YStack>
              <YStack>
                <H3 fontSize="$5" fontWeight="900" color="$color">
                  AI Receipt Scanner
                </H3>
                <Paragraph fontSize="$1" color="$gray10">
                  Powered by Google Gemini
                </Paragraph>
              </YStack>
            </XStack>

            <Pressable
              onPress={handleClose}
              hitSlop={8}
              style={styles.closeBtn}
            >
              <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
            </Pressable>
          </XStack>

          <Separator my="$2" opacity={0.15} />

          {/* STEP 1: PICK SOURCE */}
          {step === 'pick' && (
            <YStack gap="$3.5" py="$2">
              <Paragraph fontSize="$2" color="$gray11" textAlign="center" px="$2">
                Photograph a paper bill or upload a receipt from your device. Gemini AI will
                automatically extract the merchant, total, date & category.
              </Paragraph>

              <XStack gap="$3" mt="$2">
                {/* Camera Option */}
                <Pressable
                  onPress={() => handlePickSource('camera')}
                  style={({ pressed }) => [
                    styles.sourceCard,
                    {
                      backgroundColor: isDark
                        ? 'rgba(56, 189, 248, 0.10)'
                        : 'rgba(2, 132, 199, 0.06)',
                      borderColor: isDark
                        ? 'rgba(56, 189, 248, 0.28)'
                        : 'rgba(2, 132, 199, 0.20)',
                    },
                    pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
                  ]}
                >
                  <YStack
                    width={52}
                    height={52}
                    borderRadius={18}
                    backgroundColor={isDark ? '#0284c7' : '#0284c7'}
                    alignItems="center"
                    justifyContent="center"
                    mb="$2"
                  >
                    <Camera size={26} color="#ffffff" />
                  </YStack>
                  <Text fontWeight="800" fontSize="$3" color="$color">
                    Take Photo
                  </Text>
                  <Paragraph fontSize={11} color="$gray10" textAlign="center" mt="$1">
                    Scan via camera
                  </Paragraph>
                </Pressable>

                {/* Gallery Option */}
                <Pressable
                  onPress={() => handlePickSource('gallery')}
                  style={({ pressed }) => [
                    styles.sourceCard,
                    {
                      backgroundColor: isDark
                        ? 'rgba(168, 85, 247, 0.10)'
                        : 'rgba(147, 51, 234, 0.06)',
                      borderColor: isDark
                        ? 'rgba(168, 85, 247, 0.28)'
                        : 'rgba(147, 51, 234, 0.20)',
                    },
                    pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
                  ]}
                >
                  <YStack
                    width={52}
                    height={52}
                    borderRadius={18}
                    backgroundColor={isDark ? '#a855f7' : '#9333ea'}
                    alignItems="center"
                    justifyContent="center"
                    mb="$2"
                  >
                    <ImageIcon size={26} color="#ffffff" />
                  </YStack>
                  <Text fontWeight="800" fontSize="$3" color="$color">
                    Photo Library
                  </Text>
                  <Paragraph fontSize={11} color="$gray10" textAlign="center" mt="$1">
                    Upload screenshot / image
                  </Paragraph>
                </Pressable>
              </XStack>
            </YStack>
          )}

          {/* STEP 2: SCANNING ANIMATION */}
          {step === 'scanning' && (
            <YStack alignItems="center" py="$6" gap="$4">
              <YStack
                width={120}
                height={160}
                borderRadius={16}
                overflow="hidden"
                backgroundColor="#000"
                position="relative"
              >
                {capturedImage && (
                  <Image
                    source={{ uri: capturedImage.uri }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                )}
                <YStack
                  style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(2, 132, 199, 0.25)' }]}
                />

                {/* Animated Scan Beam */}
                <MotiView
                  from={{ translateY: -10 }}
                  animate={{ translateY: 160 }}
                  transition={{
                    type: 'timing',
                    duration: 1200,
                    loop: true,
                  }}
                  style={styles.scanBeam}
                />
              </YStack>

              <YStack alignItems="center" gap="$1.5">
                <XStack alignItems="center" gap="$2">
                  <ActivityIndicator size="small" color="#0284c7" />
                  <Text fontWeight="800" fontSize="$4" color="$color">
                    Analyzing Receipt with Gemini...
                  </Text>
                </XStack>
                <Paragraph fontSize="$2" color="$gray10" textAlign="center">
                  Extracting line items, merchant name & bill totals
                </Paragraph>
              </YStack>
            </YStack>
          )}

          {/* STEP 3: REVIEW EXTRACTED DETAILS */}
          {step === 'review' && parsedReceipt && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
            >
              <YStack gap="$3">
                {/* Extracted Header Banner */}
                <XStack
                  backgroundColor={isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(22, 163, 74, 0.08)'}
                  borderColor={isDark ? 'rgba(34, 197, 94, 0.30)' : 'rgba(22, 163, 74, 0.20)'}
                  borderWidth={1}
                  p="$2.5"
                  borderRadius="$4"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <XStack alignItems="center" gap="$2">
                    <CheckCircle2 size={18} color="#16a34a" />
                    <Text fontSize={12} fontWeight="800" color="#16a34a">
                      Receipt Parsed Successfully
                    </Text>
                  </XStack>
                  <Text fontSize={11} color="$gray10" fontWeight="700">
                    {Math.round(parsedReceipt.confidence * 100)}% Confidence
                  </Text>
                </XStack>

                {/* Extracted Key Summary Card */}
                <GlassCard variant="subtle" p={14} borderRadius={18}>
                  <YStack gap="$2.5">
                    <XStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="$2" color="$gray10" fontWeight="600">
                        Merchant / Store
                      </Text>
                      <Text fontSize="$4" fontWeight="900" color="$color">
                        {parsedReceipt.title}
                      </Text>
                    </XStack>

                    <Separator opacity={0.12} />

                    <XStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="$2" color="$gray10" fontWeight="600">
                        Total Amount
                      </Text>
                      <Text fontSize="$6" fontWeight="900" color="#16a34a">
                        {formatCurrency(parsedReceipt.amount, parsedReceipt.currency)}
                      </Text>
                    </XStack>

                    <Separator opacity={0.12} />

                    <XStack justifyContent="space-between" alignItems="center">
                      <XStack alignItems="center" gap="$1.5">
                        <Tag size={14} color="$gray10" />
                        <Text fontSize="$2" color="$gray10" fontWeight="600">
                          Category
                        </Text>
                      </XStack>
                      <Text fontSize="$2" fontWeight="800" color="#0284c7" textTransform="capitalize">
                        {parsedReceipt.category}
                      </Text>
                    </XStack>

                    <Separator opacity={0.12} />

                    <XStack justifyContent="space-between" alignItems="center">
                      <XStack alignItems="center" gap="$1.5">
                        <Calendar size={14} color="$gray10" />
                        <Text fontSize="$2" color="$gray10" fontWeight="600">
                          Date
                        </Text>
                      </XStack>
                      <Text fontSize="$2" fontWeight="700" color="$color">
                        {formatDate(parsedReceipt.date)}
                      </Text>
                    </XStack>

                    {parsedReceipt.paymentDetails?.isPaymentScreenshot ? (
                      <>
                        <Separator opacity={0.12} />

                        <XStack justifyContent="space-between" alignItems="center">
                          <XStack alignItems="center" gap="$1.5">
                            <Smartphone size={14} color="#0284c7" />
                            <Text fontSize="$2" color="$gray10" fontWeight="600">
                              Payment App
                            </Text>
                          </XStack>
                          <YStack
                            backgroundColor={isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.08)'}
                            px="$2"
                            py="$0.5"
                            borderRadius="$3"
                          >
                            <Text fontSize="$2" fontWeight="800" color={isDark ? '#38bdf8' : '#0284c7'}>
                              {parsedReceipt.paymentDetails.appNameFormatted || 'UPI App'}
                            </Text>
                          </YStack>
                        </XStack>

                        {parsedReceipt.paymentDetails.receiverUpiId ? (
                          <>
                            <Separator opacity={0.12} />
                            <XStack justifyContent="space-between" alignItems="center">
                              <XStack alignItems="center" gap="$1.5">
                                <CreditCard size={14} color="#16a34a" />
                                <Text fontSize="$2" color="$gray10" fontWeight="600">
                                  Payee UPI ID
                                </Text>
                              </XStack>
                              <Text fontSize="$2" fontWeight="700" color="#16a34a">
                                {parsedReceipt.paymentDetails.receiverUpiId}
                              </Text>
                            </XStack>
                          </>
                        ) : null}

                        {parsedReceipt.paymentDetails.utrNumber ? (
                          <>
                            <Separator opacity={0.12} />
                            <XStack justifyContent="space-between" alignItems="center">
                              <XStack alignItems="center" gap="$1.5">
                                <Hash size={14} color="$gray10" />
                                <Text fontSize="$2" color="$gray10" fontWeight="600">
                                  UTR / Ref
                                </Text>
                              </XStack>
                              <Text fontSize={11} fontWeight="700" color="$gray11">
                                {parsedReceipt.paymentDetails.utrNumber}
                              </Text>
                            </XStack>
                          </>
                        ) : null}
                      </>
                    ) : null}
                  </YStack>
                </GlassCard>

                {/* Line items if detected */}
                {parsedReceipt.lineItems && parsedReceipt.lineItems.length > 0 && (
                  <YStack gap="$1.5">
                    <Text fontSize={12} fontWeight="800" color="$gray10" textTransform="uppercase">
                      Detected Items ({parsedReceipt.lineItems.length})
                    </Text>
                    <YStack
                      backgroundColor={isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)'}
                      borderRadius={14}
                      p="$2.5"
                      gap="$1.5"
                    >
                      {parsedReceipt.lineItems.map((item, idx) => (
                        <XStack key={idx} justifyContent="space-between" alignItems="center">
                          <Text fontSize={12} color="$color" numberOfLines={1} flex={1} mr="$2">
                            {item.quantity ? `${item.quantity}x ` : ''}
                            {item.name}
                          </Text>
                          <Text fontSize={12} fontWeight="700" color="$color">
                            {formatCurrency(item.price, parsedReceipt.currency)}
                          </Text>
                        </XStack>
                      ))}
                    </YStack>
                  </YStack>
                )}

                {/* Actions */}
                <XStack gap="$2.5" mt="$2">
                  <Button
                    flex={1}
                    size="$4"
                    borderRadius={16}
                    backgroundColor="$color3"
                    onPress={handleReset}
                    icon={<RotateCcw size={16} color="$color" />}
                  >
                    <Text fontWeight="800" color="$color">
                      Retake
                    </Text>
                  </Button>

                  <Button
                    flex={2}
                    size="$4"
                    borderRadius={16}
                    backgroundColor="#0284c7"
                    pressStyle={{ backgroundColor: '#0369a1' }}
                    onPress={handleApply}
                    icon={<CheckCircle2 size={18} color="#ffffff" />}
                  >
                    <Text fontWeight="900" color="#ffffff">
                      Auto-Fill Expense
                    </Text>
                  </Button>
                </XStack>
              </YStack>
            </ScrollView>
          )}

          {/* STEP 4: ERROR STATE */}
          {step === 'error' && (
            <YStack alignItems="center" py="$5" gap="$3">
              <YStack
                width={56}
                height={56}
                borderRadius={20}
                backgroundColor="rgba(239, 68, 68, 0.12)"
                alignItems="center"
                justifyContent="center"
              >
                <AlertCircle size={28} color="#ef4444" />
              </YStack>
              <Text fontSize="$4" fontWeight="800" color="$color" textAlign="center">
                Could Not Read Receipt
              </Text>
              <Paragraph fontSize="$2" color="$gray10" textAlign="center" px="$3">
                {errorMessage || 'Make sure the receipt image is well-lit and clearly shows the totals.'}
              </Paragraph>
              <Button
                size="$4"
                borderRadius={16}
                backgroundColor="#0284c7"
                mt="$2"
                onPress={handleReset}
                icon={<RotateCcw size={16} color="#ffffff" />}
              >
                <Text fontWeight="800" color="#ffffff">
                  Try Again
                </Text>
              </Button>
            </YStack>
          )}
        </GlassCard>
      </YStack>
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeBtn: {
    padding: 6,
    borderRadius: 12,
  },
  sourceCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '88%',
  },
});
