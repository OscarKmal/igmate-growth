import { Dialog, DialogContent,DialogTitle } from '~components/ui/dialog';
import { Button } from '~components/ui/button';
import { PremiumUpgradeCard } from '~components/ui/premium-upgrade-card';
import {openPricePage, t} from '~utils/commonFunction'

interface DailyFollowOverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dailyUsedCount: number,
  freeUserDailyLimit: number,
  setShowReferralDialog: (open: boolean) => void;
}

export function DailyFollowOverDialog({
  open,
  onOpenChange,
  dailyUsedCount,
  freeUserDailyLimit,
  setShowReferralDialog
}: DailyFollowOverDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>

        <DialogTitle className="sr-only">{t("dlg_common_a11y_dialog_title")}</DialogTitle>
		<div className="space-y-4 py-2">
          <PremiumUpgradeCard
            currentUsage={dailyUsedCount}
            dailyLimit={freeUserDailyLimit}
            onUpgrade={openPricePage}
          />
		  
		  {/* <Button
		    variant="outline"
		    onClick={() => {
				onOpenChange(false);
				setShowReferralDialog(true);
			}}
		    className="w-full"
		    size="lg"
		  >
		    {t('tab_progress_unfollow_tomorrow')}
		  </Button> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}

