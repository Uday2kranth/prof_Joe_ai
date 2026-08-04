package com.udaykranth.ai;

import android.content.Context;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "ProfJoeAI";
    private AndroidPrintBridge printBridge;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            printBridge = new AndroidPrintBridge(this, webView);
            webView.addJavascriptInterface(printBridge, "AndroidPrintBridge");
        } else {
            Log.w(TAG, "Capacitor bridge not ready; print bridge deferred");
        }
    }

    public AndroidPrintBridge getPrintBridge() {
        return printBridge;
    }

    public static class AndroidPrintBridge {
        private final Context context;
        private final WebView webView;

        public AndroidPrintBridge(Context context, WebView webView) {
            this.context = context;
            this.webView = webView;
        }

        @JavascriptInterface
        public void print() {
            if (context != null && webView != null) {
                webView.post(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            PrintManager printManager = (PrintManager) context.getSystemService(Context.PRINT_SERVICE);
                            if (printManager != null) {
                                String jobName = "Prof_Joe_AI_Document_" + System.currentTimeMillis();
                                PrintDocumentAdapter printAdapter = webView.createPrintDocumentAdapter(jobName);
                                PrintAttributes attributes = new PrintAttributes.Builder()
                                        .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                        .setColorMode(PrintAttributes.COLOR_MODE_COLOR)
                                        .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                                        .build();
                                printManager.print(jobName, printAdapter, attributes);
                            }
                        } catch (Exception e) {
                            Log.e(TAG, "Print execution failed", e);
                        }
                    }
                });
            }
        }
    }
}
