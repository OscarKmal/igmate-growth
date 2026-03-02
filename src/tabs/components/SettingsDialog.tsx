import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~components/ui/dialog';
import { Button } from '~components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~components/ui/collapsible';
import { Slider } from '~components/ui/slider';
import { Input } from '~components/ui/input';
import { Label } from '~components/ui/label';
import { Settings, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import type { SafetyPreset, levelType } from '~modles/extension';
import { safetyPresets } from '~utils/consts';
import { t } from '~utils/commonFunction';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPreset: levelType;
  showAdvancedSettings: boolean;
  customSettings: {
    requestInterval: number;
    failurePause: number;
    randomRange: number;
  };
  onPresetChange: (level: levelType) => void;
  onAdvancedSettingsChange: (open: boolean) => void;
  onCustomSettingsChange: (settings: { requestInterval: number; failurePause: number; randomRange: number }) => void;
  getCurrentSettings: () => { requestInterval: number; failurePause: number };
  saveSetting: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  selectedPreset,
  showAdvancedSettings,
  customSettings,
  onPresetChange,
  onAdvancedSettingsChange,
  onCustomSettingsChange,
  getCurrentSettings,
  saveSetting
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{t('tab_settings_title')}</DialogTitle>
              <DialogDescription>
                {t('tab_settings_description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preset Selection */}
          <div>
            <h3 className="text-sm mb-3 text-gray-700">{t('tab_settings_choose_preset')}</h3>
            <div className="grid grid-cols-3 gap-3">
              {safetyPresets.map((preset: SafetyPreset) => (
                <button
                  key={preset.level}
                  onClick={() => onPresetChange(preset.level)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedPreset === preset.level
                      ? 'border-indigo-500 bg-white shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${preset.color} text-white mb-2 inline-flex`}>
                    {<preset.icon className='h-5 w-5' />}
                  </div>
                  <h4 className={`text-sm mb-1 ${selectedPreset === preset.level ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {t(`tab_settings_preset_name_${preset.level}`)}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">{t(`tab_settings_preset_description_${preset.level}`)}</p>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">{t('tab_settings_interval')}</p>
                    <p className="text-sm text-gray-900">{preset.settings.requestInterval}s</p>
                  </div>
                  {selectedPreset === preset.level && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-indigo-600 text-xs">
                      <CheckCircle className="h-3 w-3" />
                      <span>{t('tab_settings_selected')}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <Collapsible open={showAdvancedSettings} onOpenChange={onAdvancedSettingsChange}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>{t('tab_settings_advanced')}</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="bg-white rounded-lg p-4 space-y-4 border border-gray-200">
                <div className="flex items-center gap-2 pb-3 border-b">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <p className="text-xs text-gray-600">{t('tab_settings_advanced_warning')}</p>
                </div>

                {/* Request Interval */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{t('tab_settings_request_interval')}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={customSettings.requestInterval}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          onCustomSettingsChange({ ...customSettings, requestInterval: Number(e.target.value) })
                        }
                        className="w-16 h-8 text-center text-sm"
                        min={2}
                        max={180}
                      />
                      <span className="text-xs text-gray-500">{t('tab_settings_seconds')}</span>
                    </div>
                  </div>
                  <Slider
                    value={[customSettings.requestInterval]}
                    onValueChange={(value: number[]) => 
                      onCustomSettingsChange({ ...customSettings, requestInterval: value[0] })
                    }
                    min={2}
                    max={180}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">{t('tab_settings_request_interval_desc')}</p>
                </div>

                {/* Failure Pause */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{t('tab_settings_failure_pause')}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={customSettings.failurePause}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          onCustomSettingsChange({ ...customSettings, failurePause: Number(e.target.value) })
                        }
                        className="w-16 h-8 text-center text-sm"
                        min={60}
                        max={1800}
                      />
                      <span className="text-xs text-gray-500">{t('tab_settings_seconds')}</span>
                    </div>
                  </div>
                  <Slider
                    value={[customSettings.failurePause]}
                    onValueChange={(value: number[]) => 
                      onCustomSettingsChange({ ...customSettings, failurePause: value[0] })
                    }
                    min={60}
                    max={1800}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">{t('tab_settings_failure_pause_desc')}</p>
                </div>

                {/* Random Range */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{t('tab_settings_random_range')}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={customSettings.randomRange}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          onCustomSettingsChange({ ...customSettings, randomRange: Number(e.target.value) })
                        }
                        className="w-16 h-8 text-center text-sm"
                        min={0}
                        max={30}
                      />
                      <span className="text-xs text-gray-500">{t('tab_settings_seconds')}</span>
                    </div>
                  </div>
                  <Slider
                    value={[customSettings.randomRange]}
                    onValueChange={(value: number[]) => 
                      onCustomSettingsChange({ ...customSettings, randomRange: value[0] })
                    }
                    min={0}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">{t('tab_settings_random_range_desc')}</p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Current Settings Summary */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-900">{t('tab_settings_active')}</span>
            </div>
            <div className="text-xs text-green-700">
              {t('tab_settings_request_interval')}: {getCurrentSettings().requestInterval}s • {t('tab_settings_failure_pause')}: {getCurrentSettings().failurePause}s
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={saveSetting}>
            {t('tab_settings_save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
