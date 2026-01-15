import axios from "axios";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

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

export const chatService = {
  sendMessage: async (message: string) => {
    try {
      const response = await api.post("/chat", { message });
      return response.data; // { notes: [...] }
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  }
};

import { ReviewNote } from "@/types";

export const reviewService = {
  getReviews: async (): Promise<ReviewNote[]> => {
    try {
      const response = await api.get("/review");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      return [];
    }
  }
};