export interface SampleVideo {
  id: string;
  title: string;
  category: string;
  url: string;
  thumbnail: string;
  duration: string;
}

export const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    id: "big-buck-bunny",
    title: "Big Buck Bunny 🍿",
    category: "3D Animation",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    duration: "09:56",
  },
  {
    id: "tears-of-steel",
    title: "Tears of Steel 🚀",
    category: "Sci-Fi Short Film",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    duration: "12:14",
  },
  {
    id: "sintel",
    title: "Sintel Fantasy Trailer ⚔️",
    category: "Fantasy Movie",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    duration: "00:52",
  },
  {
    id: "cyberpunk-stream",
    title: "Cyberpunk Action Reel 🎵",
    category: "Music & Visuals",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    duration: "00:15",
  },
];
