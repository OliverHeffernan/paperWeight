export default interface OpenAIImgURLFormat {
	type: "image_url" | "text";
	image_url?: {
		url: string;
	};
	text?: string;
}
