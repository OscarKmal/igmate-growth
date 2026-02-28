import { Dialog, DialogContent, DialogTitle } from '~components/ui/dialog';
import { Button } from '~components/ui/button';
import { PremiumUpgradeCard } from '~components/ui/premium-upgrade-card';
import {openPricePage, t} from '~utils/commonFunction'

interface FollowUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FollowUpgradeDialog({
  open,
  onOpenChange,
}: FollowUpgradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Dialog</DialogTitle>
		<div className="space-y-4 py-2">
          <PremiumUpgradeCard
            showLimitInfo={false}
            limitType="monthly"
            currentUsage={1}
            dailyLimit={1}
            limitDescription={t('tab_upgrade_desc')}
            onUpgrade={() => {
			        openPricePage();
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

