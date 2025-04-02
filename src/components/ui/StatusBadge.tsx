import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export type StatusType = 'aguardando' | 'em_andamento' | 'finalizado' | 'atrasado' | 'pendente' | 'aprovado' | 'rejeitado';

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  aguardando: {
    label: 'Aguardando Vistoria',
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    icon: Clock,
    iconClass: 'text-yellow-700'
  },
  em_andamento: {
    label: 'Em Andamento',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: Loader2,
    iconClass: 'text-blue-700'
  },
  finalizado: {
    label: 'Finalizado',
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: CheckCircle2,
    iconClass: 'text-green-700'
  },
  atrasado: {
    label: 'Atrasado',
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: AlertCircle,
    iconClass: 'text-red-700'
  },
  pendente: {
    label: 'Pendente',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: Clock,
    iconClass: 'text-gray-700'
  },
  aprovado: {
    label: 'Aprovado',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    icon: CheckCircle2,
    iconClass: 'text-emerald-700'
  },
  rejeitado: {
    label: 'Rejeitado',
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: AlertTriangle,
    iconClass: 'text-red-700'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  showIcon = true, 
  size = 'md', 
  className 
}) => {
  const config = statusConfig[status];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  const IconComponent = config.icon;
  
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        config.bg,
        config.text,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <IconComponent className={cn('h-3.5 w-3.5', config.iconClass)} />}
      {config.label}
    </span>
  );
};

export default StatusBadge;
