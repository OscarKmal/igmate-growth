import browser from 'webextension-polyfill';
import howToUseGif from "data-base64:@/assets/howtouse.gif";

/**
 * 引导内容组件
 * 
 * 用途：
 * - 在 Popup 首次打开的引导页中展示“如何使用”的动图与快速步骤说明。
 * 
 * 返回值：
 * - React JSX 元素片段（包含 GIF 展示区、步骤区、提示区）。
 */
export function GuidContent(){
	return (
		<>
			{/* Guide GIF Placeholder */}
			<div className="relative w-full aspect-video bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-lg border-2 border-purple-200 overflow-hidden">
				<img
					src={howToUseGif}
					className="absolute inset-0 h-full w-full object-contain"
					alt="How to use"
				/>
			</div>
					
			{/* Quick Steps */}
			<div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
			  <h4 className="text-base font-medium text-gray-900 mb-3">{browser.i18n.getMessage('pop_guide_quikstart')}</h4>
			  <div className="space-y-2.5">
			    <div className="flex gap-2.5">
			      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium">
			        1
			      </div>
			      <div className="flex-1">
			        <p className="text-base text-gray-800">{browser.i18n.getMessage('pop_guide_quik_title1')}</p>
			        <p className="text-sm text-gray-500 mt-0.5">{browser.i18n.getMessage('pop_guide_quik_desc1')}</p>
			      </div>
			    </div>
			    
			    <div className="flex gap-2.5">
			      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium">
			        2
			      </div>
			      <div className="flex-1">
			        <p className="text-base text-gray-800">{browser.i18n.getMessage('pop_guide_quik_title2')}</p>
			        <p className="text-sm text-gray-500 mt-0.5">{browser.i18n.getMessage('pop_guide_quik_desc2')}</p>
			      </div>
			    </div>
			    
			    <div className="flex gap-2.5">
			      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium">
			        3
			      </div>
			      <div className="flex-1">
			        <p className="text-base text-gray-800">{browser.i18n.getMessage('pop_guide_quik_title3')}</p>
			        <p className="text-sm text-gray-500 mt-0.5">{browser.i18n.getMessage('pop_guide_quik_desc3')}</p>
			      </div>
			    </div>
			    
			    {/* <div className="flex gap-2.5">
			      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium">
			        4
			      </div>
			      <div className="flex-1">
			        <p className="text-sm text-gray-800">{browser.i18n.getMessage('pop_guide_quik_title4')}</p>
			        <p className="text-xs text-gray-500 mt-0.5">{browser.i18n.getMessage('pop_guide_quik_desc4')}</p>
			      </div>
			    </div> */}
			  </div>
			</div>
					
			{/* Tips */}
			{/* <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
			  <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
			    <AlertCircle className="h-4 w-4" />
							  {browser.i18n.getMessage('pop_guide_tip_title')}
			  </h4>
			  <ul className="space-y-1 text-xs text-blue-800">
			    <li>• {browser.i18n.getMessage('pop_guide_tip1')}</li>
			    <li>• {browser.i18n.getMessage('pop_guide_tip2')}</li>
			    <li>• {browser.i18n.getMessage('pop_guide_tip3')}</li>
			    <li>• {browser.i18n.getMessage('pop_guide_tip4')}</li>
			  </ul>
			</div> */}
		</>
	);
}