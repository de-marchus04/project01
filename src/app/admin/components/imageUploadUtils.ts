import { uploadImageToCloud } from "@/shared/api/uploadApi";

/**
 * Handles file input change for the shared "main image" upload in item forms.
 * Resizes the image to at most 1200x1200 and uploads it to cloud storage,
 * then sets the value of the DOM element with id="mainImageUrlInput".
 */
export const handleMainImageUpload = (
  e: React.ChangeEvent<HTMLInputElement>,
  uploadingLabel: string
) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onloadend = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 1200;
      let w = img.width;
      let h = img.height;
      if (w > h) {
        if (w > MAX) { h *= MAX / w; w = MAX; }
      } else {
        if (h > MAX) { w *= MAX / h; h = MAX; }
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const input = document.getElementById('mainImageUrlInput') as HTMLInputElement;
      if (input) input.value = uploadingLabel;
      uploadImageToCloud(dataUrl)
        .then(cloudUrl => { if (input) input.value = cloudUrl; })
        .catch(err => {
          console.error('Cloudinary fallback', err);
          if (input) input.value = dataUrl;
        });
    };
    img.src = reader.result as string;
  };
  reader.readAsDataURL(file);
};
