export const heroImage =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80";

export const categories = [
  { label: "Cleaners", category: "Cleaning", icon: "clean" },
  { label: "Handymen", category: "Handyman", icon: "tool" },
  { label: "Plumbers", category: "Plumbing", icon: "drop" },
  { label: "Electrical pros", category: "Electrical", icon: "bolt" },
  { label: "Painters", category: "Painting", icon: "paint" },
  { label: "Tutors", category: "Tutoring", icon: "book" },
  { label: "Baby care", category: "Baby care", icon: "heart" },
  { label: "Mechanics", category: "Mechanics", icon: "car" },
];

export const projects = [
  {
    title: "House Cleaning",
    category: "Cleaning",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Plumbing repair",
    category: "Plumbing",
    image:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Home tutoring",
    category: "Tutoring",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Auto repair",
    category: "Mechanics",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80",
  },
];

export const exploreGroups = [
  {
    id: "maintenance",
    label: "Home maintenance",
    intro: "The chores that used to take a whole weekend can be handed to a local pro.",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=80",
    items: [
      {
        title: "House Cleaning",
        category: "Cleaning",
        image:
          "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Electrical fix",
        category: "Electrical",
        image:
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Interior painting",
        category: "Painting",
        image:
          "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "care",
    label: "Care and learning",
    intro: "Find someone nearby for lessons, childcare, and day-to-day help.",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=80",
    items: [
      {
        title: "Tutoring",
        category: "Tutoring",
        image:
          "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Baby care",
        category: "Baby care",
        image:
          "https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "House Cleaning",
        category: "Cleaning",
        image:
          "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "repairs",
    label: "Repairs",
    intro: "From a leaking pipe to a car that will not start, compare local pros.",
    image:
      "https://images.unsplash.com/photo-1581094794329-adc8f1c1b0c0?auto=format&fit=crop&w=1400&q=80",
    items: [
      {
        title: "Plumbing",
        category: "Plumbing",
        image:
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Mechanics",
        category: "Mechanics",
        image:
          "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Handyman",
        category: "Handyman",
        image:
          "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];

export const cities = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
];

const imageByCategory = {
  Cleaning: projects[0].image,
  Plumbing: projects[1].image,
  Tutoring: projects[2].image,
  Mechanics: projects[3].image,
  Electrical:
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
  Painting:
    "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80",
  "Baby care":
    "https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=900&q=80",
  Handyman:
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
};

export function imageForCategory(category) {
  return imageByCategory[category] || heroImage;
}
