// src/routes/api/vision/+server.ts
import { AZURE_KEY } from "$env/static/private";
import type { RequestHandler } from "@sveltejs/kit";

const endpoint = "https://imageanalyzer-abrar.cognitiveservices.azure.com";
const key = AZURE_KEY as string; // make sure this is in your .env

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const mode = (formData.get("mode") as string) || "analyze"; // default = analyze

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    // convert file → arrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // pick correct endpoint
    let url = `${endpoint}/vision/v3.2/analyze?visualFeatures=Categories,Description,Objects,Tags,Color`;

    if (mode === "detect") {
      url = `${endpoint}/vision/v3.2/detect`;
    } else if (mode === "describe") {
      url = `${endpoint}/vision/v3.2/describe`;
    } else if (mode === "ocr") {
      url = `${endpoint}/vision/v3.2/ocr`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/octet-stream"
      },
      body: arrayBuffer
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (err: any) {
    console.error("Vision API error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
