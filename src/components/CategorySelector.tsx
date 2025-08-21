import React from "react";

type Category = "story" | "music" | "nature" | "other";

interface CategorySelectorProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const categories: { value: Category; label: string; emoji: string }[] = [
  { value: "story", label: "Personal Story", emoji: "💬" },
  { value: "music", label: "Music/Performance", emoji: "🎵" },
  { value: "nature", label: "Nature Sounds", emoji: "🌿" },
  { value: "other", label: "Other", emoji: "🎙️" },
];

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Kategori *
      </label>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <label
            key={category.value}
            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedCategory === category.value
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <input
              type="radio"
              name="category"
              value={category.value}
              checked={selectedCategory === category.value}
              onChange={(e) => onCategoryChange(e.target.value as Category)}
              className="sr-only"
            />
            <span className="text-lg mr-2">{category.emoji}</span>
            <span className="text-sm font-medium">{category.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
