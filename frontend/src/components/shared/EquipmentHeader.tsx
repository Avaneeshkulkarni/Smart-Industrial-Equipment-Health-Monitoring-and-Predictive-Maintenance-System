import React from 'react';
import { MapPin, Calendar, Clock, Cpu, Hash } from 'lucide-react';
import type { Equipment } from '../../types';
import { StatusBadge } from './StatusBadge';
import equipmentConfig from '../../config/equipmentConfig';

import { clsx } from 'clsx';

interface EquipmentHeaderProps {
  equipment: Equipment;
  className?: string;
}

/**
 * EquipmentHeader — equipment identity block at top of detail page.
 * Used by the single EquipmentDetails page for all 4 types.
 */
export function EquipmentHeader({ equipment, className }: EquipmentHeaderProps): React.ReactElement {
  const config = equipmentConfig[equipment.type];
  const Icon = config.icon;

  return (
    <div className={clsx('flex flex-col sm:flex-row items-start sm:items-center gap-4', className)}>
      {/* Icon */}
      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
        <Icon size={28} className="text-blue-400" aria-hidden="true" />
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-slate-100 truncate">{equipment.name}</h1>
          <span className="text-slate-500 font-mono text-sm">({equipment.id})</span>
          <StatusBadge status={equipment.status} />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Cpu size={11} aria-hidden="true" />
            {config.displayName}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={11} aria-hidden="true" />
            {equipment.location}
          </span>
          <span className="flex items-center gap-1">
            <Hash size={11} aria-hidden="true" />
            {equipment.model} · {equipment.manufacturer}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} aria-hidden="true" />
            {equipment.operatingHours.toLocaleString()} hrs operating
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={11} aria-hidden="true" />
            Next maintenance: {equipment.nextMaintenanceDate}
          </span>
        </div>
      </div>
    </div>
  );
}
