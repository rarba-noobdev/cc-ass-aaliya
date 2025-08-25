<script lang="ts">
  let file: File | null = $state(null);
  let mode = $state("analyze");
  let analysisPromise: Promise<any> | null = $state(null);
  let dragOver = $state(false);
  let previewUrl = $state("");

  async function analyzeImage(): Promise<any> {
    if (!file) throw new Error("No file selected");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    const res = await fetch("/api/vision", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error(`Analysis failed: ${res.statusText}`);
    }

    return res.json();
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const selectedFile = target.files?.[0] || null;
    setFile(selectedFile);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  }

  function setFile(selectedFile: File | null) {
    file = selectedFile;
    if (file) {
      previewUrl = URL.createObjectURL(file);
      // Auto-analyze when file is selected
      analysisPromise = analyzeImage();
    } else {
      previewUrl = "";
      analysisPromise = null;
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }

  function reanalyze() {
    if (file) {
      analysisPromise = analyzeImage();
    }
  }

  function formatConfidence(confidence: number): string {
    return `${(confidence * 100).toFixed(1)}%`;
  }

  function getConfidenceColor(confidence: number): string {
    if (confidence > 0.9) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (confidence > 0.7) return "bg-blue-100 text-blue-800 border-blue-200";
    if (confidence > 0.5) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  }

  function getScoreWidth(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
  }

  function clearFile() {
    file = null;
    previewUrl = "";
    analysisPromise = null;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }

  const modeConfig = {
    analyze: {
      title: "Complete Analysis",
      description: "Get comprehensive insights including objects, tags, colors, and descriptions",
      icon: "🧠",
      color: "from-purple-500 to-pink-500"
    },
    detect: {
      title: "Object Detection", 
      description: "Identify and locate specific objects within your image",
      icon: "🎯",
      color: "from-blue-500 to-cyan-500"
    },
    describe: {
      title: "Smart Description",
      description: "Generate natural language descriptions of your image content",
      icon: "📝",
      color: "from-green-500 to-teal-500"
    }
  };
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-4">
        AI Vision Studio
      </h1>
      <p class="text-xl text-purple-200">Unlock the secrets hidden in your images with advanced AI</p>
    </div>

    <!-- Main Content -->
    <div class="grid lg:grid-cols-3 gap-8">
      
      <!-- Upload & Settings -->
      <div class="lg:col-span-1 space-y-6">
        
        <!-- Mode Selection -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <h2 class="text-xl font-bold text-white mb-4">Analysis Mode</h2>
          <div class="space-y-3">
            {#each Object.entries(modeConfig) as [key, config]}
              <label class="group block cursor-pointer">
                <input type="radio" bind:group={mode} value={key} class="sr-only" onchange={reanalyze} />
                <div class="p-4 rounded-xl border-2 transition-all duration-200 {mode === key ? 'border-white bg-white/20' : 'border-white/30 hover:border-white/50 hover:bg-white/10'}">
                  <div class="flex items-start space-x-3">
                    <span class="text-2xl">{config.icon}</span>
                    <div class="flex-1">
                      <h3 class="font-semibold text-white group-hover:text-purple-200 transition-colors">
                        {config.title}
                      </h3>
                      <p class="text-sm text-purple-200 mt-1">{config.description}</p>
                    </div>
                  </div>
                </div>
              </label>
            {/each}
          </div>
        </div>

        <!-- Upload Area -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <h2 class="text-xl font-bold text-white mb-4">Upload Image</h2>
          
          {#if !file}
            <button 
              class="relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 {dragOver ? 'border-purple-400 bg-purple-500/20' : 'border-white/30 hover:border-white/50'}"
              ondrop={handleDrop}
              ondragover={handleDragOver}
              ondragleave={handleDragLeave}
            >
              <div class="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="relative z-10">
                <svg class="mx-auto h-16 w-16 text-white/70 mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path stroke-width="2" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"/>
                </svg>
                <p class="text-xl font-medium text-white mb-2">Drop your image here</p>
                <p class="text-purple-200 mb-4">or click to browse files</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  onchange={handleFileSelect}
                  class="hidden"
                  id="file-input"
                />
                <label 
                  for="file-input"
                  class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl cursor-pointer hover:from-purple-500 hover:to-pink-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Choose File
                </label>
              </div>
            </button>
          {:else}
            <div class="space-y-4">
              <div class="relative group">
                <img src={previewUrl} alt="Preview" class="w-full h-48 object-cover rounded-xl shadow-lg" />
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <button 
                    onclick={clearFile}
                    class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <div>
                  <p class="text-white font-medium truncate">{file.name}</p>
                  <p class="text-purple-200 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onclick={reanalyze}
                  class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-400 hover:to-cyan-400 transition-all duration-200"
                >
                  Re-analyze
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Results -->
      <div class="lg:col-span-2">
        {#if analysisPromise}
          {#await analysisPromise}
            <!-- Loading State -->
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 h-96 flex items-center justify-center">
              <div class="text-center">
                <div class="relative">
                  <div class="w-20 h-20 border-4 border-purple-300/30 rounded-full"></div>
                  <div class="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                </div>
                <h3 class="text-2xl font-bold text-white mt-6 mb-2">Analyzing Your Image</h3>
                <p class="text-purple-200">Our AI is examining every detail...</p>
              </div>
            </div>
          {:then result}
            <!-- Success State -->
            {#if result.error}
              <div class="bg-red-500/20 backdrop-blur-lg rounded-2xl border border-red-400/30 p-8">
                <div class="flex items-center text-red-200">
                  <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div>
                    <h3 class="text-xl font-bold">Analysis Failed</h3>
                    <p>{result.error}</p>
                  </div>
                </div>
              </div>
            {:else}
              <div class="space-y-6">
                
                <!-- Quick Stats -->
                {#if result.metadata}
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 text-center">
                      <div class="text-3xl font-bold text-white">{result.metadata.width}px</div>
                      <div class="text-purple-200 text-sm">Width</div>
                    </div>
                    <div class="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 text-center">
                      <div class="text-3xl font-bold text-white">{result.metadata.height}px</div>
                      <div class="text-purple-200 text-sm">Height</div>
                    </div>
                    <div class="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 text-center">
                      <div class="text-3xl font-bold text-white">{result.metadata.format}</div>
                      <div class="text-purple-200 text-sm">Format</div>
                    </div>
                    <div class="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 text-center">
                      <div class="text-3xl font-bold text-white">{result.tags?.length || 0}</div>
                      <div class="text-purple-200 text-sm">Tags Found</div>
                    </div>
                  </div>
                {/if}

                <!-- Main Content Grid -->
                <div class="grid md:grid-cols-2 gap-6">
                  
                  <!-- Categories -->
                  {#if result.categories?.length}
                    <div class="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                      <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                        <span class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">🏷️</span>
                        Categories
                      </h3>
                      <div class="space-y-3">
                        {#each result.categories as category}
                          <div class="bg-white/10 rounded-xl p-4">
                            <div class="flex justify-between items-center mb-2">
                              <span class="text-white font-medium capitalize">{category.name.replace('_', ' ')}</span>
                              <span class="px-3 py-1 {getConfidenceColor(category.score)} rounded-full text-sm font-medium border">
                                {formatConfidence(category.score)}
                              </span>
                            </div>
                            <div class="w-full bg-white/20 rounded-full h-2">
                              <div class="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-1000" style="width: {getScoreWidth(category.score)}"></div>
                            </div>
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/if}

                  <!-- Description -->
                  {#if result.description?.captions?.length}
                    <div class="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                      <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                        <span class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">📝</span>
                        AI Description
                      </h3>
                      {#each result.description.captions as caption}
                        <div class="bg-white/10 rounded-xl p-4 mb-3">
                          <p class="text-white text-lg leading-relaxed mb-3">"{caption.text}"</p>
                          <div class="flex items-center justify-between">
                            <span class="text-cyan-200 text-sm">Confidence Level</span>
                            <span class="px-3 py-1 {getConfidenceColor(caption.confidence)} rounded-full text-sm font-medium border">
                              {formatConfidence(caption.confidence)}
                            </span>
                          </div>
                        </div>
                      {/each}
                    </div>
                  {/if}

                  <!-- Objects -->
                  {#if result.objects?.length}
                    <div class="md:col-span-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                      <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                        <span class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">🎯</span>
                        Detected Objects
                      </h3>
                      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {#each result.objects as object}
                          <div class="bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-all duration-200 group">
                            <div class="flex items-center justify-between mb-3">
                              <h4 class="text-white font-semibold capitalize">{object.object}</h4>
                              <span class="px-2 py-1 {getConfidenceColor(object.confidence)} rounded-full text-xs font-medium border">
                                {formatConfidence(object.confidence)}
                              </span>
                            </div>
                            <div class="space-y-2 text-sm">
                              <div class="flex justify-between text-emerald-200">
                                <span>Position:</span>
                                <span>({object.rectangle.x}, {object.rectangle.y})</span>
                              </div>
                              <div class="flex justify-between text-emerald-200">
                                <span>Size:</span>
                                <span>{object.rectangle.w} × {object.rectangle.h}</span>
                              </div>
                              {#if object.parent}
                                <div class="pt-2 border-t border-white/20">
                                  <span class="text-xs text-green-300">Parent: {object.parent.object}</span>
                                </div>
                              {/if}
                            </div>
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/if}

                  <!-- Tags Cloud -->
                  {#if result.tags?.length}
                    <div class="md:col-span-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                      <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                        <span class="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">🏃</span>
                        Smart Tags ({result.tags.length} found)
                      </h3>
                      <div class="flex flex-wrap gap-3">
                        {#each result.tags.slice(0, 20) as tag}
                          <div class="group relative">
                            <span class="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-white text-sm font-medium transition-all duration-200 cursor-pointer">
                              {tag.name}
                              <span class="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs {tag.confidence > 0.8 ? 'text-green-300' : tag.confidence > 0.6 ? 'text-yellow-300' : 'text-red-300'}">
                                {formatConfidence(tag.confidence)}
                              </span>
                            </span>
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/if}

                  <!-- Colors -->
                  {#if result.color}
                    <div class="md:col-span-2 bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                      <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                        <span class="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center mr-3">🎨</span>
                        Color Analysis
                      </h3>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-white/10 rounded-xl p-4 text-center">
                          <div class="w-16 h-16 mx-auto rounded-full border-4 border-white/30 mb-3" style="background-color: #{result.color.accentColor}"></div>
                          <div class="text-white font-semibold">Accent</div>
                          <div class="text-pink-200 text-sm">#{result.color.accentColor}</div>
                        </div>
                        <div class="bg-white/10 rounded-xl p-4 text-center">
                          <div class="text-2xl mb-2">🎭</div>
                          <div class="text-white font-semibold">Foreground</div>
                          <div class="text-pink-200 text-sm">{result.color.dominantColorForeground}</div>
                        </div>
                        <div class="bg-white/10 rounded-xl p-4 text-center">
                          <div class="text-2xl mb-2">🖼️</div>
                          <div class="text-white font-semibold">Background</div>
                          <div class="text-pink-200 text-sm">{result.color.dominantColorBackground}</div>
                        </div>
                        <div class="bg-white/10 rounded-xl p-4 text-center">
                          <div class="text-2xl mb-2">{result.color.isBwImg ? '⚫' : '🌈'}</div>
                          <div class="text-white font-semibold">Type</div>
                          <div class="text-pink-200 text-sm">{result.color.isBwImg ? 'B&W' : 'Color'}</div>
                        </div>
                      </div>
                    </div>
                  {/if}

                </div>
              </div>
            {/if}
          {:catch error}
            <!-- Error State -->
            <div class="bg-red-500/20 backdrop-blur-lg rounded-2xl border border-red-400/30 p-8">
              <div class="flex items-center text-red-200">
                <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <h3 class="text-xl font-bold">Something went wrong</h3>
                  <p>{error.message}</p>
                  <button 
                    onclick={reanalyze}
                    class="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          {/await}
        {:else}
          <!-- Welcome State -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-12 text-center h-96 flex items-center justify-center">
            <div>
              <div class="text-6xl mb-6">🔮</div>
              <h3 class="text-2xl font-bold text-white mb-4">Ready to Reveal Image Secrets?</h3>
              <p class="text-purple-200 text-lg">Upload an image to start your AI-powered analysis journey</p>
            </div>
          </div>
        {/if}
      </div>

    </div>
  </div>
</div>