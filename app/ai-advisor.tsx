import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTransactions } from '@/hooks/useTransactions';
import { AIMessage } from '@/types';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { GeminiService } from '@/services/gemini';

const QUICK_PROMPTS = [
  'Analyze my spending this month',
  'How can I save more money?',
  'Which category am I overspending?',
  'Give me a monthly financial report',
  'Tips to reach my savings goals faster',
];

const WELCOME_MESSAGE: AIMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Hello! I am your AI Financial Advisor powered by Gemini AI. I have analyzed your financial data and I am ready to provide personalized insights.

Here is what I can help you with:
• Spending analysis and patterns
• Saving suggestions tailored to your habits
• Budget recommendations
• Monthly financial reports
• Expense insights and predictions

What would you like to know about your finances today?`,
  timestamp: new Date().toISOString(),
};

export default function AIAdvisorScreen() {
  const { transactions, getMonthlyStats, getCategoryBreakdown } = useTransactions();
  const [messages, setMessages] = useState<AIMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const stats = useMemo(() => getMonthlyStats(), [getMonthlyStats]);
  const breakdown = useMemo(() => getCategoryBreakdown('expense'), [getCategoryBreakdown]);

  const conversationHistory = useMemo(() =>
    messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role === 'assistant' ? 'model' as const : 'user' as const, text: m.content })),
    [messages]
  );

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await GeminiService.sendMessage(
        trimmed,
        conversationHistory,
        transactions,
        stats,
        breakdown
      );

      const aiMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered an error connecting to the AI service. Please check your internet connection and try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {/* Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statsBannerItem}>
            <Text style={styles.statsBannerLabel}>Income</Text>
            <Text style={[styles.statsBannerValue, { color: Colors.income }]}>
              ₹{(stats.totalIncome / 1000).toFixed(0)}K
            </Text>
          </View>
          <View style={styles.statsBannerItem}>
            <Text style={styles.statsBannerLabel}>Expenses</Text>
            <Text style={[styles.statsBannerValue, { color: Colors.expense }]}>
              ₹{(stats.totalExpenses / 1000).toFixed(0)}K
            </Text>
          </View>
          <View style={styles.statsBannerItem}>
            <Text style={styles.statsBannerLabel}>Savings</Text>
            <Text style={[styles.statsBannerValue, { color: Colors.success }]}>
              ₹{(Math.max(0, stats.savings) / 1000).toFixed(0)}K
            </Text>
          </View>
          <View style={styles.statsBannerItem}>
            <Text style={styles.statsBannerLabel}>Tx Count</Text>
            <Text style={[styles.statsBannerValue, { color: Colors.accent }]}>
              {stats.transactionCount}
            </Text>
          </View>
        </View>

        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}
          >
            {msg.role === 'assistant' ? (
              <View style={styles.aiAvatar}>
                <MaterialIcons name="auto-awesome" size={14} color={Colors.accent} />
              </View>
            ) : null}
            <View style={[styles.bubbleContent, msg.role === 'user' ? styles.userContent : styles.aiContent]}>
              <Text style={[styles.bubbleText, msg.role === 'user' && styles.userText]}>
                {msg.content}
              </Text>
              <Text style={styles.timestamp}>
                {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}

        {loading ? (
          <View style={styles.aiBubble}>
            <View style={styles.aiAvatar}>
              <MaterialIcons name="auto-awesome" size={14} color={Colors.accent} />
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={Colors.accent} />
              <Text style={styles.typingText}>Analyzing your finances...</Text>
            </View>
          </View>
        ) : null}

        {/* Quick Prompts */}
        {messages.length <= 1 ? (
          <View style={styles.quickPrompts}>
            <Text style={styles.quickPromptsTitle}>Quick Questions</Text>
            {QUICK_PROMPTS.map((prompt) => (
              <Pressable
                key={prompt}
                style={({ pressed }) => [styles.quickPrompt, pressed && { opacity: 0.7 }]}
                onPress={() => sendMessage(prompt)}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
                <MaterialIcons name="chevron-right" size={16} color={Colors.accent} />
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your finances..."
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={500}
          onSubmitEditing={() => sendMessage(input)}
        />
        <Pressable
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.text} />
          ) : (
            <MaterialIcons name="send" size={20} color={Colors.text} />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  messages: { padding: Spacing.base, paddingBottom: 16 },

  statsBanner: {
    flexDirection: 'row', backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.base,
    borderWidth: 1, borderColor: Colors.border,
  },
  statsBannerItem: { flex: 1, alignItems: 'center' },
  statsBannerLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },
  statsBannerValue: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold, marginTop: 2 },

  bubble: { flexDirection: 'row', marginBottom: Spacing.md, gap: Spacing.sm },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start', alignItems: 'flex-start' },

  aiAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: `${Colors.accent}20`, alignItems: 'center', justifyContent: 'center',
    marginTop: 4, flexShrink: 0,
  },
  bubbleContent: {
    maxWidth: '80%', borderRadius: Radius.xl, padding: Spacing.md, gap: 4,
  },
  userContent: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  aiContent: { backgroundColor: Colors.surfaceCard, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  bubbleText: { fontSize: Fonts.sizes.base, color: Colors.textSecondary, lineHeight: 22 },
  userText: { color: Colors.text },
  timestamp: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, alignSelf: 'flex-end' },

  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  typingText: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },

  quickPrompts: { marginTop: Spacing.base },
  quickPromptsTitle: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, marginBottom: Spacing.sm, fontWeight: Fonts.weights.medium },
  quickPrompt: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  quickPromptText: { flex: 1, fontSize: Fonts.sizes.sm, color: Colors.textSecondary },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
    padding: Spacing.md, paddingBottom: Platform.OS === 'ios' ? Spacing.base : Spacing.md,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  input: {
    flex: 1, backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    color: Colors.text, fontSize: Fonts.sizes.base,
    borderWidth: 1, borderColor: Colors.border, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.surfaceElevated },
});
