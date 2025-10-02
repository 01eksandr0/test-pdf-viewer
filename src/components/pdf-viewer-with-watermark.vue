<template>
  <div class="pdf-viewer-with-watermark">
    <!-- Loading Overlay -->
    <div v-if="isProcessing || isRendering" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Обработка PDF...</p>
        <div v-if="progress > 0" class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <div v-if="progress > 0" class="progress-text">{{ progress }}%</div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-display">
      <h3>Ошибка загрузки PDF</h3>
      <p>{{ error }}</p>
      <button @click="loadAndProcessPdf" class="retry-btn">Повторить</button>
    </div>

    <!-- PDF Viewer -->
    <pdf-viewer
      v-show="!isProcessing && !isRendering && !error"
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
import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
} from "vue";
import PdfViewer from "vue3-pdf-app";
import {
  addTextWatermark,
  addImageWatermark,
  addMultipleTextWatermarks,
} from "../utils/watermark";
import {
  fetchAndDecryptPdf,
  createPdfBlobUrl,
  revokePdfBlobUrl,
} from "../utils/crypto";

export default defineComponent({
  name: "PdfViewerWithWatermark",
  components: {
    PdfViewer,
  },
  props: {
    serverUrl: {
      type: String,
      default: "http://localhost:3000",
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
  },
  emits: ["after-created", "open", "pages-rendered"],
  setup(props, ctx) {
    const originalPdf = ref(null);
    const processedPdf = ref(null);
    const isProcessing = ref(false);
    const isRendering = ref(false);
    const error = ref(null);
    const progress = ref(0);

    // Предустановленные настройки водяного знака
    const watermarkConfig = ref({
      text: "CONFIDENTIAL",
      fontSize: 48,
      color: { r: 1, g: 0, b: 0 },
      opacity: 0.3,
      rotation: -45,
      position: "center",
    });

    const loadAndProcessPdf = async () => {
      try {
        isProcessing.value = true;
        error.value = null;
        progress.value = 0;

        console.log("Загрузка и расшифровка PDF...");

        // Получаем и расшифровываем PDF с отслеживанием прогресса
        const decryptedBuffer = await fetchAndDecryptPdf(
          props.serverUrl,
          (progressValue) => {
            progress.value = progressValue;
          }
        );

        progress.value = 75;
        console.log("PDF расшифрован, накладываем водяной знак...");

        let finalPdfBuffer = decryptedBuffer;
        try {
          const watermarkedPdf = await addTextWatermark(
            decryptedBuffer,
            watermarkConfig.value
          );
          finalPdfBuffer = watermarkedPdf.buffer;
          console.log("Водяной знак успешно наложен");
        } catch (watermarkError) {
          console.warn("Ошибка при наложении водяного знака:", watermarkError);
        }

        progress.value = 90;

        const blobUrl = createPdfBlobUrl(finalPdfBuffer);
        originalPdf.value = blobUrl;
        processedPdf.value = blobUrl;

        progress.value = 100;
        console.log(
          "PDF успешно загружен, расшифрован и защищен водяным знаком"
        );
      } catch (err) {
        console.error("Ошибка при загрузке PDF:", err);
        error.value = err.message;
      } finally {
        isProcessing.value = false;
        progress.value = 0;
      }
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
      loadAndProcessPdf();
    });

    onUnmounted(() => {
      // Очищаем blob URL при размонтировании компонента
      if (originalPdf.value && originalPdf.value.startsWith("blob:")) {
        revokePdfBlobUrl(originalPdf.value);
      }
    });

    return {
      originalPdf,
      processedPdf,
      isProcessing,
      isRendering,
      error,
      progress,
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

.progress-bar {
  width: 300px;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin: 15px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  font-size: 14px;
  color: #666;
  margin: 5px 0 0 0;
}

.error-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #dc3545;
  text-align: center;
  padding: 20px;

  h3 {
    margin: 0 0 10px 0;
    color: #dc3545;
  }

  p {
    margin: 0 0 20px 0;
    font-size: 14px;
    color: #666;
  }

  .retry-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background: #0056b3;
    }
  }
}

// Адаптивность
@media (max-width: 768px) {
  .pdf-viewer-with-watermark {
    padding: 10px;
  }

  .progress-bar {
    width: 250px;
  }
}
</style>
