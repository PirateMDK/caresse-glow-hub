import { supabase } from "@/integrations/supabase/client";

/** Uploads a file to the private "media" bucket and returns a public proxy URL. */
export async function uploadMedia(file: File, folder = "uploads") {
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw error;
  return `/api/public/media/${path}`;
}
