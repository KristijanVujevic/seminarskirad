import React, { useState } from "react";
import Modal from "react-modal";

const ImageModal = ({ imageUrl, onClose }) => {
  return (
    <Modal isOpen={!!imageUrl} onRequestClose={onClose}>
      <img
        src={imageUrl}
        alt="Full-size Image"
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      />
      <button onClick={onClose}>Close</button>
    </Modal>
  );
};

export default ImageModal;
