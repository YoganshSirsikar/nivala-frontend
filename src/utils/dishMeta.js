export const fallbackFoodImage = "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80";
const gulabJamunImage = "https://commons.wikimedia.org/wiki/Special:FilePath/Gulabjamun.jpg?width=960";

export const getDishImage = (dish) =>
  dish.name.toLowerCase().includes("gulab jamun") ? gulabJamunImage : dish.image;

export const getDishMeta = (dish) => ({
  isVegetarian: dish.isVegetarian ?? true,
  prepTime: dish.prepTime || "25–35 min",
  serves: dish.serves || "Serves 1",
  ingredients: dish.ingredients?.length
    ? dish.ingredients
    : ["Fresh ingredients", "House spice blend", "Made to order"],
  allergens: dish.allergens?.length
    ? dish.allergens
    : ["Please ask the kitchen about allergens before ordering."],
  isAvailable: dish.isAvailable ?? true,
  reviewCount: dish.reviewCount ?? Math.max(8, Math.round((dish.rating || 4.5) * 23)),
  story: dish.story || `Prepared with care by ${dish.channel}, this ${dish.category?.toLowerCase() || "home-style"} favourite brings familiar comfort to every bite.`,
});
