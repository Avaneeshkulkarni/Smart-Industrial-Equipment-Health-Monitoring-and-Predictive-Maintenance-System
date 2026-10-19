import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, WifiOff } from 'lucide-react';
import type { EquipmentStatus, HealthStatus, AlertSeverity } from '../../types';
import { getStatusBgClass } from '../../utils/health';
import { clsx } from 'clsx';

type StatusValue = EquipmentStatus | HealthStatus | AlertSeverity | 'offline';

interface StatusBadgeProps {
  status: StatusValue;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const STATUS_ICONS: Record<StatusValue, React.ElementType> = {
  healthy:  CheckCircle,
  warning:  AlertTriangle,
  critical: XCircle,
  offline:  WifiOff,
  info:     CheckCircle,
};

const STATUS_LABELS: Record<StatusValue, string> = {
  healthy:  'Healthy',
  warning:  'Warning',
  critical: 'Critical',
  offline:  'Offline',
  info:     'Info',
};

const SIZE_CLASSES = {
  sm: 'text-xs px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-1 gap-1.5',
  lg: 'text-sm px-2.5 py-1.5 gap-2',
};

const ICON_SIZES = {
  sm: 10,
  md: 12,
  lg: 14,
};

/**
 * StatusBadge — semantic color + label + icon.
 * Never relies on color alone; always paired with an icon and text label.
 */
export function StatusBadge({
  status,
  label,
  size = 'md',
  showIcon = true,
  className,
}: StatusBadgeProps): React.ReactElement {
  const Icon = STATUS_ICONS[status] ?? AlertTriangle;
  const displayLabel = label ?? STATUS_LABELS[status] ?? status;
  const iconSize = ICON_SIZES[size];

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border',
        getStatusBgClass(status as EquipmentStatus),
        SIZE_CLASSES[size],
        className,
      )}
    >
      {showIcon && <Icon size={iconSize} aria-hidden="true" />}
      <span>{displayLabel}</span>
    </span>
  );
}
