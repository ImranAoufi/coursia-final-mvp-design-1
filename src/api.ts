// 🌍 BASE URL – automatisch Render oder lokal
const DEFAULT_LOCAL = "http://127.0.0.1:8000";
const base = import.meta.env.VITE_API_BASE || DEFAULT_LOCAL;

// ---------------------------------------------------------
// TEST
// ---------------------------------------------------------
export async function testBackend() {
    const response = await fetch(`${base}/`);
    return response.json();
}

// ---------------------------------------------------------
// Beispiel
// ---------------------------------------------------------
export async function generateFromBackend(topic: string) {
    const response = await fetch(`${base}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
    });

    return response.json();
}

// ---------------------------------------------------------
// PREVIEW COURSE
// ---------------------------------------------------------
export interface PreviewRequest {
    prompt: string;
    num_lessons?: number;
    videos_per_lesson?: number;
    include_quiz: boolean;
    include_workbook: boolean;
    transformation?: string;
    audience?: string;
    level?: string;
    format?: "Micro" | "Standard" | "Masterclass";
}

export async function generatePreviewCourse(payload: PreviewRequest) {
    try {
        const url = `${base}/api/preview-course`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`API error ${res.status}: ${text}`);
        }

        return await res.json();
    } catch (err) {
        console.error("generatePreviewCourse error:", err);
        throw err;
    }
}

// ---------------------------------------------------------
// OUTCOME SEND
// ---------------------------------------------------------
export async function sendOutcomeToBackend(outcome: string) {
    try {
        const res = await fetch(`${base}/api/preview-course`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: outcome,
                num_lessons: 5,
                videos_per_lesson: 2,
                include_quiz: true,
                include_workbook: true,
            }),
        });

        return await res.json();
    } catch (err) {
        console.error("❌ Error sending outcome:", err);
    }
}

// ---------------------------------------------------------
// AUDIENCE SEND
// ---------------------------------------------------------
export async function sendAudienceToBackend(audience: string, audienceLevel: string) {
    try {
        const res = await fetch(`${base}/api/audience`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audience, audienceLevel }),
        });

        if (!res.ok) throw new Error(`API error ${res.status}`);

        return await res.json();
    } catch (err) {
        console.error("❌ sendAudienceToBackend failed:", err);
        throw err;
    }
}

// ---------------------------------------------------------
// MATERIAL UPLOAD
// ---------------------------------------------------------
export async function uploadMaterialsToBackend(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await fetch(`${base}/api/materials`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
}

// ---------------------------------------------------------
// FULL COURSE GENERATION
// ---------------------------------------------------------
export async function generateFullCourse(courseData?: any) {
    try {
        const response = await fetch(`${base}/api/generate-full-course`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(courseData || {}),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text);
        }

        return await response.json();
    } catch (err) {
        console.error("💥 Full course generation failed:", err);
        throw err;
    }
}

// ---------------------------------------------------------
// JOB POLLING
// ---------------------------------------------------------
export async function pollJobStatus(jobId: string, onProgress?: (status: string) => void) {
    while (true) {
        const res = await fetch(`${base}/api/job-status/${jobId}`);
        const data = await res.json();

        if (onProgress) onProgress(data.status);

        if (data.status === "done" && data.result) {
            sessionStorage.setItem("coursia_full_course", JSON.stringify(data.result));
            return data.result;
        }

        if (data.status === "failed") {
            throw new Error("Course generation failed");
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
    }
}
