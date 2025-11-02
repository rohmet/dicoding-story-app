export default class Camera {
  #video;
  #cameraSelect;
  #canvas;
  #stream;

  constructor({ video, cameraSelect, canvas }) {
    this.#video = video;
    this.#cameraSelect = cameraSelect;
    this.#canvas = canvas;
    this.#stream = null;
  }

  /**
   * Memulai stream kamera dan mengisi opsi <select>
   */
  async launch() {
    try {
      this.#stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Prioritaskan kamera belakang
        audio: false,
      });

      this.#video.srcObject = this.#stream;
      this.#video.play();

      await this.#populateCameraSelect();
    } catch (error) {
      console.error("Error launching camera:", error);
      alert("Tidak dapat mengakses kamera. Pastikan Anda memberi izin.");
    }
  }

  /**
   * Mengisi <select> dengan semua perangkat kamera yang tersedia
   */
  async #populateCameraSelect() {
    if (
      !("mediaDevices" in navigator) ||
      !navigator.mediaDevices.enumerateDevices
    ) {
      console.warn("enumerateDevices() is not supported.");
      return;
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    const currentStreamTrack = this.#stream.getVideoTracks()[0];
    const currentDeviceId = currentStreamTrack.getSettings().deviceId;

    this.#cameraSelect.innerHTML = "";
    videoDevices.forEach((device) => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.text = device.label || `Kamera ${this.#cameraSelect.length + 1}`;
      option.selected = device.deviceId === currentDeviceId;
      this.#cameraSelect.appendChild(option);
    });

    // Tambahkan listener untuk ganti kamera
    this.#cameraSelect.addEventListener("change", () => {
      this.#switchCamera(this.#cameraSelect.value);
    });
  }

  /**
   * Beralih ke kamera yang berbeda berdasarkan deviceId
   */
  async #switchCamera(deviceId) {
    this.stop(); // Hentikan stream lama
    this.#stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
      audio: false,
    });
    this.#video.srcObject = this.#stream;
    this.#video.play();
  }

  /**
   * Menghentikan semua stream kamera
   */
  stop() {
    if (this.#stream) {
      this.#stream.getTracks().forEach((track) => track.stop());
      this.#video.srcObject = null;
    }
  }

  /**
   * Mengambil gambar dari <video> ke <canvas> dan mengembalikannya
   * sebagai Base64 string.
   */
  takePicture() {
    const context = this.#canvas.getContext("2d");
    this.#canvas.width = this.#video.videoWidth;
    this.#canvas.height = this.#video.videoHeight;
    context.drawImage(
      this.#video,
      0,
      0,
      this.#canvas.width,
      this.#canvas.height
    );

    // Kembalikan sebagai base64 string (seperti di Proyek 2)
    return this.#canvas.toDataURL("image/jpeg");
  }

  /**
   * Helper untuk menambahkan listener ke tombol "Ambil Gambar"
   */
  addCheeseButtonListener(selector, callback) {
    document.querySelector(selector).addEventListener("click", callback);
  }
}
