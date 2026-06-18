import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CategoryBreakdown } from '@/types';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DonutChartProps {
  data: CategoryBreakdown[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ data, size = 160, centerLabel = 'Total', centerValue = '' }: DonutChartProps) {
  if (data.length === 0) {
    return (
      <View style={[styles.chartContainer, { width: size, height: size }]}>
        <View style={[styles.emptyDonut, { width: size, height: size, borderRadius: size / 2 }]} />
        <View style={styles.centerLabel}>
          <Text style={styles.centerLabelText}>No Data</Text>
        </View>
      </View>
    );
  }

  const total = data.reduce((sum, d) => sum + d.total, 0);
  const strokeWidth = size * 0.15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = -90; // start from top

  const segments = data.slice(0, 6).map((item) => {
    const angle = (item.total / total) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return { ...item, startAngle, angle };
  });

  return (
    <View style={styles.chartWrapper}>
      {/* Simple bar chart representation since SVG is complex */}
      <View style={[styles.donutFallback, { width: size, height: size }]}>
        <View style={styles.centerContent}>
          <Text style={styles.centerValue}>{centerValue}</Text>
          <Text style={styles.centerLabelText}>{centerLabel}</Text>
        </View>
        {/* Segment arcs as colored borders */}
        {segments.map((seg, i) => (
          <View
            key={seg.categoryId}
            style={[
              styles.segment,
              {
                borderColor: seg.color,
                opacity: 0.8 + (i * 0.04),
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
}

interface BarChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  maxValue?: number;
  height?: number;
  showValues?: boolean;
}

export function BarChart({ data, maxValue, height = 180, showValues = true }: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.max(1, Math.floor((SCREEN_WIDTH - 80) / Math.max(data.length, 1)) - 8);

  return (
    <View style={[styles.barChart, { height }]}>
      <View style={styles.barsRow}>
        {data.map((item, i) => {
          const barH = Math.max(4, (item.value / max) * (height - 40));
          return (
            <View key={i} style={styles.barItem}>
              {showValues ? (
                <Text style={styles.barValue} numberOfLines={1}>
                  {item.value > 999 ? `${(item.value / 1000).toFixed(0)}k` : item.value}
                </Text>
              ) : null}
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: barH,
                      backgroundColor: item.color,
                      width: Math.min(barWidth, 32),
                    }
                  ]}
                />
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  color?: string;
  height?: number;
}

export function SimpleLineChart({ data, color = Colors.primary, height = 120 }: LineChartProps) {
  const max = Math.max(...data.map(d => d.value), 1);
  const min = Math.min(...data.map(d => d.value), 0);
  const range = max - min || 1;
  const chartWidth = SCREEN_WIDTH - 80;
  const spacing = chartWidth / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: i * spacing,
    y: height - 30 - ((d.value - min) / range) * (height - 50),
    value: d.value,
    label: d.label,
  }));

  return (
    <View style={[styles.lineChart, { height }]}>
      <View style={styles.lineChartInner}>
        {/* Grid lines */}
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.gridLine, { bottom: 30 + (i * (height - 50)) / 3 }]} />
        ))}
        {/* Dots and values */}
        {points.map((p, i) => (
          <View key={i} style={[styles.dotContainer, { left: p.x, top: p.y - 4 }]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
          </View>
        ))}
        {/* Labels */}
        <View style={styles.labelsRow}>
          {data.map((d, i) => (
            <Text key={i} style={styles.lineLabel} numberOfLines={1}>{d.label}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}

interface CategoryListProps {
  data: CategoryBreakdown[];
  showAmount?: boolean;
}

export function CategoryBreakdownList({ data, showAmount = true }: CategoryListProps) {
  return (
    <View style={styles.categoryList}>
      {data.slice(0, 8).map((item) => (
        <View key={item.categoryId} style={styles.categoryRow}>
          <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
          <Text style={styles.categoryName} numberOfLines={1}>{item.categoryName}</Text>
          <View style={styles.categoryRight}>
            {showAmount ? (
              <Text style={styles.categoryAmount}>{APP_CONFIG.currency}{item.total.toLocaleString('en-IN')}</Text>
            ) : null}
            <Text style={[styles.categoryPct, { color: item.color }]}>{item.percentage.toFixed(1)}%</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrapper: {
    alignItems: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyDonut: {
    borderWidth: 20,
    borderColor: Colors.surfaceElevated,
    backgroundColor: 'transparent',
  },
  donutFallback: {
    borderRadius: 999,
    borderWidth: 20,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  segment: {
    position: 'absolute',
    inset: -20,
    borderRadius: 999,
    borderWidth: 3,
  },
  centerContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  centerValue: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabelText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },

  // Bar Chart
  barChart: {
    width: '100%',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    flex: 1,
    paddingBottom: 24,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  barBg: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barFill: {
    borderRadius: Radius.sm,
    minHeight: 4,
  },
  barLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginTop: 4,
    maxWidth: 40,
    textAlign: 'center',
  },

  // Line Chart
  lineChart: {
    width: '100%',
  },
  lineChartInner: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dotContainer: {
    position: 'absolute',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  labelsRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  lineLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    flex: 1,
    textAlign: 'center',
  },

  // Category List
  categoryList: {
    gap: Spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  categoryRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  categoryAmount: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    fontWeight: Fonts.weights.medium,
  },
  categoryPct: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semiBold,
    minWidth: 36,
    textAlign: 'right',
  },
});
