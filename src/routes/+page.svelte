<script lang="ts">
  let file: File | null = null;
  let result: any = null;
  let loading: boolean = false;
  let error: string | null = null;
  let imagePreview: string | null = null;
  let extractedText: string = "";

  async function analyzeImage() {
    if (!file) return;

    loading = true;
    error = null;
    result = null;
    extractedText = "";

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/vision", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error(`Analysis failed: ${res.statusText}`);
      }

      result = await res.json();

      // Flatten OCR text
      if (result?.regions?.length > 0) {
        extractedText = result.regions
          .flatMap((region: any) =>
            region.lines.map((line: any) =>
              line.words.map((w: any) => w.text).join(" ")
            )
          )
          .join("\n");
      }
    } catch (err: any) {
      error = err.message || "An unknown error occurred";
    } finally {
      loading = false;
    }
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0] || null;

    if (selectedFile) {
      file = selectedFile;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      // Auto-analyze
      analyzeImage();
    }
  }

  function retryAnalysis() {
    if (file) {
      analyzeImage();
    }
  }

  function copyText() {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
    }
  }
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div class="w-full max-w-2xl bg-white rounded-xl shadow-sm p-6">
    <h1 class="text-2xl font-light text-gray-800 mb-6 text-center">OCR Image Analyzer</h1>

    <!-- File Input -->
    <div class="mb-6">
      <label for="file-input" class="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
      <input 
        id="file-input"
        type="file" 
        accept="image/*" 
        on:change={handleFileSelect}
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>

    <!-- Preview -->
    {#if imagePreview}
      <div class="mb-6 flex justify-center">
        <img src={imagePreview} alt="Preview" class="max-h-64 rounded-lg shadow-sm" />
      </div>
    {/if}

    <!-- Loading State -->
    {#if loading}
      <div class="flex flex-col items-center justify-center py-12">
        <div class="w-12 h-12 border-t-2 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
        <p class="text-gray-600">Analyzing image...</p>
      </div>
    {/if}

    <!-- Error State -->
    {#if error && !loading}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="text-red-800 font-medium">Error</h3>
        </div>
        <p class="text-red-700 mt-1 text-sm">{error}</p>
        <button 
          on:click={retryAnalysis}
          class="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Retry Analysis
        </button>
      </div>
    {/if}

    <!-- Results -->
    {#if extractedText && !loading}
      <div class="space-y-4">
        <h2 class="text-lg font-medium text-gray-800">Extracted Text</h2>
        <textarea
          rows="10"
          bind:value={extractedText}
          class="w-full p-3 border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
        <button 
          on:click={copyText}
          class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Copy All Text
        </button>
      </div>
    {/if}
  </div>
</div>
