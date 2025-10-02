<template>
  <div class="pdf-viewer-with-watermark">
    <!-- Loading Overlay -->
    <div v-if="isProcessing || isRendering" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
    </div>

    <!-- PDF Viewer -->
    <pdf-viewer
      v-show="!isProcessing && !isRendering"
      :pdf="processedPdf || originalPdf"
      :config="config"
      :title="title"
      :theme="theme"
      :fileName="fileName"
      :idConfig="idConfig"
      :pageScale="pageScale"
      :pageNumber="pageNumber"
      @after-created="onAfterCreated"
      @open="onOpen"
      @pages-rendered="onPagesRendered"
    >
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </pdf-viewer>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from "vue";
import PdfViewer from "vue3-pdf-app";
import {
  addTextWatermark,
  addImageWatermark,
  addMultipleTextWatermarks,
} from "../utils/watermark";

export default defineComponent({
  name: "PdfViewerWithWatermark",
  components: {
    PdfViewer,
  },
  props: {
    pdf: {
      type: [String, ArrayBuffer],
      required: true,
    },
    config: {
      type: Object,
      default: () => ({}),
    },
    title: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      default: "dark",
    },
    fileName: {
      type: String,
      default: "",
    },
    idConfig: {
      type: Object,
      default: () => ({}),
    },
    pageScale: {
      type: [Number, String],
      default: "auto",
    },
    pageNumber: {
      type: Number,
      default: 1,
    },
    showControls: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["after-created", "open", "pages-rendered"],
  setup(props, ctx) {
    const originalPdf = ref(props.pdf);
    const processedPdf = ref(null);
    const isProcessing = ref(false);
    const isRendering = ref(false);
    const watermarkType = ref("text");

    const textOptions = ref({
      text: "CONFIDENTIAL",
      fontSize: 48,
      color: { r: 1, g: 0, b: 0 },
      opacity: 0.3,
      rotation: -45,
      position: "center",
    });

    const imageOptions = ref({
      imageUrl: "",
      opacity: 0.3,
      rotation: 0,
      position: "center",
      width: 200,
      height: 200,
    });

    const multipleOptions = ref({
      text: "CONFIDENTIAL",
      fontSize: 24,
      color: { r: 1, g: 0, b: 0 },
      opacity: 0.1,
      rotation: -45,
      spacing: 200,
    });

    const textColor = ref("#ff0000");
    const multipleTextColor = ref("#ff0000");

    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
          }
        : { r: 1, g: 0, b: 0 };
    };

    watch(textColor, (newColor) => {
      textOptions.value.color = hexToRgb(newColor);
    });

    watch(multipleTextColor, (newColor) => {
      multipleOptions.value.color = hexToRgb(newColor);
    });

    const onWatermarkTypeChange = () => {
      processedPdf.value = null;
    };

    const applyWatermark = async () => {
      if (!props.pdf || watermarkType.value === "none") {
        processedPdf.value = null;
        return;
      }

      isProcessing.value = true;

      try {
        let pdfBytes;

        if (typeof props.pdf === "string") {
          const response = await fetch(props.pdf);
          pdfBytes = await response.arrayBuffer();
        } else {
          pdfBytes = props.pdf;
        }

        let result;

        switch (watermarkType.value) {
          case "text":
            result = await addTextWatermark(pdfBytes, textOptions.value);
            break;
          case "image":
            if (!imageOptions.value.imageUrl) {
              throw new Error("URL изображения не указан");
            }
            result = await addImageWatermark(pdfBytes, imageOptions.value);
            break;
          case "multiple":
            result = await addMultipleTextWatermarks(
              pdfBytes,
              multipleOptions.value
            );
            break;
          default:
            result = new Uint8Array(pdfBytes);
        }

        processedPdf.value = result.buffer;
      } catch (error) {
        console.error("Ошибка при добавлении водяного знака:", error);
        alert(`Ошибка: ${error}`);
      } finally {
        isProcessing.value = false;
      }
    };

    const resetWatermark = () => {
      watermarkType.value = "none";
      processedPdf.value = null;
    };

    const debugInfo = () => {
      console.log("=== DEBUG INFO ===");
      console.log("PDF Source:", props.pdf);
      console.log("Original PDF:", originalPdf.value);
      console.log("Processed PDF:", processedPdf.value);
      console.log("Watermark Type:", watermarkType.value);
      console.log("Text Options:", textOptions.value);
      console.log("Image Options:", imageOptions.value);
      console.log("Multiple Options:", multipleOptions.value);
      console.log("Is Processing:", isProcessing.value);
      console.log("Is Rendering:", isRendering.value);
      console.log("==================");
    };

    const onAfterCreated = (pdfApp) => {
      ctx.emit("after-created", pdfApp);
    };

    const onOpen = (pdfApp) => {
      isRendering.value = true;
      ctx.emit("open", pdfApp);
    };

    const onPagesRendered = (pdfApp) => {
      console.log("Страницы отрендерены:", pdfApp);
      isRendering.value = false;
      ctx.emit("pages-rendered", pdfApp);
    };

    onMounted(() => {
      if (props.pdf && watermarkType.value !== "none") {
        setTimeout(() => {
          applyWatermark();
        }, 1000);
      }
    });

    watch(
      () => props.pdf,
      () => {
        originalPdf.value = props.pdf;
        processedPdf.value = null;
        if (props.pdf && watermarkType.value !== "none") {
          setTimeout(() => {
            applyWatermark();
          }, 500);
        }
      }
    );

    return {
      originalPdf,
      processedPdf,
      isProcessing,
      isRendering,
      watermarkType,
      textOptions,
      imageOptions,
      multipleOptions,
      textColor,
      multipleTextColor,
      onWatermarkTypeChange,
      applyWatermark,
      resetWatermark,
      debugInfo,
      onAfterCreated,
      onOpen,
      onPagesRendered,
    };
  },
});
</script>

<style lang="scss" scoped>
.pdf-viewer-with-watermark {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  text-align: center;
  color: #333;

  p {
    margin-top: 20px;
    font-size: 16px;
    font-weight: 500;
  }
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.watermark-controls {
  background: #f5f5f5;
  padding: 15px;
  border-bottom: 1px solid #ddd;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: flex-end;
  max-height: 200px;
  overflow-y: auto;

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 150px;

    label {
      font-size: 12px;
      font-weight: bold;
      color: #333;
    }

    input,
    select {
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 3px;
      font-size: 12px;
    }

    input[type="range"] {
      width: 100px;
    }

    span {
      font-size: 11px;
      color: #666;
    }
  }

  .apply-button,
  .reset-button,
  .debug-button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    transition: background-color 0.2s;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .apply-button {
    background: #007bff;
    color: white;

    &:hover:not(:disabled) {
      background: #0056b3;
    }
  }

  .reset-button {
    background: #6c757d;
    color: white;

    &:hover {
      background: #545b62;
    }
  }

  .debug-button {
    background: #28a745;
    color: white;

    &:hover {
      background: #218838;
    }
  }

  .status-indicator {
    margin-bottom: 10px;
    font-size: 12px;
    font-weight: bold;

    .status-applied {
      color: #28a745;
    }

    .status-processing {
      color: #ffc107;
    }

    .status-none {
      color: #dc3545;
    }
  }
}

// Адаптивность
@media (max-width: 768px) {
  .watermark-controls {
    flex-direction: column;
    align-items: stretch;
    max-height: none;

    .control-group {
      min-width: auto;
    }
  }
}
</style>
