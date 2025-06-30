let qrCode = null;
let cropperInstance = null;
let selectedShape = "square";
let croppedLogoData = null;

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById("logoInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  document.getElementById("cropImage").src = url;
  document.getElementById("cropModal").classList.remove("hidden");

  if (cropperInstance) cropperInstance.destroy();
  cropperInstance = new Cropper(document.getElementById("cropImage"), {
    viewMode: 1,
    aspectRatio: 1,
    autoCropArea: 1
  });
});

document.querySelectorAll('input[name="shape"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    selectedShape = e.target.value;
  });
});

document.getElementById("cropDoneBtn").addEventListener("click", () => {
  const canvas = cropperInstance.getCroppedCanvas({
    width: 300,
    height: 300,
    imageSmoothingQuality: "high"
  });

  if (!canvas) return;

  if (selectedShape === "circle") {
    const circleCanvas = document.createElement("canvas");
    const size = 300;
    circleCanvas.width = size;
    circleCanvas.height = size;

    const ctx = circleCanvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(canvas, 0, 0);

    croppedLogoData = circleCanvas.toDataURL();
  } else {
    croppedLogoData = canvas.toDataURL();
  }

  cropperInstance.destroy();
  document.getElementById("cropModal").classList.add("hidden");
});

document.getElementById("qrForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = document.getElementById("qrData").value;
  const filename = document.getElementById("filename").value || "QRCode";
  const size = parseInt(document.getElementById("sizeInput").value);
  const dotColor = document.getElementById("dotColor").value;
  const dotType = document.getElementById("dotType").value;

  let logoImage = null;

  const logoInput = document.getElementById("logoInput");
  if (logoInput.files.length > 0) {
    if (croppedLogoData) {
      logoImage = croppedLogoData;
    } else {
      logoImage = await toBase64(logoInput.files[0]);
    }
  }

  if (qrCode) {
    document.getElementById("qr-code").innerHTML = "";
  }

  qrCode = new QRCodeStyling({
    width: size,
    height: size,
    data: data,
    dotsOptions: {
      color: dotColor,
      type: dotType
    },
    image: logoImage,
    imageOptions: {
      crossOrigin: "anonymous",
      hideBackgroundDots: false,
      imageSize: size ? 0.3 : 0.5,
    }
  });

  qrCode.append(document.getElementById("qr-code"));
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const filename = document.getElementById("filename").value || "QRCode";
  if (qrCode) {
    qrCode.download({ name: `${filename}-with-js`, extension: "png" });
  }
});
