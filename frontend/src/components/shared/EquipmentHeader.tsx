import React from 'react';
import { MapPin, Cpu, Hash } from 'lucide-react';
import type { Equipment } from '../../types';
import { StatusBadge } from './StatusBadge';
import equipmentConfig from '../../config/equipmentConfig';
import { clsx } from 'clsx';

interface EquipmentHeaderProps {
  equipment: Equipment;
  className?: string;
}

/**
 * Enterprise EquipmentHeader
 * Displays high-contrast industrial identity, serial tag, telemetry status,
 * and operational metadata.
 */
export function EquipmentHeader({ equipment, className }: EquipmentHeaderProps): React.ReactElement {
  const config = equipmentConfig[equipment.type];
  const Icon = config?.icon ?? Cpu;

  return (
    <div className={clsx('industrial-card rounded-2xl p-5 border border-slate-800/90 shadow-xl relative overflow-hidden', className)}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Icon & Asset Identity */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10 text-blue-400">
            <Icon size={26} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 className="text-xl font-black text-slate-100 tracking-tight truncate">
                {equipment.name}
              </h1>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800/90 text-blue-400 border border-slate-700/80">
                {equipment.id}
              </span>
              <StatusBadge status={equipment.status} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cpu size={13} className="text-slate-500" aria-hidden="true" />
                <span className="text-slate-300 font-medium">{config?.displayName ?? equipment.type}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-500" aria-hidden="true" />
                <span className="text-slate-300">{equipment.location}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Hash size={13} className="text-slate-500" aria-hidden="true" />
                <span className="font-mono text-slate-400">{equipment.model} · {equipment.manufacturer}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Operational Runtime & Live Status */}
        <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-right">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Total Runtime</span>
            <span className="text-sm font-bold font-mono text-slate-200">
              {equipment.operatingHours.toLocaleString()} <span className="text-[11px] text-slate-400 font-normal">hrs</span>
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-right">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Next Service</span>
            <span className="text-xs font-mono text-slate-300">
              {equipment.nextMaintenanceDate}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            LIVE
          </div>
        </div>
      </div>
    </div>
  );
}
