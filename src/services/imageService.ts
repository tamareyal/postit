import api from './api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export type UploadResponse = {
	path: string;
};

export const toStaticImageUrl = (imagePath?: string | null) => {
	if (!imagePath) return undefined;
	if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
	return `${BACKEND_URL}/${imagePath.replace(/^\/+/, '')}`;
};

export const uploadPostImage = async (file: File): Promise<UploadResponse> => {
	const formData = new FormData();
	formData.append('image', file);

	const res = await api.post<UploadResponse>('/api/general/upload', formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});

	return res.data;
};

export const deleteUploadedImage = async (filename: string) => {
	await api.delete(`/api/general/upload/${filename}`);
};