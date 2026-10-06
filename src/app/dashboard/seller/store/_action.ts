import axios from "axios";

export const uploadImages = async (uploadFormData: any, imgType: string) => {
  const uploadResponse = await axios.post(
    `/api/upload/${imgType}`,
    uploadFormData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return uploadResponse;
};
