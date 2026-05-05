"use client";

import { generateUploadButton } from "@uploadthing/react";

import type { UploadRouter } from "@/lib/uploadthing";

export const AvatarUploadButton = generateUploadButton<UploadRouter>();
