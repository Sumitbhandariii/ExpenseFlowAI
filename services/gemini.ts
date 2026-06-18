import { AI_CONFIG } from '@/constants/config';
import { Transaction, CategoryBreakdown, MonthlyStats } from '@/types';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

const buildFinancialContext = (
  transactions: Transaction[],
  stats: MonthlyStats | null,
  breakdown: CategoryBreakdown[]
): string => {
  const totalIncome = stats?.totalIncome ?? 0;
  const totalExpenses = stats?.totalExpenses ?? 0;
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : '0';

  const topCategories = breakdown
    .slice(0, 5)
    .map(c => `${c.categoryName}: ₹${c.total.toLocaleString()} (${c.percentage.toFixed(1)}%)`)
    .join(', ');

  const recentTxns = transactions.slice(0, 10).map(t =>
    `${t.type === 'income' ? '+' : '-'}₹${t.amount} on ${t.category} (${t.description})`
  ).join('; ');

  return `You are an expert AI Financial Advisor for ExpenseFlow AI app.

Current Month Financial Data:
- Total Income: ₹${totalIncome.toLocaleString()}
- Total Expenses: ₹${totalExpenses.toLocaleString()}
- Net Savings: ₹${savings.toLocaleString()}
- Savings Rate: ${savingsRate}%
- Top Spending Categories: ${topCategories || 'No data yet'}
- Recent Transactions: ${recentTxns || 'No transactions yet'}
- Total Transactions: ${transactions.length}

Provide personalized, actionable financial advice. Be specific, use actual numbers from the data.
Keep responses concise (2-3 paragraphs max). Use Indian Rupee (₹) currency.
Format nicely with key insights highlighted. Be encouraging but realistic.`;
};

export const GeminiService = {
  async sendMessage(
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'model'; text: string }>,
    transactions: Transaction[],
    stats: MonthlyStats | null,
    breakdown: CategoryBreakdown[]
  ): Promise<string> {
    try {
      const systemContext = buildFinancialContext(transactions, stats, breakdown);
      
      const messages: GeminiMessage[] = [
        {
          role: 'user',
          parts: [{ text: systemContext }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand your financial data. I am ready to provide personalized advice as your AI Financial Advisor. How can I help you today?' }],
        },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        })),
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ];

      const url = `${AI_CONFIG.baseUrl}/models/${AI_CONFIG.model}:generateContent?key=${AI_CONFIG.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            maxOutputTokens: AI_CONFIG.maxTokens,
            temperature: 0.7,
            topP: 0.9,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'I apologize, I could not generate a response. Please try again.';
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to connect to AI service');
    }
  },

  async generateMonthlyReport(
    transactions: Transaction[],
    stats: MonthlyStats,
    breakdown: CategoryBreakdown[]
  ): Promise<string> {
    const prompt = `Generate a comprehensive monthly financial report with:
1. Executive Summary
2. Income Analysis
3. Expense Breakdown & Key Insights
4. Savings Performance
5. Top 3 Actionable Recommendations for next month

Be specific with the numbers provided. Format with clear sections.`;

    return this.sendMessage(prompt, [], transactions, stats, breakdown);
  },

  async getQuickInsight(
    transactions: Transaction[],
    stats: MonthlyStats | null,
    breakdown: CategoryBreakdown[]
  ): Promise<string> {
    const prompt = 'Give me 3 key financial insights about my spending this month in bullet points. Be specific and actionable.';
    return this.sendMessage(prompt, [], transactions, stats, breakdown);
  },
};

export default GeminiService;
