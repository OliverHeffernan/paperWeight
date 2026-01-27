export default interface OpenAIImgFormat {
	type: "image_url" | "text";
	image_url?: {
		url: string;
	};
	text?: string;
}
