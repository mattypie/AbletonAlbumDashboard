import {
  AudioWaveform,
  Brain,
  FolderOpen,
  Gauge,
  type LucideIcon,
  Sliders,
  Waves,
} from "lucide-react";

export type ResourceColor = "green" | "purple" | "blue" | "orange";

export type ResourceType =
  | "guide"
  | "tutorial"
  | "article"
  | "video"
  | "mindset";

export type ResourceCategoryId =
  | "production-guides"
  | "sound-design"
  | "mixing-mastering"
  | "workflow-mindset"
  | "tools-plugins"
  | "file-organization";

export interface ResourceCategory {
  id: ResourceCategoryId;
  title: string;
  description: string;
  icon: LucideIcon;
  color: ResourceColor;
  articleCount: number;
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  categoryId: ResourceCategoryId;
  readMinutes: number;
  addedAt: string;
  imageUrl?: string;
  bookmarked?: boolean;
}

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  guide: "Guide",
  tutorial: "Tutorial",
  article: "Article",
  video: "Video",
  mindset: "Mindset",
};

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    id: "production-guides",
    title: "Production Guides",
    description: "Step-by-step guides for music production workflows.",
    icon: AudioWaveform,
    color: "green",
    articleCount: 24,
  },
  {
    id: "sound-design",
    title: "Sound Design",
    description: "Learn synthesis, sampling, and sound creation.",
    icon: Waves,
    color: "purple",
    articleCount: 18,
  },
  {
    id: "mixing-mastering",
    title: "Mixing & Mastering",
    description: "Tips and techniques for pro-level sound.",
    icon: Sliders,
    color: "blue",
    articleCount: 22,
  },
  {
    id: "workflow-mindset",
    title: "Workflow & Mindset",
    description: "Boost productivity and stay in the creative flow.",
    icon: Brain,
    color: "green",
    articleCount: 16,
  },
  {
    id: "tools-plugins",
    title: "Tools & Plugins",
    description: "Reviews, tutorials and recommendations.",
    icon: Gauge,
    color: "orange",
    articleCount: 20,
  },
  {
    id: "file-organization",
    title: "File Organization",
    description: "Keep your projects and samples organized.",
    icon: FolderOpen,
    color: "blue",
    articleCount: 14,
  },
];

export const FEATURED_RESOURCES: ResourceItem[] = [
  {
    id: "featured-drum-sound-design",
    title: "The Complete Drum Sound Design Workflow",
    description: "Design punchy, professional drums from scratch.",
    type: "guide",
    categoryId: "sound-design",
    readMinutes: 10,
    addedAt: "2024-05-22",
  },
  {
    id: "featured-atmospheric-pads",
    title: "Building Atmospheric Pads in 5 Steps",
    description: "Create lush, cinematic pads using layers and motion.",
    type: "tutorial",
    categoryId: "sound-design",
    readMinutes: 8,
    addedAt: "2024-05-21",
  },
  {
    id: "featured-mixing-drums",
    title: "Mixing Drums for Punch and Clarity",
    description: "Pro tips for balancing, EQ, and compression.",
    type: "article",
    categoryId: "mixing-mastering",
    readMinutes: 7,
    addedAt: "2024-05-19",
  },
  {
    id: "featured-producers-routine",
    title: "Staying Consistent: A Producer's Routine",
    description: "Build habits that help you finish more music.",
    type: "mindset",
    categoryId: "workflow-mindset",
    readMinutes: 6,
    addedAt: "2024-05-17",
  },
];

export const RECENT_RESOURCES: ResourceItem[] = [
  {
    id: "recent-sidechain",
    title: "Sidechain Compression: The Right Way",
    description: "Use sidechaining for groove and clarity without pumping.",
    type: "article",
    categoryId: "mixing-mastering",
    readMinutes: 6,
    addedAt: "2024-05-20",
  },
  {
    id: "recent-serum-wavetables",
    title: "Serum Basics: Wavetables Explained",
    description: "Understand wavetable synthesis from the ground up.",
    type: "tutorial",
    categoryId: "sound-design",
    readMinutes: 9,
    addedAt: "2024-05-18",
  },
  {
    id: "recent-reference-tracks",
    title: "Reference Tracks: How to Use Them",
    description: "Pick references and A/B effectively while mixing.",
    type: "article",
    categoryId: "mixing-mastering",
    readMinutes: 5,
    addedAt: "2024-05-16",
  },
  {
    id: "recent-creative-chords",
    title: "Creative Chord Progressions",
    description: "Move beyond I-V-vi-IV with voicings and substitutions.",
    type: "guide",
    categoryId: "production-guides",
    readMinutes: 12,
    addedAt: "2024-05-15",
  },
  {
    id: "recent-arrangement-impact",
    title: "Arrangement Tips: Build with Impact",
    description: "Arrange tracks that pull listeners through every section.",
    type: "video",
    categoryId: "production-guides",
    readMinutes: 11,
    addedAt: "2024-05-13",
  },
  {
    id: "recent-vocal-chain",
    title: "A Modern Vocal Chain From Top to Bottom",
    description: "EQ, compression, saturation, and effects for vocals.",
    type: "guide",
    categoryId: "mixing-mastering",
    readMinutes: 14,
    addedAt: "2024-05-11",
  },
  {
    id: "recent-finish-more-music",
    title: "Finish More Music: Beating Perfectionism",
    description: "Strategies to stop tweaking and start releasing.",
    type: "mindset",
    categoryId: "workflow-mindset",
    readMinutes: 7,
    addedAt: "2024-05-09",
  },
  {
    id: "recent-sample-libraries",
    title: "Organizing Your Sample Libraries",
    description: "A practical taxonomy for thousands of one-shots and loops.",
    type: "guide",
    categoryId: "file-organization",
    readMinutes: 8,
    addedAt: "2024-05-07",
  },
  {
    id: "recent-saturation-explained",
    title: "Saturation Explained: Tape, Tube, and Transformer",
    description: "Choose the right flavor of warmth for each source.",
    type: "article",
    categoryId: "mixing-mastering",
    readMinutes: 9,
    addedAt: "2024-05-05",
  },
  {
    id: "recent-best-free-plugins",
    title: "The Best Free Plugins of 2024",
    description: "Hand-picked synths, effects, and utilities at no cost.",
    type: "article",
    categoryId: "tools-plugins",
    readMinutes: 6,
    addedAt: "2024-05-03",
  },
];
