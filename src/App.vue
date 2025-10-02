<template>
  <div class="watermark-example">
    <!-- PDF Viewer -->
    <div class="pdf-container">
      <pdf-viewer-with-watermark
        ref="pdfViewer"
        :server-url="serverUrl"
        :title="true"
        @after-created="onAfterCreated"
        @open="onOpen"
        @pages-rendered="onPagesRendered"
      />
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
    const serverUrl = ref("https://cool-ends-fold.loca.lt");

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
      serverUrl,
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
  background: #f8f9fa;
}

h1 {
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
}

.watermark-controls {
  background: #f8f9fa;
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 150px;

    label {
      font-size: 12px;
      font-weight: bold;
      color: #495057;
      display: flex;
      align-items: center;
      gap: 8px;

      input[type="checkbox"] {
        margin: 0;
        width: auto;
      }
    }

    input[type="text"] {
      padding: 6px 8px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 12px;
    }

    input[type="range"] {
      width: 120px;
    }

    span {
      font-size: 11px;
      color: #6c757d;
      font-weight: 500;
    }
  }
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
  min-height: 500px;
  position: relative;
}

.no-pdf {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 18px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  p {
    font-size: 16px;
    margin: 0;
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

  .status-text {
    font-size: 12px;
    color: #007bff;
    margin: 10px 0 0 0;
    font-weight: 500;
  }
}

.error {
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
