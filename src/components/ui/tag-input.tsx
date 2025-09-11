import { component$, useStore, $, useSignal, type QRL } from "@builder.io/qwik";

interface TagInputProps {
  value: string[];
  onChange$: QRL<(tags: string[]) => void>;
  placeholder?: string;
  suggestions?: string[];
}

export const TagInput = component$<TagInputProps>(({ value, onChange$, placeholder = "Add tags...", suggestions = [] }) => {
  const state = useStore({
    inputValue: '',
    filteredSuggestions: [] as string[]
  });
  
  const inputRef = useSignal<HTMLInputElement>();

  const handleInputChange = $((event: Event) => {
    const input = event.target as HTMLInputElement;
    state.inputValue = input.value;
    
    if (suggestions.length > 0) {
      state.filteredSuggestions = suggestions
        .filter(suggestion => 
          suggestion.toLowerCase().includes(input.value.toLowerCase()) &&
          !value.includes(suggestion)
        )
        .slice(0, 5);
    }
  });

  const addTag = $((tag: string) => {
    if (tag && !value.includes(tag)) {
      onChange$([...value, tag]);
      state.inputValue = '';
      state.filteredSuggestions = [];
    }
  });

  const removeTag = $((tagToRemove: string) => {
    onChange$(value.filter(tag => tag !== tagToRemove));
  });

  const handleKeyDown = $((event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      if (state.inputValue.trim()) {
        addTag(state.inputValue.trim());
      }
    }
    if (event.key === 'Backspace' && !state.inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  });

  const selectSuggestion = $((suggestion: string) => {
    addTag(suggestion);
    inputRef.value?.focus();
  });

  return (
    <div class="relative">
      <div class="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white">
        <div class="flex flex-wrap gap-1 items-center">
          {value.map((tag) => (
            <span
              key={tag}
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
              <button
                type="button"
                onClick$={() => removeTag(tag)}
                class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-600"
              >
                <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                  <path d="M1.41 1.41a.5.5 0 0 0 0 .71L3.09 4 1.41 5.88a.5.5 0 1 0 .71.71L4 4.91l1.88 1.68a.5.5 0 1 0 .71-.71L4.91 4l1.68-1.88a.5.5 0 1 0-.71-.71L4 3.09 2.12 1.41a.5.5 0 0 0-.71 0z"/>
                </svg>
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={state.inputValue}
            onInput$={handleInputChange}
            onKeyDown$={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            class="flex-1 min-w-[120px] border-0 outline-0 bg-transparent text-sm"
          />
        </div>
      </div>
      
      {state.filteredSuggestions.length > 0 && (
        <ul class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto mt-1">
          {state.filteredSuggestions.map((suggestion) => (
            <li
              key={suggestion}
              onClick$={() => selectSuggestion(suggestion)}
              class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});