import React, { useEffect, useRef, useState } from "react";

function ProposalModal({
  show,
  handleClose,
  handleSubmit,
  modalMode,
  formData,
  handleFormChange,
  picList,
}) {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  if (!show) {
    return null;
  }

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Perangkat tidak mendukung akses kamera.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setShowCamera(true);
    } catch (err) {
      alert("Tidak dapat mengakses kamera: " + err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "bukti-foto.jpg", { type: "image/jpeg" });
        // Simulasikan event untuk handleFormChange
        handleFormChange({
          target: { name: "file_pendukung", type: "file", files: [file] },
        });
        setCapturedPreview(URL.createObjectURL(blob));
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  useEffect(() => {
    // Cleanup ketika modal ditutup
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {modalMode === "add" ? "Tambah Proposal Baru" : "Edit Proposal"}
          </h3>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Section: Informasi Dasar */}
          <div className="form-section">
            <h4>Informasi Dasar</h4>
            <div className="form-group">
              <label>Nama Proposal *</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleFormChange}
                required
              />
            </div>
            {/* ... tambahkan semua input form Anda yang lain di sini ... */}
            <div className="form-group">
              <label>PIC (Person in Charge) *</label>
              <select
                name="pic_id"
                value={formData.pic_id}
                onChange={handleFormChange}
                required
              >
                <option value="">Pilih PIC</option>
                {picList.map((pic) => (
                  <option key={pic.id_pic} value={pic.id_pic}>
                    {pic.nama_pic}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>File Pendukung</label>
              <input
                type="file"
                name="file_pendukung"
                accept="image/*"
                capture="environment"
                onChange={handleFormChange}
              />
              <div className="mt-2">
                {!showCamera && (
                  <button
                    type="button"
                    className="view-toggle-btn"
                    onClick={startCamera}
                    style={{ marginRight: "0.5rem" }}
                  >
                    Gunakan Kamera
                  </button>
                )}
                {showCamera && (
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={stopCamera}
                    style={{ marginRight: "0.5rem" }}
                  >
                    Tutup Kamera
                  </button>
                )}
              </div>
              {showCamera && (
                <div className="mt-2">
                  <video
                    ref={videoRef}
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                  <div className="mt-2" style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className="add-button"
                      onClick={handleCapture}
                    >
                      Ambil Foto
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={stopCamera}
                    >
                      Batal
                    </button>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
              {capturedPreview && (
                <div className="mt-2">
                  <img
                    src={capturedPreview}
                    alt="Preview Bukti"
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={handleClose} className="btn-cancel">
              Batal
            </button>
            <button type="submit" className="btn-submit">
              {modalMode === "add" ? "Tambah Proposal" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Catatan: Pastikan nama file Anda 'ProposalModal.jsx' bukan 'Proposal Modal.jsx'
// Nama file tidak boleh mengandung spasi.
export default ProposalModal;
