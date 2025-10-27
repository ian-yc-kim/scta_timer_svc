/* Test setup: polyfill CustomEvent for older jsdom if needed */
if (typeof (window as any).CustomEvent !== 'function') {
  class CustomEventPolyfill extends Event {
    detail: any;
    constructor(type: string, params?: { detail?: any }) {
      super(type);
      this.detail = params?.detail;
    }
  }
  (window as any).CustomEvent = CustomEventPolyfill;
}
