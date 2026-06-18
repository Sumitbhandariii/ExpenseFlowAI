import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TransactionProvider } from '@/contexts/TransactionContext';
import { BudgetProvider } from '@/contexts/BudgetContext';
import { SavingsProvider } from '@/contexts/SavingsContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TransactionProvider>
        <BudgetProvider>
          <SavingsProvider>
            <StatusBar style="light" backgroundColor="#08081A" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#08081A' },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="transaction/add"
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: '#0F0F2A' },
                  headerTintColor: '#FFFFFF',
                  headerTitle: 'Add Transaction',
                  headerBackTitle: 'Back',
                  presentation: 'modal',
                }}
              />
              <Stack.Screen
                name="transaction/[id]"
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: '#0F0F2A' },
                  headerTintColor: '#FFFFFF',
                  headerTitle: 'Transaction Detail',
                  headerBackTitle: 'Back',
                }}
              />
              <Stack.Screen
                name="savings/index"
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: '#0F0F2A' },
                  headerTintColor: '#FFFFFF',
                  headerTitle: 'Savings Goals',
                  headerBackTitle: 'Back',
                }}
              />
              <Stack.Screen
                name="savings/add"
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: '#0F0F2A' },
                  headerTintColor: '#FFFFFF',
                  headerTitle: 'New Savings Goal',
                  headerBackTitle: 'Back',
                  presentation: 'modal',
                }}
              />
              <Stack.Screen
                name="ai-advisor"
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: '#0F0F2A' },
                  headerTintColor: '#FFFFFF',
                  headerTitle: 'AI Financial Advisor',
                  headerBackTitle: 'Back',
                }}
              />
              <Stack.Screen
                name="search"
                options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: '#0F0F2A' },
                  headerTintColor: '#FFFFFF',
                  headerTitle: 'Search Transactions',
                  headerBackTitle: 'Back',
                }}
              />
            </Stack>
          </SavingsProvider>
        </BudgetProvider>
      </TransactionProvider>
    </SafeAreaProvider>
  );
}
