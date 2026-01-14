import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
});

import { Video } from "@/types";

export const videoService = {
  getVideos: async (): Promise<Video[]> => {
    try {
      const response = await api.get("/video");
      console.log(response.data.videos);
      return response.data.videos;
    } catch (error) {
      console.error("Failed to fetch videos:", error);
      return [];
    }
  }
};