import {
  createUploadthing,
  type FileRouter,
  UploadThingError,
} from "uploadthing/server";

import { auth } from "@/lib/auth";

const f = createUploadthing();

export const uploadRouter = {
  avatar: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
