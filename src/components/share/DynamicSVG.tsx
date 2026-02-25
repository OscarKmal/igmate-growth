import DOMPurify from 'dompurify';
import { forwardRef, useImperativeHandle, useRef } from "react";
import { downloadSvgAsPng } from '~utils/commonFunction';

interface DynamicSVGProps {
	svg: string;
	params?: Record<string, any>;
}

export const DynamicSVG = forwardRef(({ svg, params = {} }: DynamicSVGProps, ref) => {
	if(!svg) return <div />;
	const containerRef = useRef<HTMLDivElement>(null);
	
	useImperativeHandle(ref, () => ({
	    downloadPNG,
	}));
	
	const replaced = Object.keys(params).reduce((acc, key) => {
		const regex = new RegExp(`{${key}}`, "g");
		return acc.replace(regex, String(params[key]));
	}, svg);
		  
	const safe = DOMPurify.sanitize(replaced, {
		USE_PROFILES: { svg: true },
	});
	
	const downloadPNG = (imgName: string) => {
	    downloadSvgAsPng(safe, imgName, 3);
	};
	
	return (
		<div ref={containerRef}
			dangerouslySetInnerHTML={{ __html: safe }}
		/>
	);	
});
