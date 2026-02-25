import type { DownloadPostHistory, PostComment } from "~modles/extension";
import { getCommentsList, removeHisData, saveHisData } from "./commonFunction";
import { getStorage, removeStorage, setStorage } from "./functions";
import { storageName } from "./consts";

export const commentController = {
	currentDownloadId: 0,
	isRunning: false,
	paused: false,
	cancled: false,
	stopped: false,
    processed: 0,
    total: 0,
	downloadedCount: 0,
	hasExtended: false,
	downloadData: null as DownloadPostHistory | null,
	postUrl: '',
	waitTime: 0,

    isValid(downloadId: number) {
    	return downloadId === this.currentDownloadId;
    },
	async pause() {
        this.paused = true;
		this.downloadData.status = 'paused';
        await this.saveDownloadHis();
    },
    async resume(downloadId: number) {
        this.paused = false;
		this.stopped = false;
		this.downloadData.status = 'in-progress';
        await this.saveDownloadHis();
		if(!this.isRunning){
			this.currentDownloadId = downloadId;
			const flag = await getCommentsList(this.postUrl, downloadId);
			if(this.isValid(downloadId)&&flag){
				this.downloadData.status = 'completed';
				this.downloadData.downloadedEnd = Date.now();
				await this.saveDownloadHis();
			}
		}
    },
	async cancle() {
		this.cancled = true;
		await removeHisData(this.downloadData);
		const commentsKey = storageName.postCommentsStorageName+'_'+this.downloadData.id;
		await removeStorage(commentsKey);
	},
	async stope() {
		this.stopped = true;
		this.downloadData.status = 'paused';
		await this.saveDownloadHis();
	},
    async saveDownloadHis() {
		if(!this.cancled&&this.downloadData?.id){
			await saveHisData(this.downloadData);
		}
	},
	initData(currentDownloadData: DownloadPostHistory, hasExtended: boolean, url: string, downloadId:number=Date.now()){
		this.reset();
		this.currentDownloadId = downloadId;
		this.postUrl = url;
		this.total = currentDownloadData.totalComments;
		this.downloadedCount = currentDownloadData.downloadedComments;
		this.processed = parseFloat(((this.downloadedCount / this.total) * 100).toFixed(2));
		this.hasExtended = hasExtended;
		this.downloadData = currentDownloadData;
	},
    reset() {
        this.currentDownloadId = 0;
		this.isRunning = false;
		this.paused = false;
		this.cancled = false;
		this.stopped = false;
        this.processed = 0;
        this.total = 0;
        this.downloadedCount = 0;
        this.hasExtended = false;
		this.downloadData = {};
		this.postUrl = '';
		this.waitTime = 0;
    },
	async success(finalComments: PostComment[]){
		if(!this.cancled){
			const commentsKey = storageName.postCommentsStorageName+'_'+this.downloadData.id;
			const postComments = await getStorage(commentsKey)||[];
			const merged = [...postComments, ...finalComments];
			const uniqueComments = Array.from(
				new Map(merged.map(item => [item.id, item])).values()
			);
			await setStorage(commentsKey, uniqueComments);
			this.updateProcessed(uniqueComments.length);
			await this.saveDownloadHis();
		}
	},
	updateProcessed(count: number){
		this.downloadedCount = count;
		this.processed = parseFloat(((this.downloadedCount / this.total) * 100).toFixed(2));
		this.downloadData.downloadedComments = this.downloadedCount;
		this.downloadData.progress = this.processed;
	}
};
