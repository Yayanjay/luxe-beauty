<template>
  <div class="space-y-4">
    <!-- Upload Area -->
    <div
      :class="[
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400',
        isUploading ? 'pointer-events-none opacity-50' : ''
      ]"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        :multiple="multiple"
        class="hidden"
        @change="handleFileSelect"
      >
      <div class="space-y-2">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p class="text-sm text-gray-600">
          <span class="font-medium text-primary">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs text-gray-500">
          PNG, JPG, GIF up to 5MB
        </p>
        <p v-if="multiple" class="text-xs text-gray-500">
          You can upload multiple images
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isUploading" class="flex items-center justify-center space-x-2 text-sm text-gray-600">
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span>Uploading...</span>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Image Previews -->
    <div v-if="modelValue.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div
        v-for="(image, index) in modelValue"
        :key="typeof image === 'string' ? image : image.id || image.url"
        class="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
      >
        <img
          :src="typeof image === 'string' ? image : image.url"
          :alt="typeof image === 'string' ? 'Uploaded image' : (image.alt || 'Product image')"
          class="w-full h-full object-cover"
        >
        
        <!-- Hover Actions -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            v-if="multiple && index > 0"
            type="button"
            class="p-1 bg-white rounded-full text-gray-600 hover:text-gray-900 mx-1"
            @click="moveImage(index, -1)"
            title="Move left"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            class="p-1 bg-white rounded-full text-red-600 hover:text-red-900 mx-1"
            @click="removeImage(index)"
            title="Remove image"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            v-if="multiple && index < modelValue.length - 1"
            type="button"
            class="p-1 bg-white rounded-full text-gray-600 hover:text-gray-900 mx-1"
            @click="moveImage(index, 1)"
            title="Move right"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Position Badge for Multiple Images -->
        <div v-if="multiple && modelValue.length > 1" class="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
          {{ index + 1 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import uploadApi from '@/api/upload';

interface ImageItem {
  id?: string;
  url: string;
  key?: string;
  alt?: string | null;
}

interface Props {
  modelValue: (string | ImageItem)[];
  multiple?: boolean;
  folder?: string;
  onUpload?: (file: File) => Promise<{ url: string; key?: string }>;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  folder: 'products',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | ImageItem)[]): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const isUploading = ref(false);
const error = ref<string | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const validateFile = (file: File): string | null => {
  if (!file.type.startsWith('image/')) {
    return 'File must be an image';
  }
  if (file.size > 5 * 1024 * 1024) {
    return 'File must be less than 5MB';
  }
  return null;
};

const uploadFile = async (file: File): Promise<ImageItem> => {
  if (props.onUpload) {
    // Use custom upload handler (e.g., for products API)
    const response = await props.onUpload(file);
    return {
      url: response.url,
      key: response.key,
    };
  } else {
    // Use default S3 upload
    const response = await uploadApi.uploadImage(file, props.folder);
    return {
      url: response.url,
      key: response.key,
    };
  }
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  await processFiles(files);
  target.value = ''; // Reset input
};

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false;
  const files = Array.from(event.dataTransfer?.files || []);
  await processFiles(files);
};

const processFiles = async (files: File[]) => {
  if (files.length === 0) return;

  // Validate all files first
  for (const file of files) {
    const validationError = validateFile(file);
    if (validationError) {
      error.value = validationError;
      return;
    }
  }

  error.value = null;
  isUploading.value = true;

  try {
    const newImages: ImageItem[] = [];
    
    for (const file of files) {
      const uploaded = await uploadFile(file);
      newImages.push(uploaded);
    }

    // If not multiple, replace all images; if multiple, append
    if (!props.multiple) {
      emit('update:modelValue', newImages);
    } else {
      emit('update:modelValue', [...props.modelValue, ...newImages]);
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to upload image';
  } finally {
    isUploading.value = false;
  }
};

const removeImage = (index: number) => {
  const newImages = [...props.modelValue];
  newImages.splice(index, 1);
  emit('update:modelValue', newImages);
};

const moveImage = (index: number, direction: number) => {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= props.modelValue.length) return;

  const newImages = [...props.modelValue];
  const temp = newImages[index];
  newImages[index] = newImages[newIndex];
  newImages[newIndex] = temp;
  emit('update:modelValue', newImages);
};
</script>
