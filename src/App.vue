<template>
  <div class="watermark-example">
    <!-- PDF Viewer -->
    <div class="pdf-container">
      <pdf-viewer-with-watermark
        v-if="pdfSource"
        ref="pdfViewer"
        :pdf="pdfSource"
        :show-controls="true"
        @after-created="onAfterCreated"
        @open="onOpen"
        @pages-rendered="onPagesRendered"
      />
      <div v-else class="no-pdf">Завантаження PDF...</div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import PdfViewerWithWatermark from "./components/pdf-viewer-with-watermark.vue";

export default defineComponent({
  name: "WatermarkExample",
  components: {
    PdfViewerWithWatermark,
  },
  setup() {
    const pdfSource = ref(
      "https://litmir.club/BookFileDownloadLink/?id=2563528&inline=1"
    );

    const onAfterCreated = (pdfApp) => {
      console.log("PDF приложение создано:", pdfApp);
    };

    const onOpen = (pdfApp) => {
      console.log("PDF открыт:", pdfApp);
    };

    const onPagesRendered = (pdfApp) => {
      console.log("Страницы отрендерены:", pdfApp);
    };

    return {
      pdfSource,
      onAfterCreated,
      onOpen,
      onPagesRendered,
    };
  },
});
</script>

<style lang="scss" scoped>
.watermark-example {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #f8f9fa;
}

h1 {
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
}

.example-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    flex: 1;

    label {
      font-weight: bold;
      color: #555;
      font-size: 14px;
    }

    input {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }
    }
  }
}

.pdf-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 500px;
}

.no-pdf {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 18px;
}

.examples {
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;

  h2 {
    margin: 0 0 20px 0;
    color: #333;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
  }

  .example-section {
    margin-bottom: 30px;

    h3 {
      margin: 0 0 10px 0;
      color: #555;
      font-size: 16px;
    }

    pre {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 15px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.4;

      code {
        color: #333;
        font-family: "Courier New", monospace;
      }
    }
  }
}

// Адаптивность
@media (max-width: 768px) {
  .watermark-example {
    padding: 10px;
  }

  .example-controls {
    flex-direction: column;
    gap: 15px;
  }

  .examples {
    padding: 15px;

    pre {
      font-size: 11px;
      padding: 10px;
    }
  }
}
</style>
