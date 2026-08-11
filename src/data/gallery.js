// Single source of truth for gallery items — used by both the homepage
// slider and the full /portfolio page.
//
// Images are real photos from Lorem Picsum (a free, license-free stock
// placeholder service — https://picsum.photos) standing in for actual
// client work. They are NOT photos of any real Hoe Multimedia Concept
// shoot — swap the `image` URL for a real photo/still the moment the
// client supplies one. Captions are kept as general categories
// ("Wedding Photography") rather than specific claims ("Wedding · 14 Feb
// 2026, Ibadan") so nothing here reads as a fabricated portfolio credit.

export const CATEGORIES = ["All", "Photo", "Video", "Live", "Drone"];

export const GALLERY = [
  { label: "Wedding Photography", tag: "PHOTO", category: "Photo", image: "https://picsum.photos/seed/hoe-wedding/900/1125", from: "#d9c4a0", to: "#8a6a4a" },
  { label: "Corporate Coverage", tag: "VIDEO", category: "Video", image: "https://picsum.photos/seed/hoe-corporate/900/1125", from: "#c9a887", to: "#5a4534" },
  { label: "Real Estate Aerials", tag: "DRONE", category: "Drone", image: "https://picsum.photos/seed/hoe-realestate/900/1125", from: "#a45c4b", to: "#3d2a22" },
  { label: "Church & Event Live", tag: "LIVE", category: "Live", image: "https://picsum.photos/seed/hoe-church/900/1125", from: "#e3cfa8", to: "#6b5138" },
  { label: "Portrait Sessions", tag: "PHOTO", category: "Photo", image: "https://picsum.photos/seed/hoe-portrait/900/1125", from: "#d4b980", to: "#4a382b" },
  { label: "Landscape Aerials", tag: "DRONE", category: "Drone", image: "https://picsum.photos/seed/hoe-landscape/900/1125", from: "#b08a4e", to: "#2e2118" },
  { label: "Product Photography", tag: "PHOTO", category: "Photo", image: "https://picsum.photos/seed/hoe-product/900/1125", from: "#e7d9bf", to: "#5a4534" },
  { label: "Brand Films", tag: "VIDEO", category: "Video", image: "https://picsum.photos/seed/hoe-brandfilm/900/1125", from: "#c9a887", to: "#362a21" },
  { label: "Conference Streaming", tag: "LIVE", category: "Live", image: "https://picsum.photos/seed/hoe-conference/900/1125", from: "#a45c4b", to: "#241c16" },
];
