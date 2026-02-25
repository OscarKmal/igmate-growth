import type { PlasmoMessaging } from "@plasmohq/messaging"
import { onOpenTab } from '~utils/commonFunction';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    try{
		const { type, data } = req.body;
		if(type == 'comment'){
			await onOpenTab(null, null, data.url);
		}
		return res.send({success: true})
    }catch(error){
        console.log(error);
		return res.send({success: false})
    }
}

export default handler