import React from 'react';
import { AlertTriangle, X, Shield } from 'lucide-react';
import { t } from '~utils/commonFunction';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'red' | 'orange' | 'purple';
  iconType?: 'warning' | 'security';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmText = t('dlg_confirm_confirm'),
  cancelText = t('dlg_confirm_cancel'),
  confirmColor = 'red',
  iconType = 'warning',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const colorStyles = {
    red: 'bg-red-600 hover:bg-red-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  };

  const iconConfig = {
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    security: {
      icon: Shield,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  };

  const Icon = iconConfig[iconType].icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 ${iconConfig[iconType].bgColor} rounded-full flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${iconConfig[iconType].iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-2 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-base rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-white text-base rounded-lg transition-colors font-medium ${colorStyles[confirmColor]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}