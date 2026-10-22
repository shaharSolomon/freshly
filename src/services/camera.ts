import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

/** Long edge in pixels. Enough to read receipt text, small enough to upload fast on mobile data. */
const MAX_EDGE = 1600;

/** Opens the camera (or the gallery) and returns a resized JPEG as base64, or null if cancelled. */
export async function captureReceipt(source: 'camera' | 'library'): Promise<string | null> {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return null;
  }
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1 };
  const result =
    source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > MAX_EDGE) {
    context.resize(asset.height >= asset.width ? { height: MAX_EDGE } : { width: MAX_EDGE });
  }
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
  return saved.base64 ?? null;
}
