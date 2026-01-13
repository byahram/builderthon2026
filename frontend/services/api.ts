import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

import { Video } from "@/types";

export const videoService = {
  getVideos: async (): Promise<Video[]> => {
    try {
      const response = await axios.get('http://localhost:5000/api/video');
      return response.data.videos;
    } catch (error) {
      console.error("Failed to fetch videos:", error);
      return [];
    }
  }
};

export const chatService = {
  sendMessage: async (message: string) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ status: 200, data: 'echo' }), 1000);
    });
  },
};

export default api;