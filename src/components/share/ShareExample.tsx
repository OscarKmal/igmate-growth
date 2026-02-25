import { Dialog, DialogContent } from '~components/ui/dialog';
import type { FollowingUser } from '~modles/extension';
import { UnfollowShareDialog } from '~tabs/components/dialogs/UnfollowShareDialog';
import { useState } from 'react';

export function ShareExample() {
	
	const [open, setOpen]=useState(true);
	const onOpenChange = (flag: boolean)=>{
		setOpen(flag);
	}
	const [unfollowResult, setUnfollowResult]=useState({
		count: 1,
		wasStopped: false,
		duration: '10.5',
		users: [] as FollowingUser[],
	});
	const [selectedShareStyle, setSelectedShareStyle]=useState('');
	
	const onShareStyleChange = (style)=>{
		setSelectedShareStyle(style);
	}
	
	const onClose = ()=>{
		setOpen(false);
	}
	
  return (
	<Dialog open={open} onOpenChange={onOpenChange}>
	  <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
		<UnfollowShareDialog
			unfollowResult={unfollowResult} 
			selectedShareStyle={selectedShareStyle} 
			onShareStyleChange={onShareStyleChange}
			onClose={onClose}
		/>
	  </DialogContent>
	</Dialog>
  );
}

